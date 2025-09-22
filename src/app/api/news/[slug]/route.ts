import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import News from "@/models/News";

// GET /api/news/[slug] - Get single news by slug for frontend
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();

    const { slug } = await params;

    // Find news by slug and only if published
    const newsResult = await News.findOne({
      slug,
      status: "published",
    })
      .select("-__v")
      .lean();

    if (!newsResult) {
      return NextResponse.json(
        { success: false, error: "News not found" },
        { status: 404 }
      );
    }

    // Ensure it's a single document, not an array
    const news = Array.isArray(newsResult) ? newsResult[0] : newsResult;

    if (!news) {
      return NextResponse.json(
        { success: false, error: "News not found" },
        { status: 404 }
      );
    }

    // Increment view count
    await News.findByIdAndUpdate(
      news._id,
      { $inc: { views: 1 } },
      { runValidators: false }
    );

    // Get related news (same category, excluding current)
    const relatedNews = await News.find({
      category: news.category,
      status: "published",
      _id: { $ne: news._id },
    })
      .sort({ publishedAt: -1 })
      .limit(3)
      .select("title slug excerpt image publishedAt category")
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        ...news,
        views: (news.views || 0) + 1, // Return updated view count
        relatedNews,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch news" },
      { status: 500 }
    );
  }
}
