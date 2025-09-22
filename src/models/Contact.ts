import { Schema, model, models, Document } from "mongoose";

export interface IContact extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "unread" | "read" | "replied" | "archived";
  priority: "low" | "medium" | "high";
  source: "website" | "admin";
  ipAddress?: string;
  userAgent?: string;
  respondedBy?: string;
  respondedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema = new Schema<IContact>(
  {
    name: {
      type: String,
      required: [true, "Nama wajib diisi"],
      trim: true,
      maxLength: [100, "Nama tidak boleh lebih dari 100 karakter"],
    },
    email: {
      type: String,
      required: [true, "Email wajib diisi"],
      trim: true,
      lowercase: true,
      maxLength: [255, "Email tidak boleh lebih dari 255 karakter"],
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Format email tidak valid",
      ],
    },
    subject: {
      type: String,
      required: [true, "Subjek wajib diisi"],
      trim: true,
      maxLength: [200, "Subjek tidak boleh lebih dari 200 karakter"],
    },
    message: {
      type: String,
      required: [true, "Pesan wajib diisi"],
      trim: true,
      maxLength: [2000, "Pesan tidak boleh lebih dari 2000 karakter"],
      minLength: [10, "Pesan minimal 10 karakter"],
    },
    status: {
      type: String,
      enum: ["unread", "read", "replied", "archived"],
      default: "unread",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    source: {
      type: String,
      enum: ["website", "admin"],
      default: "website",
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
    respondedBy: {
      type: String,
      trim: true,
    },
    respondedAt: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
      maxLength: [1000, "Catatan tidak boleh lebih dari 1000 karakter"],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
ContactSchema.index({ status: 1, createdAt: -1 });
ContactSchema.index({ email: 1 });
ContactSchema.index({ priority: 1, status: 1 });

const Contact = models.Contact || model<IContact>("Contact", ContactSchema);

export default Contact;
