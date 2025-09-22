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
    console.log("🔍 Contact GET by ID API called for:", id);

    await connectDB();
    console.log("✅ Database connected for Contact GET by ID");

    const contact = await Contact.findById(id).lean();

    if (!contact) {
      console.log("❌ Contact not found:", id);
      return NextResponse.json(
        { success: false, message: "Contact not found" },
        { status: 404 }
      );
    }

    console.log("✅ Contact found:", contact._id);

    return NextResponse.json({
      success: true,
      data: contact,
    });
  } catch (error: unknown) {
    console.error("❌ Contact GET by ID error:", error);
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
    console.log("🔄 Contact UPDATE API called for ID:", id);

    await connectDB();
    console.log("✅ Database connected for Contact UPDATE");

    const data = await request.json();
    console.log("📋 Contact UPDATE data:", data);

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
      console.log("❌ Contact not found for update:", id);
      return NextResponse.json(
        { success: false, message: "Contact not found" },
        { status: 404 }
      );
    }

    console.log("✅ Contact updated successfully:", contact._id);

    return NextResponse.json({
      success: true,
      data: contact,
      message: "Contact berhasil diupdate",
    });
  } catch (error: unknown) {
    console.error("❌ Contact UPDATE error:", error);

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
    console.log("🗑️ Contact DELETE API called for ID:", id);

    await connectDB();
    console.log("✅ Database connected for Contact DELETE");

    const contact = await Contact.findByIdAndDelete(id).lean();

    if (!contact) {
      console.log("❌ Contact not found for deletion:", id);
      return NextResponse.json(
        { success: false, message: "Contact not found" },
        { status: 404 }
      );
    }

    console.log("✅ Contact deleted successfully:", contact._id);

    return NextResponse.json({
      success: true,
      message: "Contact berhasil dihapus",
    });
  } catch (error: unknown) {
    console.error("❌ Contact DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus contact" },
      { status: 500 }
    );
  }
}
