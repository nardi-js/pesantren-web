import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Testimonial from "@/models/Testimonial";

// POST /api/testimonials/submit - Submit testimonial from public (requires approval)
export async function POST(request: NextRequest) {
  try {
    console.log("📝 Public Testimonial Submit API called");

    await connectDB();
    console.log("✅ Database connected for Public Testimonial Submit");

    const data = await request.json();
    console.log("📋 Public Testimonial Submit data:", data);

    // Validate required fields
    if (!data.name || !data.content) {
      return NextResponse.json(
        { success: false, error: "Nama dan isi testimonial wajib diisi" },
        { status: 400 }
      );
    }

    // Validate content length for consistency
    const contentLength = data.content.trim().length;
    if (contentLength < 50) {
      return NextResponse.json(
        {
          success: false,
          error: "Testimoni minimal 50 karakter untuk kualitas yang baik",
        },
        { status: 400 }
      );
    }

    if (contentLength > 300) {
      return NextResponse.json(
        {
          success: false,
          error: "Testimoni maksimal 300 karakter agar tetap ringkas",
        },
        { status: 400 }
      );
    }

    // Create testimonial with default status "pending" for public submissions
    const testimonial = new Testimonial({
      name: data.name,
      role: data.position || "Pengunjung",
      content: data.content,
      rating: data.rating || 5,
      status: "pending", // Always pending for public submissions
      featured: false, // Never featured by default
      avatar: data.avatar || "",
      email: data.email || "",
      phone: data.phone || "",
      location: data.location || "",
      category: data.category || "General",
      source: "public", // Track submission source
    });

    const savedTestimonial = await testimonial.save();
    console.log(
      "✅ Public testimonial submitted successfully:",
      savedTestimonial._id
    );

    return NextResponse.json(
      {
        success: true,
        data: savedTestimonial,
        message:
          "Testimoni berhasil dikirim! Akan ditampilkan setelah disetujui admin.",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("❌ Submit public testimonial error:", error);

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
      { success: false, error: "Gagal mengirim testimonial" },
      { status: 500 }
    );
  }
}
