import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  getMaterialById,
  recordMaterialDownload,
} from "@/utils/supabase/queries";

const RECORD_TIMEOUT_MS = 10_000;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = createClient(await cookies());

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    let material;
    try {
      material = await getMaterialById(id, supabase);
    } catch (lookupError) {
      console.error("Material lookup error:", lookupError);
      return new NextResponse("Not Found", { status: 404 });
    }

    if (!material) {
      return new NextResponse("Not Found", { status: 404 });
    }

    if (!material.file_path) {
      return new NextResponse("File not found", { status: 404 });
    }

    if (material.is_premium) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_status, subscription_expires_at")
        .eq("id", user.id)
        .single();

      const hasActiveSubscription =
        profile?.subscription_status === "active" &&
        profile?.subscription_expires_at &&
        new Date(profile.subscription_expires_at) > new Date();

      if (!hasActiveSubscription) {
        return new NextResponse("Forbidden", { status: 403 });
      }
    }

    const bucket = material.storage_bucket ?? "materials";

    const { data: urlData, error: storageError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(material.file_path, 60);

    if (storageError || !urlData?.signedUrl) {
      console.error("Signed URL error:", storageError);
      return new NextResponse("Failed to generate download URL", {
        status: 500,
      });
    }

    const response = await fetch(urlData.signedUrl);
    if (!response.ok) {
      return new NextResponse("Failed to download file", { status: 500 });
    }

    if (!response.body) {
      return new NextResponse("Failed to download file", { status: 500 });
    }

    const rawFileName: string =
      material.file_name || material.title || "download";
    const asciiFileName =
      rawFileName.replace(/[^\x20-\x7E]/g, "_").replace(/["\\]/g, "_") ||
      "download";

    const headers = new Headers({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${asciiFileName}"; filename*=UTF-8''${encodeURIComponent(
        rawFileName,
      )}`,
    });

    const contentLength = response.headers.get("content-length");
    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }

    // Record the download only once the file has been fully streamed through
    // to the client: flush() runs after every chunk has been consumed, and is
    // skipped entirely if the transfer errors or the client aborts, so
    // cancelled downloads are never counted.
    const { readable, writable } = new TransformStream<
      Uint8Array,
      Uint8Array
    >({
      flush: async () => {
        try {
          await Promise.race([
            recordMaterialDownload(id, user.id, {
              ipAddress: request.headers
                .get("x-forwarded-for")
                ?.split(",")[0]
                .trim() ?? null,
              userAgent: request.headers.get("user-agent"),
            }),
            new Promise<never>((_, reject) =>
              setTimeout(
                () =>
                  reject(
                    new Error(
                      `Timed out recording download for material ${id}`,
                    ),
                  ),
                RECORD_TIMEOUT_MS,
              ),
            ),
          ]);
        } catch (recordError) {
          console.error("Failed to record material download:", recordError);
        }
      },
    });

    response.body.pipeTo(writable).catch((streamError) => {
      console.error("Download stream error:", streamError);
    });

    return new NextResponse(readable, { headers });

  } catch (error) {
    console.error("Download route error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
