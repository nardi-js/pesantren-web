"use client";
import { FormField } from "@/components/admin/FormField";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { AdminApi } from "@/lib/api";
import { useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/admin/ToastProvider";
import { useRouter } from "next/navigation";

export default function NewTestimonialPage() {
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    content: "",
    rating: 5,
    category: "",
    status: "pending",
    featured: false,
    avatar: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { push } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.position || !formData.content) {
      push(
        "Please fill in required fields (Name, Position, and Content)",
        "error"
      );
      return;
    }

    setIsSubmitting(true);
    console.log("🚀 Submitting testimonial data:", formData);

    try {
      // Prepare data for submission
      const submitData = {
        name: formData.name,
        position: formData.position,
        content: formData.content,
        rating: formData.rating,
        category: formData.category || "General",
        status: formData.status,
        featured: formData.featured,
        avatar: formData.avatar || "https://via.placeholder.com/100x100",
      };

      console.log("📤 Sending to API:", submitData);

      const response = await AdminApi.createTestimonial(submitData);
      console.log("📥 API Response:", response);

      if (response.success) {
        push(
          `Testimonial ${
            formData.status === "approved" ? "approved" : "saved as pending"
          } successfully!`,
          "success"
        );
        router.push("/admin/testimonials");
      } else {
        throw new Error(response.error || "Failed to create testimonial");
      }
    } catch (error) {
      console.error("❌ Testimonial submission error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      push(`Failed to create testimonial: ${errorMessage}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-wide">
            Create New Testimonial
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Add a new testimonial from students, parents, or alumni
          </p>
        </div>
        <Link
          href="/admin/testimonials"
          className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          ← Back to Testimonials
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white/60 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Basic Information
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FormField label="Full Name" required>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter full name"
                className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
                required
              />
            </FormField>
            <FormField label="Position/Role" required>
              <input
                type="text"
                value={formData.position}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, position: e.target.value }))
                }
                placeholder="e.g., Alumni, Parent, Current Student"
                className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
                required
              />
            </FormField>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <FormField label="Category" required>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, category: e.target.value }))
                }
                className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
                required
                aria-label="Category"
              >
                <option value="">Select Category</option>
                <option value="Student">Current Student</option>
                <option value="Alumni">Alumni</option>
                <option value="Parent">Parent</option>
                <option value="Staff">Staff</option>
                <option value="Other">Other</option>
              </select>
            </FormField>
            <FormField label="Rating">
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formData.rating}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      rating: parseInt(e.target.value),
                    }))
                  }
                  className="flex-1"
                  aria-label="Rating from 1 to 5 stars"
                />
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500 text-lg">
                    {renderStars(formData.rating)}
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    ({formData.rating}/5)
                  </span>
                </div>
              </div>
            </FormField>
          </div>
        </div>

        {/* Testimonial Content */}
        <div className="bg-white/60 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Testimonial Content
          </h2>
          <FormField label="Testimonial Message" required>
            <textarea
              value={formData.content}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, content: e.target.value }))
              }
              placeholder="Write the testimonial message here..."
              rows={5}
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
              required
            />
          </FormField>

          {/* Character Counter */}
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            {formData.content.length} characters
          </div>
        </div>

        {/* Avatar Upload */}
        <div className="bg-white/60 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Profile Photo
          </h2>
          <FormField
            label="Avatar Image"
            hint="Upload a profile photo (recommended: 200x200px, square format)"
          >
            <ImageUploader />
          </FormField>
        </div>

        {/* Settings */}
        <div className="bg-white/60 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Settings
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FormField label="Status" required>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, status: e.target.value }))
                }
                className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
                required
                aria-label="Status"
              >
                <option value="pending">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </FormField>
            <FormField label="Featured">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      featured: e.target.checked,
                    }))
                  }
                  className="rounded border-slate-300 dark:border-slate-600"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  Feature this testimonial on homepage
                </span>
              </label>
            </FormField>
          </div>
        </div>

        {/* Preview */}
        {formData.name && formData.content && (
          <div className="bg-white/60 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Preview
            </h2>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-slate-300 dark:bg-slate-600 rounded-full flex items-center justify-center">
                  <span className="text-slate-500 text-xs">Photo</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                      {formData.name}
                    </h3>
                    <span className="text-sm text-slate-500">•</span>
                    <span className="text-sm text-slate-500">
                      {formData.position}
                    </span>
                    {formData.featured && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="text-yellow-500 text-sm mb-2">
                    {renderStars(formData.rating)}
                  </div>
                  <blockquote className="italic text-slate-700 dark:text-slate-300">
                    &quot;{formData.content}&quot;
                  </blockquote>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Link
            href="/admin/testimonials"
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-center"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={() => {
              setFormData((prev) => ({ ...prev, status: "pending" }));
              handleSubmit({ preventDefault: () => {} } as React.FormEvent);
            }}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save as Pending"}
          </button>
          <button
            type="submit"
            onClick={() => {
              setFormData((prev) => ({ ...prev, status: "approved" }));
            }}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-500 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save & Approve"}
          </button>
        </div>
      </form>
    </div>
  );
}
