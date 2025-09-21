import mongoose, { Schema, InferSchemaType, models } from "mongoose";

const BlogPostSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  excerpt: { type: String },
  body: { type: String, required: true },
  category: { type: String },
  tags: [String],
  image: { type: String },
  author: { type: String },
  published: { type: Boolean, default: false },
  publishedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

BlogPostSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export type BlogPostModel = InferSchemaType<typeof BlogPostSchema>;
export default models.BlogPost || mongoose.model("BlogPost", BlogPostSchema);
