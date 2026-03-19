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

    // Parse request body based on content type
    let file: File | null = null;
    let preUploadedPath: string | null = null;
    let courseId: string;
    let title: string;
    let type: string;
    let description: string | null;
    let isPremium: boolean;
    let fileSize: number;
    let fileName: string;

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await request.json();
      preUploadedPath = body.filePath || null;
      courseId = body.courseId;
      title = body.title;
      type = body.type;
      description = body.description || null;
      isPremium = body.isPremium;
      fileSize = body.fileSize || 0;
      fileName = body.fileName || "unknown";
    } else {
      const formData = await request.formData();
      file = formData.get("file") as File | null;
      preUploadedPath = formData.get("filePath") as string | null;
      courseId = formData.get("courseId") as string;
      title = formData.get("title") as string;
      type = formData.get("type") as string;
      description = formData.get("description") as string | null;
      isPremium = formData.get("isPremium") === "true";
      fileSize = file?.size || Number(formData.get("fileSize") || 0);
      fileName =
        file?.name || (formData.get("fileName") as string) || "unknown";
    }

    // Validate inputs
    if ((!file && !preUploadedPath) || !courseId || !title || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    let filePath = preUploadedPath;

    if (file) {
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
          {
            error: `File size must not exceed ${MAX_FILE_SIZE / 1024 / 1024}MB`,
          },
          { status: 400 },
        );
      }

      // Generate unique filename
      const uniqueFileName = generateUniqueFileName(file.name);
      filePath = `materials/${courseId}/${uniqueFileName}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("materials")
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        return NextResponse.json(
          { error: "Failed to upload file" },
          { status: 500 },
        );
      }
      filePath = uploadData.path;
    }

    // Create material record in database
    const { data: material, error: dbError } = await supabase
      .from("materials")
      .insert({
        course_id: courseId,
        title,
        type,
        description,
        file_path: filePath,
        file_size_bytes: fileSize,
        file_name: fileName,
        uploaded_by: user.id,
        is_premium: isPremium,
        is_approved: isAdmin, // Admins auto-approve, moderators need approval
      })
      .select()
      .single();

    if (dbError) {
      if (!filePath) {
        return NextResponse.json(
          { error: "Failed to create material record" },
          { status: 500 },
        );
      }
      // Clean up uploaded file
      await supabase.storage.from("materials").remove([filePath]);
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
        file_name: fileName,
      },
    });

    return NextResponse.json({
      success: true,
      material,
      message: isAdmin
        ? "Material uploaded and approved"
        : "Material uploaded, awaiting approval",
    });
  } catch (error: any) {
    console.error("Critical Upload Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
