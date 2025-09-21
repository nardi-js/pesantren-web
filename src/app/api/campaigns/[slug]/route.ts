import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { DonationCampaign } from "@/models/Donation";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    console.log(
      "🔍 Public Campaign Detail GET API called for slug:",
      slug
    );

    await connectDB();
    console.log("✅ Database connected for Public Campaign Detail GET");

    const campaign = await DonationCampaign.findOne({
      slug: slug,
      status: "active",
    }).lean();

    if (!campaign) {
      return NextResponse.json(
        {
          success: false,
          error: "Campaign not found",
        },
        { status: 404 }
      );
    }

    console.log("✅ Campaign found:", campaign);

    return NextResponse.json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    console.error("❌ Public Campaign Detail GET error:", error);
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
