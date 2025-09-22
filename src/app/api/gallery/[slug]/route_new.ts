import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Gallery from "@/models/Gallery";

// GET /api/gallery/[slug] - Get single gallery item by slug for public view
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();

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

    return NextResponse.json({
      success: true,
      data: galleryItem,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch gallery item" },
      { status: 500 }
    );
  }
}
