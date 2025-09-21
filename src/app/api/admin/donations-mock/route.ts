import { NextResponse } from "next/server";

interface MockDonation {
  _id: number;
  donorName: string;
  donorEmail?: string;
  donorPhone?: string;
  amount: number;
  currency: string;
  campaign?: string;
  paymentMethod: string;
  paymentStatus: string;
  isAnonymous: boolean;
  message?: string;
  notes?: string;
  receiptNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mock database - simpan di memory sementara untuk testing
const mockDonations: MockDonation[] = [];
let nextId = 1;

export async function GET() {
  try {
    console.log(
      "📋 Getting mock donations:",
      mockDonations.length,
      "donations found"
    );

    return NextResponse.json({
      success: true,
      data: {
        data: mockDonations,
        pagination: {
          page: 1,
          limit: 10,
          total: mockDonations.length,
          pages: Math.ceil(mockDonations.length / 10),
        },
      },
    });
  } catch (error) {
    console.error("❌ Mock donation GET error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get donations",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log("📤 Creating mock donation with data:", data);

    // Validasi required fields
    if (!data.donorName) {
      return NextResponse.json(
        {
          success: false,
          error: "Donor name is required",
        },
        { status: 400 }
      );
    }

    if (!data.amount) {
      return NextResponse.json(
        {
          success: false,
          error: "Amount is required",
        },
        { status: 400 }
      );
    }

    // Buat donation object
    const donation: MockDonation = {
      _id: nextId++,
      donorName: data.donorName,
      donorEmail: data.donorEmail,
      donorPhone: data.donorPhone,
      amount: parseFloat(data.amount),
      currency: data.currency || "IDR",
      campaign: data.campaign,
      paymentMethod: data.paymentMethod || "bank_transfer",
      paymentStatus: data.paymentStatus || "pending",
      isAnonymous: data.isAnonymous || false,
      message: data.message,
      notes: data.notes,
      receiptNumber: `DN-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Simpan ke mock database
    mockDonations.push(donation);

    console.log("✅ Mock donation created successfully:", donation._id);
    console.log("📊 Total mock donations:", mockDonations.length);

    return NextResponse.json({
      success: true,
      data: donation,
      message: "Donation created successfully!",
    });
  } catch (error) {
    console.error("❌ Mock donation creation error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        success: false,
        error: `Failed to create donation: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
