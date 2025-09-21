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
      .sort({ startDate: -1 })
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
      description: data.description,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      startTime: data.startTime,
      endTime: data.endTime,
      location: data.location,
      capacity: data.capacity || 0,
      registered: 0,
      price: data.price || 0,
      category: data.category,
      tags: data.tags || [],
      status: data.status || "draft",
      featured: data.featured || false,
      image: data.image,
      registrationDeadline: data.registrationDeadline
        ? new Date(data.registrationDeadline)
        : undefined,
      requirements: data.requirements || [],
      organizer: data.organizer,
      contact: data.contact,
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
  } catch (error: any) {
    console.error("❌ Create event error:", error);

    if (error.name === "ValidationError") {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: error.errors,
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
