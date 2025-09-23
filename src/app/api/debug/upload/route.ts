import { NextRequest, NextResponse } from "next/server";

// POST /api/debug/upload - Test a simple upload without Cloudinary
export async function POST(request: NextRequest) {
  try {
    console.log("🔍 Debug upload test started");

    const contentType = request.headers.get("content-type");
    console.log("📥 Content-Type:", contentType);

    if (!contentType?.includes("multipart/form-data")) {
      return NextResponse.json(
        {
          success: false,
          error: "Content type must be multipart/form-data",
          receivedContentType: contentType,
        },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    console.log("📦 FormData received");

    // Log all form fields
    const fields: Record<string, unknown> = {};
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        fields[key] = {
          type: "File",
          name: value.name,
          size: value.size,
          mimeType: value.type,
        };
      } else {
        fields[key] = value;
      }
    }

    console.log("📋 Form fields:", fields);

    return NextResponse.json({
      success: true,
      message: "Form data received successfully",
      fields: fields,
    });
  } catch (error) {
    console.error("❌ Debug upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Debug upload failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
