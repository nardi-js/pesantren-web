import { NextRequest, NextResponse } from "next/server";
import { handleFileUpload, handleMultipleFileUpload } from "@/lib/upload";

// POST /api/admin/upload - Single file upload
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "general";
    const multiple = searchParams.get("multiple") === "true";

    if (multiple) {
      // Handle multiple file upload
      const result = await handleMultipleFileUpload(request, {
        fieldName: "files",
        folder: `pesantren/${type}`,
        tags: [type, "admin-upload"],
        maxFiles: 10,
        maxSize: 10 * 1024 * 1024, // 10MB per file
        allowedTypes: [
          "image/jpeg",
          "image/png",
          "image/webp",
          "image/gif",
          "video/mp4",
          "video/webm",
        ],
      });

      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          files: result.data?.map((file) => ({
            url: file.secure_url,
            publicId: file.public_id,
            width: file.width,
            height: file.height,
            format: file.format,
            resourceType: file.resource_type,
            bytes: file.bytes,
          })),
        },
      });
    } else {
      // Handle single file upload
      const result = await handleFileUpload(request, {
        fieldName: "file",
        folder: `pesantren/${type}`,
        tags: [type, "admin-upload"],
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: [
          "image/jpeg",
          "image/png",
          "image/webp",
          "image/gif",
          "video/mp4",
          "video/webm",
        ],
      });

      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          url: result.data!.secure_url,
          publicId: result.data!.public_id,
          width: result.data!.width,
          height: result.data!.height,
          format: result.data!.format,
          resourceType: result.data!.resource_type,
          bytes: result.data!.bytes,
        },
      });
    }
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: "Upload failed" },
      { status: 500 }
    );
  }
}
