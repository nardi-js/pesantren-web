import { Schema, model, models, Document } from "mongoose";

export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  content?: string;
  featuredImage: string;
  date: Date;
  time: string;
  location: string;
  capacity?: number;
  registered: number;
  registrationOpen: boolean;
  category: string;
  tags: string[];
  status: "draft" | "published" | "cancelled" | "completed";
  organizer: {
    name: string;
    contact?: string;
  };
  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  price?: number;
  currency?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
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
      maxLength: [500, "Description cannot exceed 500 characters"],
    },
    content: { type: String },
    featuredImage: {
      type: String,
      required: [true, "Featured image is required"],
    },
    date: {
      type: Date,
      required: [true, "Event date is required"],
    },
    time: {
      type: String,
      required: [true, "Event time is required"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
    },
    capacity: {
      type: Number,
      min: [1, "Capacity must be at least 1"],
    },
    registered: {
      type: Number,
      default: 0,
      min: [0, "Registered count cannot be negative"],
    },
    registrationOpen: {
      type: Boolean,
      default: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Religious",
        "Educational",
        "Social",
        "Sports",
        "Cultural",
        "Workshop",
      ],
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    status: {
      type: String,
      enum: ["draft", "published", "cancelled", "completed"],
      default: "draft",
    },
    organizer: {
      name: {
        type: String,
        required: [true, "Organizer name is required"],
      },
      contact: String,
    },
    seo: {
      title: String,
      description: String,
      keywords: [String],
    },
    price: {
      type: Number,
      min: [0, "Price cannot be negative"],
      default: 0,
    },
    currency: {
      type: String,
      default: "IDR",
    },
  },
  { timestamps: true }
);

// Indexes for search and performance
EventSchema.index({ date: -1, status: 1 });
EventSchema.index({ title: "text", description: "text", tags: "text" });
EventSchema.index({ category: 1, status: 1 });
EventSchema.index({ slug: 1 }, { unique: true });

// Pre-save middleware to generate slug
EventSchema.pre("save", function (next) {
  if (this.isModified("title") && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }

  // Validate capacity vs registered
  if (this.capacity && this.registered > this.capacity) {
    return next(new Error("Registered count cannot exceed capacity"));
  }

  next();
});

export default models.Event || model<IEvent>("Event", EventSchema);
