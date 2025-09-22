import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Gallery from "@/models/Gallery";

// GET /api/gallery/[slug] - Get single gallery item by slug for public view
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    console.log("🔍 Public Gallery Detail GET API called");
    await connectDB();
    console.log("✅ Database connected for Public Gallery Detail GET");

    const { slug } = await params;

    const galleryItem = await Gallery.findOne({
      slug,
      status: "published",
    })
      .select("-__v")
      .lean();

    if (!galleryItem) {
      return NextResponse.json(
        { success: false, error: "Gallery item not found" },
        { status: 404 }
      );
    }

    console.log(`✅ Found gallery item`);

    return NextResponse.json({
      success: true,
      data: galleryItem,
    });
  } catch (error) {
    console.error("❌ Get public gallery item error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch gallery item" },
      { status: 500 }
    );
  }
}
