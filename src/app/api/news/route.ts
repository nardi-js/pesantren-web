import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import News from "@/models/News";

// GET /api/news - Get published news for frontend
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const sortBy = searchParams.get("sortBy") || "publishedAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build filter for published news only
    const filter: Record<string, unknown> = { status: "published" };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    if (category && category !== "all") {
      filter.category = category;
    }

    if (featured === "true") {
      filter.featured = true;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get news with pagination
    const news = await News.find(filter)
      .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(limit)
      .select("-__v") // Exclude version field
      .lean();

    // Get total count
    const total = await News.countDocuments(filter);

    // Get categories for filter options
    const categories = await News.distinct("category", { status: "published" });

    return NextResponse.json({
      success: true,
      data: {
        news,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
        categories,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch news" },
      { status: 500 }
    );
  }
}
