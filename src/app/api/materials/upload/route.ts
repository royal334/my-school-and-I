import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { isUserAdmin, isUserModerator } from "@/utils/supabase/queries";
import { generateUniqueFileName } from "@/utils/lib/index";
import { MAX_FILE_SIZE } from "@/utils/constants/constants";

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(await cookies());

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin or moderator
    const isAdmin = await isUserAdmin(user.id, supabase);
    const isModerator = await isUserModerator(user.id, supabase);

    if (!isAdmin && !isModerator) {
      return NextResponse.json(
        { error: "Only admins and moderators can upload materials" },
        { status: 403 },
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const courseId = formData.get("courseId") as string;
    const title = formData.get("title") as string;
    const type = formData.get("type") as string;
    const description = formData.get("description") as string | null;
    const isPremium = formData.get("isPremium") === "true";

    // Validate inputs
    if (!file || !courseId || !title || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 },
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size must not exceed 10MB" },
        { status: 400 },
      );
    }

    // Generate unique filename
    const uniqueFileName = generateUniqueFileName(file.name);
    const filePath = `materials/${courseId}/${uniqueFileName}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("materials")
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 },
      );
    }

    // Create material record in database
    const { data: material, error: dbError } = await supabase
      .from("materials")
      .insert({
        course_id: courseId,
        title,
        type,
        description,
        file_path: uploadData.path,
        file_size_bytes: file.size,
        file_name: file.name,
        uploaded_by: user.id,
        is_premium: isPremium,
        is_approved: isAdmin, // Admins auto-approve, moderators need approval
      })
      .select()
      .single();

    if (dbError) {
      // Clean up uploaded file
      await supabase.storage.from("materials").remove([uploadData.path]);
      return NextResponse.json(
        { error: "Failed to create material record" },
        { status: 500 },
      );
    }

    // Log activity
    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "material_uploaded",
      resource_type: "material",
      resource_id: material.id,
      metadata: {
        title,
        course_id: courseId,
        file_name: file.name,
      },
    });

    return NextResponse.json({
      success: true,
      material,
      message: isAdmin
        ? "Material uploaded and approved"
        : "Material uploaded, awaiting approval",
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
