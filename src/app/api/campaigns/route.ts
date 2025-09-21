import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { DonationCampaign } from "@/models/Donation";

export async function GET() {
  try {
    console.log("🔍 Public Campaigns GET API called");

    await connectDB();
    console.log("✅ Database connected for Public Campaigns GET");

    // Only get active campaigns for public view
    const campaigns = await DonationCampaign.find({
      status: "active",
    })
      .sort({ featured: -1, createdAt: -1 })
      .lean();

    console.log(`✅ Found ${campaigns.length} active campaigns`);

    return NextResponse.json({
      success: true,
      data: campaigns,
      total: campaigns.length,
    });
  } catch (error) {
    console.error("❌ Public Campaigns GET error:", error);
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
