import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { DonationCampaign } from "@/models/Donation";

export async function GET() {
  try {
    console.log("🔍 Campaigns GET API called");

    await connectDB();
    console.log("✅ Database connected for Campaigns GET");

    const campaigns = await DonationCampaign.find()
      .sort({ createdAt: -1 })
      .lean();

    console.log(`✅ Found ${campaigns.length} campaigns`);

    return NextResponse.json({
      success: true,
      data: campaigns,
      total: campaigns.length,
    });
  } catch (error) {
    console.error("❌ Campaigns GET error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch campaigns",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 Campaigns POST API called");

    await connectDB();
    console.log("✅ Database connected for Campaigns POST");

    const body = await request.json();
    console.log("📝 Campaign data received:", body);

    // Validate required fields
    const requiredFields = [
      "title",
      "description",
      "goal",
      "currency",
      "startDate",
      "category",
    ];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          {
            success: false,
            error: `${field} is required`,
          },
          { status: 400 }
        );
      }
    }

    // Generate slug if not provided
    if (!body.slug && body.title) {
      body.slug = body.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
    }

    // Create new campaign
    const campaign = new DonationCampaign(body);
    const savedCampaign = await campaign.save();

    console.log("✅ Campaign created:", savedCampaign._id);

    return NextResponse.json(
      {
        success: true,
        data: savedCampaign,
        message: "Campaign created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Campaigns POST error:", error);

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
        error: "Failed to create campaign",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
