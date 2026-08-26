import { createClient } from "npm:@supabase/supabase-js@2";

const FIREBASE_PROJECT_ID = Deno.env.get("FIREBASE_PROJECT_ID")!;
const FIREBASE_CLIENT_EMAIL = Deno.env.get("FIREBASE_CLIENT_EMAIL")!;
const FIREBASE_PRIVATE_KEY = Deno.env.get("FIREBASE_PRIVATE_KEY")!;

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SECRET_KEYS = JSON.parse(
  Deno.env.get("SUPABASE_SECRET_KEYS")!
);

const SUPABASE_SECRET_KEY = SUPABASE_SECRET_KEYS["default"];

const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SECRET_KEY
);

function base64UrlEncode(data: Uint8Array) {
  let binary = "";

  for (const byte of data) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function stringToUint8Array(value: string) {
  return new TextEncoder().encode(value);
}

async function createJwt() {
  const now = Math.floor(Date.now() / 1000);

  const header = {
    alg: "RS256",
    typ: "JWT",
  };

  const payload = {
    iss: FIREBASE_CLIENT_EMAIL,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const encodedHeader = base64UrlEncode(
    stringToUint8Array(JSON.stringify(header))
  );

  const encodedPayload = base64UrlEncode(
    stringToUint8Array(JSON.stringify(payload))
  );

  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  const privateKey = FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n");

  const pemContents = privateKey
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");

  const binaryKey = Uint8Array.from(
    atob(pemContents),
    (character) => character.charCodeAt(0)
  );

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey.buffer,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    stringToUint8Array(unsignedToken)
  );

  return `${unsignedToken}.${base64UrlEncode(
    new Uint8Array(signature)
  )}`;
}

async function getAccessToken() {
  const jwt = await createJwt();

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Google OAuth error:", data);

    throw new Error(
      data.error_description || "Failed to obtain Firebase access token"
    );
  }

  return data.access_token;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  try {
    const { token, tokens, title, body, data } = await req.json();

    // Support both the legacy single-token payload and the bulk payload.
    const deviceTokens = Array.from(
      new Set([
        ...(typeof token === "string" ? [token] : []),
        ...(Array.isArray(tokens)
          ? tokens.filter((value): value is string => typeof value === "string")
          : []),
      ].map((value) => value.trim()).filter(Boolean)),
    );

    if (deviceTokens.length === 0) {
      return new Response(
        JSON.stringify({
          error: "FCM token(s) are required",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (!title || !body) {
      return new Response(
        JSON.stringify({
          error: "title and body are required",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const accessToken = await getAccessToken();

    const results: { token: string; ok: boolean; error?: string }[] = [];

    // FCM v1 API sends one message per request — loop over all tokens.
    for (const t of deviceTokens) {
      try {
        const response = await fetch(
          `https://fcm.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/messages:send`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: {
                token: t,

                notification: {
                  title,
                  body,
                },

                data: data || {},
              },
            }),
          }
        );

        const result = await response.json();

        if (!response.ok) {
          console.error(`FCM error for token ${t.slice(0, 8)}...:`, result);
          results.push({
            token: t,
            ok: false,
            error: result.error?.message || JSON.stringify(result),
          });
        } else {
          results.push({ token: t, ok: true });
        }
      } catch (err) {
        results.push({
          token: t,
          ok: false,
          error: err instanceof Error ? err.message : "unknown",
        });
      }
    }

    const succeeded = results.filter((r) => r.ok).length;
    const failed = results.filter((r) => !r.ok).length;

    return new Response(
      JSON.stringify({
        success: succeeded > 0,
        succeeded,
        failed,
        total: deviceTokens.length,
        details: results,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Notification error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
});