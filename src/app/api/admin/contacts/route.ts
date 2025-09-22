import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Contact from "@/models/Contact";

// GET /api/admin/contacts - Get all contact messages with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const priority = searchParams.get("priority") || "";

    // Build filter object
    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      filter.status = status;
    }

    if (priority) {
      filter.priority = priority;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get contacts with pagination
    const contacts = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count
    const total = await Contact.countDocuments(filter);

    // Get stats
    const stats = await Contact.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const statusCounts = {
      unread: 0,
      read: 0,
      replied: 0,
      archived: 0,
    };

    stats.forEach((stat) => {
      if (stat._id in statusCounts) {
        statusCounts[stat._id as keyof typeof statusCounts] = stat.count;
      }
    });
    return NextResponse.json({
      success: true,
      data: contacts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: statusCounts,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch contacts" },
      { status: 500 }
    );
  }
}

// POST /api/admin/contacts - Create new contact (admin use)
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const data = await request.json();
    // Validate required fields
    if (!data.name || !data.email || !data.subject || !data.message) {
      return NextResponse.json(
        { success: false, error: "Semua field wajib diisi" },
        { status: 400 }
      );
    }

    const contact = new Contact({
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
      status: data.status || "unread",
      priority: data.priority || "medium",
      source: "admin",
      notes: data.notes || "",
    });

    const savedContact = await contact.save();
    return NextResponse.json(
      {
        success: true,
        data: savedContact,
        message: "Contact berhasil dibuat",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "ValidationError") {
      const validationError = error as Error & { errors?: unknown };
      return NextResponse.json(
        {
          success: false,
          error: "Data tidak valid",
          details: validationError.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Gagal membuat contact" },
      { status: 500 }
    );
  }
}
