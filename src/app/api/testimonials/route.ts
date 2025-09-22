import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Testimonial from "@/models/Testimonial";

// GET /api/testimonials - Get published testimonials for public
export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Public Testimonials GET API called");

    await connectDB();
    console.log("✅ Database connected for Public Testimonials GET");

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "9");
    const category = searchParams.get("category") || "";
    const featured = searchParams.get("featured") === "true";

    // Build filter object - only show approved testimonials
    const filter: Record<string, unknown> = {
      status: "approved",
    };

    if (category && category !== "all") {
      filter.category = category;
    }

    if (featured) {
      filter.featured = true;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get testimonials with pagination
    const testimonials = await Testimonial.find(filter)
      .sort({ featured: -1, createdAt: -1 }) // Featured first, then newest
      .skip(skip)
      .limit(limit)
      .select("-email -phone -approvedBy -__v") // Hide sensitive fields
      .lean();

    // Get total count
    const total = await Testimonial.countDocuments(filter);

    console.log(
      `✅ Found ${testimonials.length} published testimonials, total: ${total}`
    );

    return NextResponse.json({
      success: true,
      data: testimonials,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("❌ Error in Public Testimonials GET API:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch testimonials",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
