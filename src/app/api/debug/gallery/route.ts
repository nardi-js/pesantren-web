import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Gallery from "@/models/Gallery";

// POST /api/debug/gallery - Test gallery creation without files
export async function POST(request: NextRequest) {
  try {
    console.log("🔍 Testing gallery creation without file uploads...");

    await connectDB();
    console.log("✅ Database connected");

    const testGallery = {
      title: "Test Gallery Item",
      slug: "test-gallery-item",
      description: "Test description",
      type: "image",
      category: "Events",
      status: "draft",
      featured: false,
      coverImage: "https://via.placeholder.com/400x300",
      content: {
        type: "image",
        url: "https://via.placeholder.com/800x600",
        caption: "Test caption",
        altText: "Test alt text",
      },
      items: [],
      tags: [],
      viewCount: 0,
      seo: {},
    };

    console.log("📝 Creating test gallery item...");
    const newGallery = new Gallery(testGallery);
    const savedGallery = await newGallery.save();

    console.log("✅ Gallery item created successfully:", savedGallery._id);

    return NextResponse.json({
      success: true,
      message: "Test gallery item created successfully",
      id: savedGallery._id,
    });
  } catch (error) {
    console.error("❌ Gallery creation test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Gallery creation test failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
