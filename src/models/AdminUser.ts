import mongoose, { Schema, InferSchemaType, models } from "mongoose";

const AdminUserSchema = new Schema({
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true, default: "Administrator" },
  role: {
    type: String,
    enum: ["admin", "editor", "superadmin"],
    default: "admin",
  },
  createdAt: { type: Date, default: Date.now },
});

export type AdminUser = InferSchemaType<typeof AdminUserSchema>;
export default models.AdminUser || mongoose.model("AdminUser", AdminUserSchema);
