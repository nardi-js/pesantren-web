import { NextRequest, NextResponse } from "next/server";
import { handleFileUpload } from "@/lib/upload";

// POST /api/upload/image - Upload image to Cloudinary
export async function POST(request: NextRequest) {
  try {
    // Check content type
    const contentType = request.headers.get("content-type");

    if (!contentType?.includes("multipart/form-data")) {
      return NextResponse.json(
        { success: false, error: "Content type must be multipart/form-data" },
        { status: 400 }
      );
    }

    // Use handleFileUpload directly without reading formData first
    const uploadResult = await handleFileUpload(request, {
      fieldName: "file",
      folder: "pesantren/blog",
      tags: ["blog", "featured-image"],
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    });

    if (!uploadResult.success) {
      return NextResponse.json(
        { success: false, error: uploadResult.error || "Upload failed" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: uploadResult.data,
      message: "Image uploaded successfully",
    });
  } catch (error) {
    console.error("❌ Image upload error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
