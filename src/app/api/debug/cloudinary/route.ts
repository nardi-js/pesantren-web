import { NextRequest, NextResponse } from "next/server";

// GET /api/debug/cloudinary - Test Cloudinary configuration
export async function GET(request: NextRequest) {
  try {
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
      process.env;

    const config = {
      cloud_name: !!CLOUDINARY_CLOUD_NAME,
      api_key: !!CLOUDINARY_API_KEY,
      api_secret: !!CLOUDINARY_API_SECRET,
    };

    console.log("🔍 Cloudinary environment check:", config);

    // Try to import cloudinary
    try {
      const { v2: cloudinary } = await import("cloudinary");
      console.log("✅ Cloudinary module imported successfully");

      // Try basic configuration
      cloudinary.config({
        cloud_name: CLOUDINARY_CLOUD_NAME,
        api_key: CLOUDINARY_API_KEY,
        api_secret: CLOUDINARY_API_SECRET,
        secure: true,
      });

      console.log("✅ Cloudinary configured successfully");

      return NextResponse.json({
        success: true,
        message: "Cloudinary configuration check passed",
        hasEnvironmentVariables: config,
      });
    } catch (cloudinaryError) {
      console.error("❌ Cloudinary module error:", cloudinaryError);
      return NextResponse.json(
        {
          success: false,
          error: "Cloudinary module error",
          details:
            cloudinaryError instanceof Error
              ? cloudinaryError.message
              : String(cloudinaryError),
          hasEnvironmentVariables: config,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ Debug endpoint error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Debug endpoint error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
