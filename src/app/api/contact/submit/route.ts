import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Contact from "@/models/Contact";

// POST /api/contact/submit - Submit contact form from public
export async function POST(request: NextRequest) {
  try {
    console.log("📝 Contact Form Submit API called");

    await connectDB();
    console.log("✅ Database connected for Contact Submit");

    const data = await request.json();
    console.log("📋 Contact Submit data:", data);

    // Validate required fields
    if (!data.name || !data.email || !data.subject || !data.message) {
      return NextResponse.json(
        {
          success: false,
          error: "Semua field wajib diisi (nama, email, subjek, dan pesan)",
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(data.email.trim())) {
      return NextResponse.json(
        { success: false, error: "Format email tidak valid" },
        { status: 400 }
      );
    }

    // Validate message length
    const messageLength = data.message.trim().length;
    if (messageLength < 10) {
      return NextResponse.json(
        {
          success: false,
          error: "Pesan minimal 10 karakter",
        },
        { status: 400 }
      );
    }

    if (messageLength > 2000) {
      return NextResponse.json(
        {
          success: false,
          error: "Pesan maksimal 2000 karakter",
        },
        { status: 400 }
      );
    }

    // Get client information for tracking
    const clientIP =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Create contact entry
    const contact = new Contact({
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      subject: data.subject.trim(),
      message: data.message.trim(),
      status: "unread",
      priority: "medium", // Default priority
      source: "website",
      ipAddress: clientIP,
      userAgent: userAgent,
    });

    const savedContact = await contact.save();
    console.log("✅ Contact form submitted successfully:", savedContact._id);

    return NextResponse.json(
      {
        success: true,
        data: {
          id: savedContact._id,
          message:
            "Pesan Anda berhasil dikirim! Kami akan membalas secepatnya.",
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("❌ Submit contact form error:", error);

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
      { success: false, error: "Gagal mengirim pesan. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
