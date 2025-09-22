import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Event from "@/models/Event";

// GET /api/admin/events - Get all events with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Events GET API called");

    await connectDB();
    console.log("✅ Database connected for Events GET");

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    // Build filter object
    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      filter.status = status;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get events with pagination
    const events = await Event.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count
    const total = await Event.countDocuments(filter);

    console.log(`✅ Found ${events.length} events, total: ${total}`);

    return NextResponse.json({
      success: true,
      data: {
        data: events,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("❌ Get events error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

// POST /api/admin/events - Create new event
export async function POST(request: NextRequest) {
  try {
    console.log("📝 Events POST API called");

    await connectDB();
    console.log("✅ Database connected for Events POST");

    const data = await request.json();
    console.log("📋 Events POST data:", data);

    const event = new Event({
      title: data.title,
      slug: data.slug,
      description: data.description,
      content: data.content,
      featuredImage: data.featuredImage,
      date: data.date ? new Date(data.date) : new Date(),
      time: data.time,
      location: data.location,
      capacity: data.capacity,
      registered: 0,
      registrationOpen: data.registrationOpen ?? true,
      registrationLink: data.registrationLink,
      category: data.category,
      tags: data.tags || [],
      status: data.status || "draft",
      organizer: data.organizer || { name: "Admin" },
      seo: data.seo || {},
      price: data.price,
      currency: data.currency,
    });

    const savedEvent = await event.save();
    console.log("✅ Event saved successfully:", savedEvent._id);

    return NextResponse.json(
      {
        success: true,
        data: savedEvent,
        message: "Event created successfully",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("❌ Create event error:", error);

    if (error instanceof Error && error.name === "ValidationError") {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: (error as any).errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to create event" },
      { status: 500 }
    );
  }
}
