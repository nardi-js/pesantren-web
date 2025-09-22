import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Event from "@/models/Event";
import { isValidObjectId } from "mongoose";

// GET /api/admin/events/[id] - Get single event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    console.log("🔍 Event GET API called for id:", resolvedParams.id);

    if (!isValidObjectId(resolvedParams.id)) {
      return NextResponse.json(
        { success: false, error: "Invalid event ID" },
        { status: 400 }
      );
    }

    await connectDB();
    console.log("✅ Database connected for Event GET");

    const event = await Event.findById(resolvedParams.id).lean();

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    console.log("✅ Event found:", event.title);

    return NextResponse.json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error("❌ Get event error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/events/[id] - Update event
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    console.log("✏️ Event PUT API called for id:", resolvedParams.id);

    if (!isValidObjectId(resolvedParams.id)) {
      return NextResponse.json(
        { success: false, error: "Invalid event ID" },
        { status: 400 }
      );
    }

    await connectDB();
    console.log("✅ Database connected for Event PUT");

    const data = await request.json();
    console.log("📋 Event PUT data:", data);

    // Find and update the event
    const updatedEvent = await Event.findByIdAndUpdate(
      resolvedParams.id,
      {
        title: data.title,
        slug: data.slug,
        description: data.description,
        content: data.content,
        featuredImage: data.featuredImage,
        youtubeUrl: data.youtubeUrl,
        date: data.date ? new Date(data.date) : undefined,
        time: data.time,
        location: data.location,
        capacity: data.capacity,
        registrationOpen: data.registrationOpen,
        registrationLink: data.registrationLink,
        category: data.category,
        tags: data.tags || [],
        status: data.status,
        organizer: data.organizer,
        seo: data.seo,
        price: data.price,
        currency: data.currency,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedEvent) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    console.log("✅ Event updated successfully:", updatedEvent._id);

    return NextResponse.json({
      success: true,
      data: updatedEvent,
      message: "Event updated successfully",
    });
  } catch (error: unknown) {
    console.error("❌ Update event error:", error);

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
      { success: false, error: "Failed to update event" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/events/[id] - Delete event
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    console.log("🗑️ Event DELETE API called for id:", resolvedParams.id);

    if (!isValidObjectId(resolvedParams.id)) {
      return NextResponse.json(
        { success: false, error: "Invalid event ID" },
        { status: 400 }
      );
    }

    await connectDB();
    console.log("✅ Database connected for Event DELETE");

    const deletedEvent = await Event.findByIdAndDelete(resolvedParams.id);

    if (!deletedEvent) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    console.log("✅ Event deleted successfully:", deletedEvent.title);

    return NextResponse.json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete event error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
