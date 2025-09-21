import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import DonationModels from "@/models/Donation";
import mongoose from "mongoose";

const { Donation } = DonationModels;

// GET /api/admin/donations/[id] - Get single donation
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("🔍 Donation GET by ID API called:", params.id);

    await connectDB();
    console.log("✅ Database connected for Donation GET by ID");

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: "Invalid donation ID" },
        { status: 400 }
      );
    }

    const donation = await Donation.findById(params.id).lean();

    if (!donation) {
      return NextResponse.json(
        { success: false, error: "Donation not found" },
        { status: 404 }
      );
    }

    console.log("✅ Donation found:", donation._id);

    return NextResponse.json({
      success: true,
      data: donation,
    });
  } catch (error) {
    console.error("❌ Get donation by ID error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch donation" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/donations/[id] - Update donation
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("📝 Donation PUT API called:", params.id);

    await connectDB();
    console.log("✅ Database connected for Donation PUT");

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: "Invalid donation ID" },
        { status: 400 }
      );
    }

    const data = await request.json();
    console.log("📋 Donation PUT data:", data);

    // Check if data is empty
    if (!data || Object.keys(data).length === 0) {
      console.error("❌ Empty data received");
      return NextResponse.json(
        { success: false, error: "No data provided" },
        { status: 400 }
      );
    }

    // Find and update the donation
    const donation = await Donation.findById(params.id);

    if (!donation) {
      return NextResponse.json(
        { success: false, error: "Donation not found" },
        { status: 404 }
      );
    }

    // Update fields
    if (data.donorName !== undefined) donation.donorName = data.donorName;
    if (data.donorEmail !== undefined) donation.donorEmail = data.donorEmail;
    if (data.donorPhone !== undefined) donation.donorPhone = data.donorPhone;
    if (data.amount !== undefined) donation.amount = data.amount;
    if (data.currency !== undefined) donation.currency = data.currency;
    if (data.campaign !== undefined) donation.campaign = data.campaign;
    if (data.paymentMethod !== undefined)
      donation.paymentMethod = data.paymentMethod;
    if (data.paymentStatus !== undefined)
      donation.paymentStatus = data.paymentStatus;
    if (data.isAnonymous !== undefined) donation.isAnonymous = data.isAnonymous;
    if (data.message !== undefined) donation.message = data.message;
    if (data.receiptNumber !== undefined)
      donation.receiptNumber = data.receiptNumber;

    const updatedDonation = await donation.save();
    console.log("✅ Donation updated successfully:", updatedDonation._id);

    return NextResponse.json({
      success: true,
      data: updatedDonation,
      message: "Donation updated successfully",
    });
  } catch (error: unknown) {
    console.error("❌ Update donation error:", error);

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
          details: "errors" in error ? error.errors : undefined,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to update donation" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/donations/[id] - Delete donation
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("🗑️ Donation DELETE API called:", params.id);

    await connectDB();
    console.log("✅ Database connected for Donation DELETE");

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: "Invalid donation ID" },
        { status: 400 }
      );
    }

    const donation = await Donation.findByIdAndDelete(params.id);

    if (!donation) {
      return NextResponse.json(
        { success: false, error: "Donation not found" },
        { status: 404 }
      );
    }

    console.log("✅ Donation deleted successfully:", params.id);

    return NextResponse.json({
      success: true,
      message: "Donation deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete donation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete donation" },
      { status: 500 }
    );
  }
}
