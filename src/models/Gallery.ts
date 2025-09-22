import { Schema, model, models, Document } from "mongoose";

export interface IGallery extends Document {
  title: string;
  slug: string;
  description?: string;
  type: "image" | "video" | "album";
  coverImage: string;

  // For single images/videos
  content?: {
    type: "image" | "youtube";
    url: string;
    caption?: string;
    altText?: string;
    youtubeId?: string; // For YouTube videos
  };

  // For albums/multiple items
  items: Array<{
    type: "image" | "youtube";
    url: string;
    caption?: string;
    altText?: string;
    youtubeId?: string; // For YouTube videos
    order: number;
  }>;

  category: string;
  tags: string[];
  status: "draft" | "published" | "archived";
  featured: boolean;
  viewCount: number;
  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const GallerySchema = new Schema<IGallery>(
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
      maxLength: [1000, "Description cannot exceed 1000 characters"],
    },
    type: {
      type: String,
      enum: ["image", "video", "album"],
      default: "image",
      required: true,
    },
    coverImage: {
      type: String,
      required: [true, "Cover image is required"],
    },
    content: {
      type: {
        type: String,
        enum: ["image", "youtube"],
      },
      url: String,
      caption: String,
      altText: String,
      youtubeId: String,
    },
    items: [
      {
        type: {
          type: String,
          enum: ["image", "youtube"],
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        caption: String,
        altText: String,
        youtubeId: String,
        order: {
          type: Number,
          default: 0,
        },
      },
    ],
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Events",
        "Daily Life",
        "Ceremonies",
        "Education",
        "Sports",
        "Religious",
        "Videos",
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
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    featured: {
      type: Boolean,
      default: false,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    seo: {
      title: String,
      description: String,
      keywords: [String],
    },
  },
  { timestamps: true }
);

// Indexes for search and performance
GallerySchema.index({ title: "text", description: "text", tags: "text" });
GallerySchema.index({ status: 1, createdAt: -1 });
GallerySchema.index({ category: 1, status: 1 });
GallerySchema.index({ slug: 1 }, { unique: true });

// Pre-save middleware to generate slug
GallerySchema.pre("save", function (next) {
  if (this.isModified("title") && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }

  next();
});

export default models.Gallery || model<IGallery>("Gallery", GallerySchema);
