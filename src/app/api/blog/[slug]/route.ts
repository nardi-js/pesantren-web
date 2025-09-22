import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Blog from "@/models/Blog";

// GET /api/blog/[slug] - Get single published blog by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    await connectDB();

    const blog = await Blog.findOne({
      slug: slug,
      status: "published",
    }).lean();

    if (!blog) {
      return NextResponse.json(
        { success: false, error: "Blog not found" },
        { status: 404 }
      );
    }

    // Increment view count
    await Blog.findByIdAndUpdate((blog as any)._id, { $inc: { views: 1 } });

    return NextResponse.json({
      success: true,
      data: blog,
    });
  } catch (error) {
    console.error("Get blog by slug error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch blog" },
      { status: 500 }
    );
  }
}
