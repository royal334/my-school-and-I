import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getMaterialById } from "@/utils/supabase/queries";

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

    return new NextResponse(response.body, { headers });
      
  } catch (error) {
    console.error("Download route error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
