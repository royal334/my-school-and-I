import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = createClient(await cookies());

  // Get material
  const { data: material, error: materialError } = await supabase
    .from("materials")
    .select("file_path")
    .eq("id", id)
    .single();

  if (materialError || !material) {
    return NextResponse.json({ error: "Material not found" }, { status: 404 });
  }

  // Get signed URL
  const { data: urlData, error: storageError } = await supabase.storage
    .from("materials")
    .createSignedUrl(material.file_path, 3600);

  if (storageError || !urlData?.signedUrl) {
    console.error("Storage error:", storageError);
    return NextResponse.json(
      { error: "Could not generate a download URL for this file" },
      { status: 500 },
    );
  }

  return NextResponse.json({ url: urlData.signedUrl });
}
