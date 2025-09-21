import mongoose, { Schema, InferSchemaType, models } from "mongoose";

const GalleryItemSchema = new Schema({
  type: { type: String, enum: ["image", "video"], required: true },
  url: { type: String, required: true },
  thumbnail: { type: String },
  caption: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export type GalleryItem = InferSchemaType<typeof GalleryItemSchema>;
export default models.GalleryItem ||
  mongoose.model("GalleryItem", GalleryItemSchema);
