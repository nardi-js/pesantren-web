import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Event from "@/models/Event";

// GET /api/events - Get published events for frontend
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const category = searchParams.get("category") || "";
    const search = searchParams.get("search") || "";
    const upcoming = searchParams.get("upcoming") === "true";

    // Build filter - only published events
    const filter: Record<string, unknown> = { status: "published" };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    if (category) {
      filter.category = category;
    }

    // Filter for upcoming events only
    if (upcoming) {
      filter.date = { $gte: new Date() };
    }

    const skip = (page - 1) * limit;

    // Get published events
    const events = await Event.find(filter)
      .sort({ date: 1 }) // Sort by event date ascending for upcoming events
      .skip(skip)
      .limit(limit)
      .select(
        "title slug description featuredImage youtubeUrl date time location category tags registrationOpen capacity registered price"
      )
      .lean();

    const total = await Event.countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: {
        events,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
