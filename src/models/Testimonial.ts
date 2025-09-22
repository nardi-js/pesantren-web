import { Schema, model, models, Document } from "mongoose";

export interface ITestimonial extends Document {
  name: string;
  role?: string;
  content: string;
  rating: number;
  avatar?: string;
  category: string;
  status: "pending" | "approved" | "rejected";
  featured: boolean;
  source: "form" | "admin" | "import" | "public";
  email?: string;
  phone?: string;
  location?: string;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TestimonialSchema = new Schema<ITestimonial>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxLength: [100, "Name cannot exceed 100 characters"],
    },
    role: {
      type: String,
      trim: true,
      maxLength: [100, "Role cannot exceed 100 characters"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      maxLength: [1000, "Content cannot exceed 1000 characters"],
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    avatar: String,
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "General",
        "Academic",
        "Spiritual",
        "Facility",
        "Service",
        "Student",
        "Parent",
        "Alumni",
        "Teacher",
        "Community",
      ],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    featured: {
      type: Boolean,
      default: false,
    },
    source: {
      type: String,
      enum: ["form", "admin", "import", "public"],
      default: "form",
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    phone: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
      maxLength: [200, "Location cannot exceed 200 characters"],
    },
    approvedBy: String,
    approvedAt: Date,
  },
  { timestamps: true }
);

// Indexes for search and performance
TestimonialSchema.index({ status: 1, featured: 1, createdAt: -1 });
TestimonialSchema.index({ category: 1, status: 1 });
TestimonialSchema.index({ rating: -1, status: 1 });
TestimonialSchema.index({ name: "text", content: "text" });

// Pre-save middleware to set approval date
TestimonialSchema.pre("save", function (next) {
  if (
    this.isModified("status") &&
    this.status === "approved" &&
    !this.approvedAt
  ) {
    this.approvedAt = new Date();
  }

  next();
});

export default models.Testimonial ||
  model<ITestimonial>("Testimonial", TestimonialSchema);
