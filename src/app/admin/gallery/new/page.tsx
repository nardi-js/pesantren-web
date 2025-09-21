"use client";
import { FormField } from "@/components/admin/FormField";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { AdminApi } from "@/lib/api";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useToast } from "@/components/admin/ToastProvider";
import { useRouter } from "next/navigation";

interface GalleryFormData {
  title: string;
  description: string;
  type: "image" | "video" | "album";
  category: string;
  tags: string[];
  status: "draft" | "published";
  featured: boolean;
  
  // For cover image
  coverImage: File | null;
  coverImageUrl?: string;
  
  // For single image
  image: File | null;
  imageUrl?: string;
  caption: string;
  altText: string;
  
  // For YouTube video
  youtubeUrl: string;
  
  // For albums
  albumImages: File[];
  albumImageUrls: string[];
  youtubeVideos: Array<{
    url: string;
    caption: string;
  }>;
}

export default function NewGalleryPage() {
  const [formData, setFormData] = useState<GalleryFormData>({
    title: "",
    description: "",
    type: "image",
    category: "Events",
    tags: [],
    status: "draft",
    featured: false,
    coverImage: null,
    image: null,
    caption: "",
    altText: "",
    youtubeUrl: "",
    albumImages: [],
    albumImageUrls: [],
    youtubeVideos: [],
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const { push } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.album) {
      push(
        "Please fill in required fields (Title and Album Category)",
        "error"
      );
      return;
    }

    setIsSubmitting(true);
    console.log("🚀 Submitting gallery data:", formData);

    try {
      // Prepare data for submission
      const submitData = {
        title: formData.title,
        description: formData.description,
        album: formData.album,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
        status: formData.status,
        coverImage:
          formData.coverImage || "https://via.placeholder.com/800x600",
        images:
          formData.images.length > 0
            ? formData.images
            : ["https://via.placeholder.com/800x600"],
      };

      console.log("📤 Sending to API:", submitData);

      const response = await AdminApi.createGalleryItem(submitData);
      console.log("📥 API Response:", response);

      if (response.success) {
        push(
          `Gallery ${
            formData.status === "published" ? "published" : "saved as draft"
          } successfully!`,
          "success"
        );
        router.push("/admin/gallery");
      } else {
        throw new Error(response.error || "Failed to create gallery");
      }
    } catch (error) {
      console.error("❌ Gallery submission error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      push(`Failed to create gallery: ${errorMessage}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-wide">
            Create New Gallery
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Add a new photo gallery or album
          </p>
        </div>
        <Link
          href="/admin/gallery"
          className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          ← Back to Galleries
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white/60 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Basic Information
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FormField label="Gallery Title" required>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Enter gallery title"
                className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
                required
              />
            </FormField>
            <FormField label="Album Category" required>
              <select
                value={formData.album}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, album: e.target.value }))
                }
                className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
                required
                aria-label="Album Category"
              >
                <option value="">Select Album</option>
                <option value="Events">Events</option>
                <option value="Campus">Campus Life</option>
                <option value="Religious">Religious Activities</option>
                <option value="Academic">Academic</option>
                <option value="Community">Community</option>
                <option value="Other">Other</option>
              </select>
            </FormField>
          </div>
          <div className="mt-6">
            <FormField label="Description">
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe this gallery..."
                rows={3}
                className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
              />
            </FormField>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <FormField label="Tags" hint="Use commas to separate tags">
              <input
                type="text"
                value={formData.tags}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, tags: e.target.value }))
                }
                placeholder="Enter tags separated by commas"
                className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
              />
            </FormField>
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
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </FormField>
          </div>
        </div>

        {/* Cover Image */}
        <div className="bg-white/60 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Cover Image
          </h2>
          <FormField
            label="Cover Image"
            hint="Upload a cover image for this gallery (recommended: 800x600px)"
          >
            <ImageUploader />
          </FormField>
        </div>

        {/* Gallery Images */}
        <div className="bg-white/60 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Gallery Images
          </h2>

          {/* Upload Area */}
          <FormField
            label="Gallery Images"
            hint="Upload images for this gallery. You can upload multiple images."
          >
            <ImageUploader />
          </FormField>

          {/* Uploaded Images Preview */}
          {formData.images.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Uploaded Images ({formData.images.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                      <Image
                        src={image}
                        alt={`Gallery image ${index + 1}`}
                        width={150}
                        height={150}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          images: prev.images.filter((_, i) => i !== index),
                        }))
                      }
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove image"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bulk Upload Instructions */}
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
              Tips for bulk upload:
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• You can select multiple images at once</li>
              <li>• Recommended image size: 1200x800px or larger</li>
              <li>• Supported formats: JPG, PNG, WebP</li>
              <li>• Images will be automatically optimized</li>
            </ul>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Link
            href="/admin/gallery"
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-center"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={() => {
              setFormData((prev) => ({ ...prev, status: "draft" }));
              handleSubmit({ preventDefault: () => {} } as React.FormEvent);
            }}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save as Draft"}
          </button>
          <button
            type="submit"
            onClick={() => {
              setFormData((prev) => ({ ...prev, status: "published" }));
            }}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-500 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
          >
            {isSubmitting ? "Publishing..." : "Publish Gallery"}
          </button>
        </div>
      </form>
    </div>
  );
}
