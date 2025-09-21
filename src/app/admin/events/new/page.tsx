"use client";
import { FormField } from "@/components/admin/FormField";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { VideoEmbed } from "@/components/admin/VideoEmbed";
import { useToast } from "@/components/admin/ToastProvider";
import { AdminApi } from "@/lib/api";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewEventPage() {
  const { push } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    location: "",
    date: "",
    time: "",
    category: "",
    tags: "",
    capacity: "",
    price: "",
    featuredImage: "",
    organizer: "Admin",
    status: "draft",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.date) {
      push(
        "Please fill in required fields (Title, Description, and Date)",
        "error"
      );
      return;
    }

    setIsSubmitting(true);
    console.log("🚀 Submitting event data:", formData);

    try {
      // Prepare data for submission
      const submitData = {
        title: formData.title,
        description: formData.description,
        content: formData.content || formData.description,
        location: formData.location,
        date: new Date(formData.date),
        time: formData.time || "00:00",
        category: formData.category || "General",
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        price: formData.price ? parseFloat(formData.price) : undefined,
        featuredImage:
          formData.featuredImage || "https://via.placeholder.com/800x400",
        organizer: {
          name: formData.organizer || "Admin",
        },
        status: formData.status,
        registrationOpen: true,
        registered: 0,
      };

      console.log("📤 Sending to API:", submitData);

      const response = await AdminApi.createEvent(submitData);
      console.log("📥 API Response:", response);

      if (response.success) {
        push("Event created successfully!", "success");
        router.push("/admin/events");
      } else {
        throw new Error(response.error || "Failed to create event");
      }
    } catch (error) {
      console.error("❌ Event submission error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      push(`Failed to create event: ${errorMessage}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="space-y-8 max-w-4xl w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-wide">New Event</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            UI only form template.
          </p>
        </div>
        <Link
          href="/admin/events"
          className="text-xs self-start sm:self-auto text-sky-600 dark:text-sky-400 hover:underline"
        >
          Back to list
        </Link>
      </div>
      <form className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Title" required>
            <input
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
              placeholder="Event title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
            />
          </FormField>
          <FormField label="Location">
            <input
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
              placeholder="Event location"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
            />
          </FormField>
          <FormField label="Date" required>
            <input
              type="date"
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
              value={formData.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
              aria-label="Select event date"
            />
          </FormField>
          <FormField label="Time">
            <input
              type="time"
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
              value={formData.time}
              onChange={(e) => handleInputChange("time", e.target.value)}
              aria-label="Select event time"
            />
          </FormField>
          <FormField label="Category">
            <select
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
              value={formData.category}
              onChange={(e) => handleInputChange("category", e.target.value)}
              aria-label="Select event category"
            >
              <option value="">Select Category</option>
              <option value="Education">Education</option>
              <option value="Religious">Religious</option>
              <option value="Community">Community</option>
              <option value="Fundraising">Fundraising</option>
              <option value="Cultural">Cultural</option>
              <option value="Sports">Sports</option>
              <option value="General">General</option>
            </select>
          </FormField>
          <FormField label="Capacity">
            <input
              type="number"
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
              placeholder="Max participants (optional)"
              value={formData.capacity}
              onChange={(e) => handleInputChange("capacity", e.target.value)}
            />
          </FormField>
        </div>

        <FormField label="Tags">
          <input
            className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
            placeholder="Comma-separated tags"
            value={formData.tags}
            onChange={(e) => handleInputChange("tags", e.target.value)}
          />
        </FormField>

        <FormField label="Description" required>
          <textarea
            rows={4}
            className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
            placeholder="Event description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
          />
        </FormField>

        <FormField label="Detailed Content">
          <textarea
            rows={6}
            className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
            placeholder="Detailed event information (optional)"
            value={formData.content}
            onChange={(e) => handleInputChange("content", e.target.value)}
          />
        </FormField>

        <FormField label="Cover Image" hint="Preview only">
          <ImageUploader />
        </FormField>

        <FormField label="YouTube Video" hint="Optional embed">
          <VideoEmbed />
        </FormField>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-md bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Saving..." : "Save"}
          </button>
          <button
            type="reset"
            onClick={() =>
              setFormData({
                title: "",
                description: "",
                content: "",
                location: "",
                date: "",
                time: "",
                category: "",
                tags: "",
                capacity: "",
                price: "",
                featuredImage: "",
                organizer: "Admin",
                status: "draft",
              })
            }
            disabled={isSubmitting}
            className="px-4 py-2 rounded-md border border-slate-300 dark:border-slate-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
