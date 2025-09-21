import { Schema, model, models, Document } from "mongoose";

export interface INews extends Document {
  title: string;
  excerpt: string;
  content: string;
  slug: string;
  image?: string;
  videoUrl?: string; // YouTube URL untuk news berbentuk video
  author: {
    name: string;
    email?: string;
    role?: string;
  };
  status: "draft" | "published";
  publishedAt?: Date;
  views: number;
  category: string;
  priority: number;
  featured: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const NewsSchema = new Schema<INews>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxLength: [200, "Title cannot exceed 200 characters"],
    },
    excerpt: {
      type: String,
      required: [true, "Excerpt is required"],
      trim: true,
      maxLength: [500, "Excerpt cannot exceed 500 characters"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
    videoUrl: {
      type: String,
      trim: true,
      validate: {
        validator: function (v: string) {
          if (!v) return true;
          return /^https:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)/.test(
            v
          );
        },
        message: "Please enter a valid YouTube URL",
      },
    },
    author: {
      name: {
        type: String,
        required: [true, "Author name is required"],
        trim: true,
      },
      email: {
        type: String,
        trim: true,
      },
      role: {
        type: String,
        trim: true,
        default: "Admin",
      },
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    publishedAt: {
      type: Date,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    priority: {
      type: Number,
      min: 1,
      max: 5,
      default: 1,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
NewsSchema.index({ status: 1, publishedAt: -1 });
NewsSchema.index({ category: 1, status: 1 });
NewsSchema.index({ featured: 1, publishedAt: -1 });
NewsSchema.index({
  title: "text",
  excerpt: "text",
  content: "text",
});

// Pre-save middleware untuk generate slug dan set publishedAt
NewsSchema.pre("save", function (this: INews, next) {
  if (this.isNew || this.isModified("title")) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .substring(0, 100);
  }

  if (this.status === "published" && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  next();
});

export default models.News || model<INews>("News", NewsSchema);
