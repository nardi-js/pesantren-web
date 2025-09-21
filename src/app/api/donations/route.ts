import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Donation, DonationCampaign } from "@/models/Donation";

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 User Donation POST API called");

    await connectDB();
    console.log("✅ Database connected for User Donation POST");

    const body = await request.json();
    console.log("📝 Donation data received:", body);

    // Validate required fields
    const requiredFields = ["donorName", "amount", "paymentMethod"];
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

    // Validate amount
    if (body.amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Amount must be greater than 0",
        },
        { status: 400 }
      );
    }

    // If campaign is specified, validate it exists
    let campaign = null;
    if (body.campaign) {
      campaign = await DonationCampaign.findOne({
        slug: body.campaign,
        status: "active",
      });

      if (!campaign) {
        return NextResponse.json(
          {
            success: false,
            error: "Campaign not found or not active",
          },
          { status: 404 }
        );
      }
    }

    // Create donation with pending status (simulating payment process)
    const donationData = {
      ...body,
      paymentStatus: "completed", // For demo purposes, directly mark as completed
      paymentDate: new Date(),
      currency: body.currency || "IDR",
    };

    const donation = new Donation(donationData);
    const savedDonation = await donation.save();

    // Update campaign if specified
    if (campaign) {
      campaign.collected += body.amount;
      campaign.donorCount += 1;
      campaign.progress = Math.min(
        (campaign.collected / campaign.goal) * 100,
        100
      );

      // Mark campaign as completed if goal is reached
      if (campaign.collected >= campaign.goal && campaign.status === "active") {
        campaign.status = "completed";
      }

      await campaign.save();
      console.log(
        `✅ Campaign updated: ${campaign.slug}, collected: ${campaign.collected}`
      );
    }

    console.log("✅ Donation created:", savedDonation.receiptNumber);

    return NextResponse.json(
      {
        success: true,
        data: savedDonation,
        message: "Donation successful",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ User Donation POST error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to process donation",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
