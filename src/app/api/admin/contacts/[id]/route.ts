import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Contact from "@/models/Contact";

// GET /api/admin/contacts/[id] - Get single contact
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    await connectDB();
    const contact = await Contact.findById(id).lean();

    if (!contact) {
      return NextResponse.json(
        { success: false, message: "Contact not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      data: contact,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch contact" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/contacts/[id] - Update contact
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    await connectDB();
    const data = await request.json();
    const contact = await Contact.findByIdAndUpdate(
      id,
      {
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
        status: data.status,
        priority: data.priority,
        notes: data.notes,
        ...(data.status === "replied" && {
          respondedAt: new Date(),
          respondedBy: "Admin", // You can get this from auth context
        }),
      },
      { new: true, runValidators: true }
    ).lean();

    if (!contact) {
      return NextResponse.json(
        { success: false, message: "Contact not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      data: contact,
      message: "Contact berhasil diupdate",
    });
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
      { success: false, error: "Gagal mengupdate contact" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/contacts/[id] - Delete contact
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    await connectDB();
    const contact = await Contact.findByIdAndDelete(id).lean();

    if (!contact) {
      return NextResponse.json(
        { success: false, message: "Contact not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      message: "Contact berhasil dihapus",
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: "Gagal menghapus contact" },
      { status: 500 }
    );
  }
}
