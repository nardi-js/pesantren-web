import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import DonationModels from "@/models/Donation";

const { Donation } = DonationModels;

// GET /api/admin/donations - Get all donations with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const campaign = searchParams.get("campaign") || "";

    // Build filter object
    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$or = [
        { donorName: { $regex: search, $options: "i" } },
        { donorEmail: { $regex: search, $options: "i" } },
        { campaign: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      filter.status = status;
    }

    if (campaign) {
      filter.campaign = campaign;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get donations with pagination
    const donations = await Donation.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count
    const total = await Donation.countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: {
        data: donations,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("❌ Get donations error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch donations" },
      { status: 500 }
    );
  }
}

// POST /api/admin/donations - Create new donation
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const data = await request.json();

    // Check if data is empty or missing required fields
    if (!data || Object.keys(data).length === 0) {
      return NextResponse.json(
        { success: false, error: "No data provided" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!data.donorName) {
      console.error("❌ Missing required field: donorName");
      return NextResponse.json(
        { success: false, error: "Donor name is required" },
        { status: 400 }
      );
    }

    if (!data.amount) {
      console.error("❌ Missing required field: amount");
      return NextResponse.json(
        { success: false, error: "Amount is required" },
        { status: 400 }
      );
    }

    const donation = new Donation({
      donorName: data.donorName,
      donorEmail: data.donorEmail,
      donorPhone: data.donorPhone,
      amount: data.amount,
      currency: data.currency || "IDR",
      campaign: data.campaign,
      paymentMethod: data.paymentMethod || data.method || "bank_transfer",
      paymentStatus: data.paymentStatus || data.status || "pending",
      isAnonymous: data.isAnonymous || data.anonymous || false,
      message: data.message,
      receiptNumber: data.receiptNumber || `DN-${Date.now()}`,
    });

    const savedDonation = await donation.save();

    return NextResponse.json(
      {
        success: true,
        data: savedDonation,
        message: "Donation created successfully",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
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
      { success: false, error: "Failed to create donation" },
      { status: 500 }
    );
  }
}
