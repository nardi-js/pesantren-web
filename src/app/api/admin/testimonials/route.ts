import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Testimonial from "@/models/Testimonial";

// GET /api/admin/testimonials - Get all testimonials with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    // Build filter object
    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { position: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      filter.status = status;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get testimonials with pagination
    const testimonials = await Testimonial.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count
    const total = await Testimonial.countDocuments(filter);
    return NextResponse.json({
      success: true,
      data: {
        data: testimonials,
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
      { success: false, error: "Failed to fetch testimonials" },
      { status: 500 }
    );
  }
}

// POST /api/admin/testimonials - Create new testimonial
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const data = await request.json();
    // Validate content length
    if (
      !data.content ||
      data.content.length < 50 ||
      data.content.length > 300
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Content must be between 50 and 300 characters",
        },
        { status: 400 }
      );
    }

    const testimonial = new Testimonial({
      name: data.name,
      position: data.position,
      content: data.content,
      rating: data.rating || 5,
      avatar: data.avatar,
      status: data.status || "pending",
      featured: data.featured || false,
      category: data.category,
    });

    const savedTestimonial = await testimonial.save();
    return NextResponse.json(
      {
        success: true,
        data: savedTestimonial,
        message: "Testimonial created successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
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
      { success: false, error: "Failed to create testimonial" },
      { status: 500 }
    );
  }
}
