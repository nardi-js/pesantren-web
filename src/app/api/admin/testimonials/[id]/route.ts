import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Testimonial from "@/models/Testimonial";

// GET /api/admin/testimonials/[id] - Get single testimonial
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    console.log("🔍 Testimonial GET API called for ID:", id);

    // Skip if ID is "new" (for create page)
    if (id === "new") {
      return NextResponse.json(
        { success: false, message: "Invalid ID" },
        { status: 400 }
      );
    }

    await connectDB();
    console.log("✅ Database connected for Testimonial GET");

    const testimonial = await Testimonial.findById(id).lean();

    if (!testimonial) {
      console.log("❌ Testimonial not found:", id);
      return NextResponse.json(
        { success: false, message: "Testimonial not found" },
        { status: 404 }
      );
    }

    console.log("✅ Testimonial found:", testimonial.name);

    return NextResponse.json({
      success: true,
      data: testimonial,
    });
  } catch (error) {
    console.error("❌ Error in Testimonial GET API:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch testimonial",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PUT /api/admin/testimonials/[id] - Update testimonial
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    console.log("🔄 Testimonial UPDATE API called for ID:", id);

    await connectDB();
    console.log("✅ Database connected for Testimonial UPDATE");

    const data = await request.json();
    console.log("📋 Testimonial UPDATE data:", data);

    // Validate content length if content is being updated
    if (
      data.content !== undefined &&
      (data.content.length < 50 || data.content.length > 300)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Content must be between 50 and 300 characters",
        },
        { status: 400 }
      );
    }

    const testimonial = await Testimonial.findByIdAndUpdate(
      id,
      {
        name: data.name,
        position: data.position || data.role,
        content: data.content,
        rating: data.rating,
        avatar: data.avatar,
        category: data.category,
        status: data.status,
        featured: data.featured,
        email: data.email,
        phone: data.phone,
        location: data.location,
        ...(data.status === "approved" && {
          approvedAt: new Date(),
          approvedBy: "Admin", // You can get this from auth context
        }),
      },
      { new: true, runValidators: true }
    ).lean();

    if (!testimonial) {
      console.log("❌ Testimonial not found for update:", params.id);
      return NextResponse.json(
        { success: false, message: "Testimonial not found" },
        { status: 404 }
      );
    }

    console.log("✅ Testimonial updated successfully:", testimonial.name);

    return NextResponse.json({
      success: true,
      data: testimonial,
      message: "Testimonial updated successfully",
    });
  } catch (error: unknown) {
    console.error("❌ Update testimonial error:", error);

    if (
      error &&
      typeof error === "object" &&
      "name" in error &&
      error.name === "ValidationError"
    ) {
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
      { success: false, error: "Failed to update testimonial" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/testimonials/[id] - Delete testimonial
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    console.log("🗑️ Testimonial DELETE API called for ID:", id);

    await connectDB();
    console.log("✅ Database connected for Testimonial DELETE");

    const testimonial = await Testimonial.findByIdAndDelete(id).lean();

    if (!testimonial) {
      console.log("❌ Testimonial not found for deletion:", id);
      return NextResponse.json(
        { success: false, message: "Testimonial not found" },
        { status: 404 }
      );
    }

    console.log("✅ Testimonial deleted successfully:", testimonial.name);

    return NextResponse.json({
      success: true,
      message: "Testimonial deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete testimonial error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete testimonial" },
      { status: 500 }
    );
  }
}
