import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Gallery from "@/models/Gallery";

interface GalleryItemResponse {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  category: string;
  items: Array<{
    type: "image" | "video";
    url: string;
    caption?: string;
    altText?: string;
  }>;
  coverImage: string;
  tags: string[];
  isFeatured: boolean;
  status: string;
  views: number;
  createdAt: string;
  updatedAt: string;
}

// GET /api/gallery/[slug] - Get gallery item by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();
    const { slug } = params;

    // Find gallery item by slug and ensure it's published
    const galleryItem = (await Gallery.findOne({
      slug,
      status: "published",
    })
      .select("-__v")
      .lean()) as unknown as GalleryItemResponse;

    if (!galleryItem) {
      return NextResponse.json(
        { success: false, message: "Gallery item not found" },
        { status: 404 }
      );
    }

    // Increment views
    await Gallery.findByIdAndUpdate(galleryItem._id, {
      $inc: { views: 1 },
    });
    return NextResponse.json({
      success: true,
      data: galleryItem,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch gallery item",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
