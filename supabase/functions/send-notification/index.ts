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

// Only codes that unambiguously identify the token itself as dead. INVALID_ARGUMENT
// is deliberately excluded: FCM also returns it for a malformed `data` payload, so
// pruning on it would delete valid tokens whenever a message body is malformed.
const DEAD_TOKEN_ERROR_CODES = new Set(["UNREGISTERED"]);

type SendResult = {
  token: string;
  ok: boolean;
  error?: string;
  errorCode?: string | null;
};

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function isValidLink(link: unknown): link is string {
  return (
    typeof link === "string" &&
    (link.startsWith("https://") || link.startsWith("http://localhost"))
  );
}

/**
 * Deletes tokens FCM has declared permanently dead. Without this the table
 * accumulates dead rows that fail on every send and skew the delivery report.
 */
async function pruneDeadTokens(results: SendResult[]): Promise<string[]> {
  const deadTokens = results
    .filter((result) => !result.ok && result.errorCode && DEAD_TOKEN_ERROR_CODES.has(result.errorCode))
    .map((result) => result.token);

  if (deadTokens.length === 0) return [];

  const { error } = await supabaseAdmin
    .from("user_notification_tokens")
    .delete()
    .in("device_token", deadTokens);

  if (error) {
    console.error("Failed to prune dead tokens:", error);
    return [];
  }

  console.log(`Pruned ${deadTokens.length} dead token(s) from user_notification_tokens`);

  return deadTokens;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const { token, tokens, title, body, data, link } = await req.json();

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
      return jsonResponse({ error: "FCM token(s) are required" }, 400);
    }

    if (!title || !body) {
      return jsonResponse({ error: "title and body are required" }, 400);
    }

    const accessToken = await getAccessToken();

    const results: SendResult[] = [];

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

                // Directs the service worker's notificationclick handler to a
                // real URL instead of falling back to the site root.
                ...(isValidLink(link)
                  ? { webpush: { fcmOptions: { link } } }
                  : {}),
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
            errorCode:
              result.error?.details?.[0]?.errorCode ??
              result.error?.status ??
              null,
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

    const prunedTokens = await pruneDeadTokens(results);

    const succeeded = results.filter((r) => r.ok).length;
    const failed = results.filter((r) => !r.ok).length;

    console.log(
      `FCM send complete: ${succeeded}/${deviceTokens.length} accepted, ${failed} failed, ${prunedTokens.length} tokens pruned`
    );

    // A total failure must not look like success. Returning 200 here is what
    // let the panel record deliveries that never reached a browser.
    return jsonResponse(
      {
        success: succeeded > 0,
        succeeded,
        failed,
        total: deviceTokens.length,
        pruned: prunedTokens.length,
        details: results,
      },
      succeeded > 0 ? 200 : 502
    );
  } catch (error) {
    console.error("Notification error:", error);

    return jsonResponse(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      500
    );
  }
});