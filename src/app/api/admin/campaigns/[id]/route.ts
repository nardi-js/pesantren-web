import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { DonationCampaign } from "@/models/Donation";
import { Types } from "mongoose";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log("🔍 Campaign GET by ID API called:", id);

    await connectDB();

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid campaign ID" },
        { status: 400 }
      );
    }

    const campaign = await DonationCampaign.findById(id).lean();

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: "Campaign not found" },
        { status: 404 }
      );
    }

    console.log("✅ Campaign found");

    return NextResponse.json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    console.error("❌ Campaign GET error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch campaign",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log("🔍 Campaign PUT API called:", id);

    await connectDB();

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid campaign ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    console.log("📝 Campaign update data:", body);

    // Remove fields that shouldn't be updated directly
    const { ...updateData } = body;

    const campaign = await DonationCampaign.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).lean();

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: "Campaign not found" },
        { status: 404 }
      );
    }

    console.log("✅ Campaign updated");

    return NextResponse.json({
      success: true,
      data: campaign,
      message: "Campaign updated successfully",
    });
  } catch (error) {
    console.error("❌ Campaign PUT error:", error);

    if (error instanceof Error && error.message.includes("duplicate key")) {
      return NextResponse.json(
        {
          success: false,
          error: "Campaign with this slug already exists",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update campaign",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log("🔍 Campaign DELETE API called:", id);

    await connectDB();

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid campaign ID" },
        { status: 400 }
      );
    }

    const campaign = await DonationCampaign.findByIdAndDelete(id);

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: "Campaign not found" },
        { status: 404 }
      );
    }

    console.log("✅ Campaign deleted:", id);

    return NextResponse.json({
      success: true,
      message: "Campaign deleted successfully",
    });
  } catch (error) {
    console.error("❌ Campaign DELETE error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete campaign",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
