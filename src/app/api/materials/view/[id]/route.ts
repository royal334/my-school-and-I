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

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    const material = await getMaterialById(id, supabase);

    if (!material) {
      return new NextResponse("Not Found", { status: 404 });
    }

    if (!material.file_path) {
      return new NextResponse("File not found", { status: 404 });
    }

    // Generate a signed URL from Supabase Storage (valid for 60 seconds)
    const { data: signedUrlData, error: signedUrlError } =
      await supabase.storage
        .from("materials")
        .createSignedUrl(material.file_path, 60);

    if (signedUrlError || !signedUrlData?.signedUrl) {
      console.error("Signed URL error:", signedUrlError);
      return new NextResponse("Failed to generate file URL", { status: 500 });
    }

    // Return the signed URL as JSON
    return NextResponse.json({ url: signedUrlData.signedUrl });
  } catch (error) {
    console.error("View route error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
