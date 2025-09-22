import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Gallery from "@/models/Gallery";

// GET /api/gallery - Get published gallery items for public view
export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Public Gallery GET API called");
    await connectDB();
    console.log("✅ Database connected for Public Gallery GET");

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const status = searchParams.get("status") || "published";
    const featured = searchParams.get("featured");

    // Build filter
    const filter: Record<string, unknown> = {
      status,
    };

    if (category && category !== "All") {
      filter.category = category;
    }

    if (featured === "true") {
      filter.featured = true;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    console.log("🔍 Filter:", filter);

    // Get total count
    const total = await Gallery.countDocuments(filter);

    // Get paginated results
    const skip = (page - 1) * limit;
    const galleryItems = await Gallery.find(filter)
      .select("-__v")
      .sort({ featured: -1, createdAt: -1 }) // Featured first, then newest
      .skip(skip)
      .limit(limit)
      .lean();

    console.log(
      `✅ Found ${galleryItems.length} gallery items, total: ${total}`
    );

    return NextResponse.json({
      success: true,
      data: {
        data: galleryItems,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("❌ Get public gallery error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch gallery items" },
      { status: 500 }
    );
  }
}
