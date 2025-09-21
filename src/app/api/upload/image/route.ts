import { NextRequest, NextResponse } from "next/server";
import { handleFileUpload } from "@/lib/upload";

// POST /api/upload/image - Upload image to Cloudinary
export async function POST(request: NextRequest) {
  try {
    console.log("📸 Image upload API called");

    // Check content type
    const contentType = request.headers.get("content-type");
    console.log("📋 Content-Type:", contentType);

    if (!contentType?.includes("multipart/form-data")) {
      console.log("❌ Invalid content type");
      return NextResponse.json(
        { success: false, error: "Content type must be multipart/form-data" },
        { status: 400 }
      );
    }

    console.log("📋 Processing file upload...");

    // Use handleFileUpload directly without reading formData first
    const uploadResult = await handleFileUpload(request, {
      fieldName: "file",
      folder: "pesantren/blog",
      tags: ["blog", "featured-image"],
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    });

    console.log("📋 Upload result:", uploadResult);

    if (!uploadResult.success) {
      console.error("❌ Upload failed:", uploadResult.error);
      return NextResponse.json(
        { success: false, error: uploadResult.error || "Upload failed" },
        { status: 400 }
      );
    }

    console.log(
      "✅ Image uploaded successfully:",
      uploadResult.data?.secure_url
    );

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
