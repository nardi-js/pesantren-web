import { Schema, model, models, Document } from "mongoose";

export interface IDonation extends Document {
  donorName: string;
  donorEmail?: string;
  donorPhone?: string;
  amount: number;
  currency: string;
  campaign?: string;
  paymentMethod: string;
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
  transactionId?: string;
  receiptNumber: string;
  isAnonymous: boolean;
  message?: string;
  dedication?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  paymentDate?: Date;
  receiptSent: boolean;
  receiptSentAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDonationCampaign extends Document {
  title: string;
  slug: string;
  description: string;
  goal: number;
  collected: number;
  currency: string;
  startDate: Date;
  endDate?: Date;
  status: "draft" | "active" | "completed" | "cancelled";
  featured: boolean;
  image?: string;
  category: string;
  progress: number;
  donorCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const DonationSchema = new Schema<IDonation>(
  {
    donorName: {
      type: String,
      required: [true, "Donor name is required"],
      trim: true,
      maxLength: [100, "Donor name cannot exceed 100 characters"],
    },
    donorEmail: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    donorPhone: {
      type: String,
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [1, "Amount must be greater than 0"],
    },
    currency: {
      type: String,
      required: [true, "Currency is required"],
      default: "IDR",
      enum: ["IDR", "USD", "EUR"],
    },
    campaign: {
      type: String,
      trim: true,
    },
    paymentMethod: {
      type: String,
      required: [true, "Payment method is required"],
      enum: ["bank_transfer", "credit_card", "e_wallet", "cash", "check"],
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    transactionId: {
      type: String,
      trim: true,
    },
    receiptNumber: {
      type: String,
      unique: true,
      trim: true,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    message: {
      type: String,
      maxLength: [500, "Message cannot exceed 500 characters"],
    },
    dedication: {
      type: String,
      maxLength: [200, "Dedication cannot exceed 200 characters"],
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
    },
    paymentDate: Date,
    receiptSent: {
      type: Boolean,
      default: false,
    },
    receiptSentAt: Date,
    notes: {
      type: String,
      maxLength: [1000, "Notes cannot exceed 1000 characters"],
    },
  },
  { timestamps: true }
);

const DonationCampaignSchema = new Schema<IDonationCampaign>(
  {
    title: {
      type: String,
      required: [true, "Campaign title is required"],
      trim: true,
      maxLength: [200, "Title cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxLength: [2000, "Description cannot exceed 2000 characters"],
    },
    goal: {
      type: Number,
      required: [true, "Goal amount is required"],
      min: [1, "Goal must be greater than 0"],
    },
    collected: {
      type: Number,
      default: 0,
      min: [0, "Collected amount cannot be negative"],
    },
    currency: {
      type: String,
      required: [true, "Currency is required"],
      default: "IDR",
      enum: ["IDR", "USD", "EUR"],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: Date,
    status: {
      type: String,
      enum: ["draft", "active", "completed", "cancelled"],
      default: "draft",
    },
    featured: {
      type: Boolean,
      default: false,
    },
    image: String,
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["Education", "Infrastructure", "Emergency", "General", "Events"],
    },
    progress: {
      type: Number,
      default: 0,
      min: [0, "Progress cannot be negative"],
      max: [100, "Progress cannot exceed 100%"],
    },
    donorCount: {
      type: Number,
      default: 0,
      min: [0, "Donor count cannot be negative"],
    },
  },
  { timestamps: true }
);

// Indexes for Donations
DonationSchema.index({ paymentStatus: 1, createdAt: -1 });
DonationSchema.index({ campaign: 1, paymentStatus: 1 });
DonationSchema.index({ donorEmail: 1 });
DonationSchema.index({ receiptNumber: 1 }, { unique: true });

// Indexes for Campaigns
DonationCampaignSchema.index({ status: 1, featured: 1, createdAt: -1 });
DonationCampaignSchema.index({ category: 1, status: 1 });
DonationCampaignSchema.index({ slug: 1 }, { unique: true });

// Pre-save middleware for donation
DonationSchema.pre("save", function (next) {
  if (
    this.isModified("paymentStatus") &&
    this.paymentStatus === "completed" &&
    !this.paymentDate
  ) {
    this.paymentDate = new Date();
  }

  if (!this.receiptNumber && this.isNew) {
    // Generate receipt number
    this.receiptNumber = `RCP-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;
  }

  next();
});

// Pre-save middleware for campaign
DonationCampaignSchema.pre("save", function (next) {
  // Always generate slug if it doesn't exist, regardless of title modification status
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }

  // Calculate progress
  if (this.goal > 0) {
    this.progress = Math.min((this.collected / this.goal) * 100, 100);
  }

  next();
});

export const Donation =
  models.Donation || model<IDonation>("Donation", DonationSchema);
export const DonationCampaign =
  models.DonationCampaign ||
  model<IDonationCampaign>("DonationCampaign", DonationCampaignSchema);

const DonationModels = { Donation, DonationCampaign };
export default DonationModels;
