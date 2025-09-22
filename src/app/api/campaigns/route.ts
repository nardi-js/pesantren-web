import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { DonationCampaign } from "@/models/Donation";

export async function GET() {
  try {
    await connectDB();
    // Only get active campaigns for public view
    const campaigns = await DonationCampaign.find({
      status: "active",
    })
      .sort({ featured: -1, createdAt: -1 })
      .lean();
    return NextResponse.json({
      success: true,
      data: campaigns,
      total: campaigns.length,
    });
  } catch (error) {
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
