import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Event from "@/models/Event";

// GET /api/events/[slug] - Get single event by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = await params;
    await connectDB();

    // Find published event by slug
    const event = await Event.findOne({
      slug,
      status: "published",
    }).lean();

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    // Get related events (same category, excluding current event)
    const relatedEvents = await Event.find({
      category: event.category,
      status: "published",
      _id: { $ne: event._id },
      date: { $gte: new Date() }, // Only upcoming events
    })
      .sort({ date: 1 })
      .limit(3)
      .select("title slug description featuredImage date time location")
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        event,
        relatedEvents,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}
