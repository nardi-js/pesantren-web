"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AdminApi } from "@/lib/api";
import { useToast } from "@/components/admin/ToastProvider";
import { ImageUploader } from "@/components/admin/ImageUploader";

export default function NewGalleryPage() {
  const router = useRouter();
  const { push } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "image" as "image" | "video" | "album",
    category: "Events",
    status: "draft" as "draft" | "published",
    featured: false,
    youtubeUrl: "",
    caption: "",
    altText: "",
    coverImage: "",
    items: [] as Array<{ url: string; caption: string }>,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title) {
      push("Please enter a title", "error");
      return;
    }

    if (formData.type === "video" && !formData.youtubeUrl) {
      push("Please enter a YouTube URL", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("type", formData.type);
      submitData.append("category", formData.category);
      submitData.append("status", formData.status);
      submitData.append("featured", formData.featured.toString());

      if (formData.coverImage) {
        submitData.append("coverImage", formData.coverImage);
      }

      if (formData.type === "video") {
        submitData.append("youtubeUrl", formData.youtubeUrl);
        submitData.append("caption", formData.caption);
      }

      if (formData.type === "image") {
        submitData.append("caption", formData.caption);
        submitData.append("altText", formData.altText);
      }

      const response = await AdminApi.createGalleryItem(submitData);

      if (response.success) {
        push("Gallery item created successfully!", "success");
        router.push("/admin/gallery");
      } else {
        push(response.error || "Failed to create gallery item", "error");
      }
    } catch {
      push("Failed to create gallery item", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create New Gallery Item
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Add a new item to your gallery collection
          </p>
        </div>
        <Link
          href="/admin/gallery"
          className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ← Back to Gallery
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Basic Information
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Enter gallery title"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Enter description..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      type: e.target.value as "image" | "video" | "album",
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  title="Select gallery type"
                >
                  <option value="image">Single Image</option>
                  <option value="video">YouTube Video</option>
                  <option value="album">Album</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  title="Select gallery category"
                >
                  <option value="Events">Events</option>
                  <option value="Daily Life">Daily Life</option>
                  <option value="Ceremonies">Ceremonies</option>
                  <option value="Education">Education</option>
                  <option value="Sports">Sports</option>
                  <option value="Religious">Religious</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value as "draft" | "published",
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  title="Select publication status"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      featured: e.target.checked,
                    }))
                  }
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Featured Item
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Cover Image */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Cover Image *
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Upload a cover image for this gallery item
          </p>
          <ImageUploader
            onUpload={(imageUrl) =>
              setFormData((prev) => ({ ...prev, coverImage: imageUrl }))
            }
          />
        </div>

        {/* Content based on type */}
        {formData.type === "video" && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              YouTube Video
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  YouTube URL *
                </label>
                <input
                  type="url"
                  value={formData.youtubeUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      youtubeUrl: e.target.value,
                    }))
                  }
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Caption
                </label>
                <input
                  type="text"
                  value={formData.caption}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      caption: e.target.value,
                    }))
                  }
                  placeholder="Video caption"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        {formData.type === "image" && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Image Content
            </h2>

            <div className="space-y-4">
              <ImageUploader
                onUpload={(imageUrl) => {
                  setFormData((prev) => ({
                    ...prev,
                    items: [...prev.items, { url: imageUrl, caption: "" }],
                  }));
                }}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Caption
                  </label>
                  <input
                    type="text"
                    value={formData.caption}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        caption: e.target.value,
                      }))
                    }
                    placeholder="Image caption"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Alt Text
                  </label>
                  <input
                    type="text"
                    value={formData.altText}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        altText: e.target.value,
                      }))
                    }
                    placeholder="Alt text for accessibility"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Link
            href="/admin/gallery"
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creating..." : "Create Gallery Item"}
          </button>
        </div>
      </form>
    </div>
  );
}
