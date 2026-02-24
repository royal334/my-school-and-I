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

    // This route would normally serve the PDF file or a signed URL.
    // For now, we'll return a placeholder to fix compilation.
    return NextResponse.json({
      message: "Material found",
      material,
    });
  } catch (error) {
    console.error("View route error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
