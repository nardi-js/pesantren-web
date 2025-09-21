"use client";
import { FormField } from "@/components/admin/FormField";
import { ImageUploader, ImageData } from "@/components/admin/ImageUploader";
import { YouTubeInput } from "@/components/admin/YouTubePreview";
import { useToast } from "@/components/admin/ToastProvider";
import { AdminApi } from "@/lib/api";
import { uploadImageToCloudinary } from "@/lib/image-upload";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface NewsFormData {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  videoUrl: string;
  authorName: string;
  authorEmail: string;
  authorRole: string;
  status: "draft" | "published";
  priority: number;
  featured: boolean;
  tags: string;
  image: string;
}

export default function NewNewsPage() {
  const { push } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [formData, setFormData] = useState<NewsFormData>({
    title: "",
    excerpt: "",
    content: "",
    category: "",
    videoUrl: "",
    authorName: "Admin",
    authorEmail: "",
    authorRole: "Admin",
    status: "draft",
    priority: 1,
    featured: false,
    tags: "",
    image: "",
  });

  const handleInputChange = (
    field: keyof NewsFormData,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (status: "draft" | "published") => {
    if (!formData.title.trim() || !formData.content.trim()) {
      push("Title and content are required", "error");
      return;
    }

    setLoading(true);
    console.log("🚀 Submitting news data:", { ...formData, status });

    try {
      let imageUrl =
        formData.image ||
        "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=800&h=400&fit=crop";

      // Upload image to Cloudinary if selected
      if (selectedImage && !selectedImage.isUploaded) {
        console.log("📤 Uploading selected image to Cloudinary...");
        const uploadResult = await uploadImageToCloudinary(selectedImage);

        if (uploadResult.success && uploadResult.url) {
          imageUrl = uploadResult.url;
          console.log("✅ Image uploaded successfully:", imageUrl);
        } else {
          console.error("❌ Image upload failed:", uploadResult.error);
          push(`Image upload failed: ${uploadResult.error}`, "error");
          setLoading(false);
          return;
        }
      }

      // Prepare data for submission
      const submitData = {
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        category: formData.category,
        videoUrl: formData.videoUrl,
        authorName: formData.authorName,
        authorEmail: formData.authorEmail,
        authorRole: formData.authorRole,
        status: status,
        priority: formData.priority,
        featured: formData.featured,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
        image: imageUrl,
      };

      console.log("📤 Sending to API:", submitData);

      const response = await AdminApi.createNews(submitData);
      console.log("📥 API Response:", response);

      if (response.success) {
        push(
          `News article ${
            status === "published" ? "published" : "saved as draft"
          } successfully!`,
          "success"
        );
        router.push("/admin/news");
      } else {
        throw new Error(response.error || "Failed to create news");
      }
    } catch (error) {
      console.error("❌ News submission error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create news";
      push(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-wide">
            New News Article
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Create and publish a news article or announcement.
          </p>
        </div>
        <Link
          href="/admin/news"
          className="text-xs self-start sm:self-auto text-sky-600 dark:text-sky-400 hover:underline"
        >
          Back to list
        </Link>
      </div>

      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Title" required>
            <input
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
              placeholder="News article title"
              required
            />
          </FormField>

          <FormField label="Category" required>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange("category", e.target.value)}
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
              aria-label="Select news category"
              required
            >
              <option value="">Select Category</option>
              <option value="Academic">Academic</option>
              <option value="Events">Events</option>
              <option value="Financial">Financial</option>
              <option value="General">General</option>
              <option value="Announcements">Announcements</option>
            </select>
          </FormField>
        </div>

        <FormField label="Excerpt" required>
          <textarea
            value={formData.excerpt}
            onChange={(e) => handleInputChange("excerpt", e.target.value)}
            rows={3}
            className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
            placeholder="Brief summary for news listings"
            required
          />
        </FormField>

        <FormField label="Content" required>
          <textarea
            value={formData.content}
            onChange={(e) => handleInputChange("content", e.target.value)}
            rows={15}
            className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
            placeholder="Write your news article content here..."
            required
          />
        </FormField>

        {/* Meta Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField label="Priority">
            <select
              value={formData.priority}
              onChange={(e) =>
                handleInputChange("priority", parseInt(e.target.value))
              }
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
              aria-label="Select priority level"
            >
              <option value={1}>Low (1)</option>
              <option value={2}>Medium (2)</option>
              <option value={3}>High (3)</option>
              <option value={4}>Urgent (4)</option>
              <option value={5}>Critical (5)</option>
            </select>
          </FormField>

          <FormField label="Featured">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="featured-checkbox"
                checked={formData.featured}
                onChange={(e) =>
                  handleInputChange("featured", e.target.checked)
                }
                className="rounded border-slate-300 dark:border-slate-600"
              />
              <label
                htmlFor="featured-checkbox"
                className="text-sm text-slate-700 dark:text-slate-300"
              >
                Feature this article
              </label>
            </div>
          </FormField>

          <FormField label="Tags">
            <input
              value={formData.tags}
              onChange={(e) => handleInputChange("tags", e.target.value)}
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
              placeholder="Comma-separated tags"
            />
          </FormField>
        </div>

        {/* Author Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField label="Author Name">
            <input
              value={formData.authorName}
              onChange={(e) => handleInputChange("authorName", e.target.value)}
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
              placeholder="Author name"
            />
          </FormField>

          <FormField label="Author Email">
            <input
              type="email"
              value={formData.authorEmail}
              onChange={(e) => handleInputChange("authorEmail", e.target.value)}
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
              placeholder="author@example.com"
            />
          </FormField>

          <FormField label="Author Role">
            <input
              value={formData.authorRole}
              onChange={(e) => handleInputChange("authorRole", e.target.value)}
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
              placeholder="Admin, Editor, etc."
            />
          </FormField>
        </div>

        {/* Media */}
        <FormField
          label="Featured Image"
          hint="Upload an image for the article"
        >
          <ImageUploader
            onImageSelect={(imageData) => {
              setSelectedImage(imageData);
              if (imageData) {
                handleInputChange("image", imageData.preview || "");
              }
            }}
            currentImage={selectedImage?.preview}
          />
        </FormField>

        <FormField label="YouTube Video" hint="Optional video embed">
          <YouTubeInput
            value={formData.videoUrl}
            onChange={(value) => handleInputChange("videoUrl", value)}
            showPreview={true}
          />
        </FormField>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => handleSubmit("published")}
            disabled={loading}
            className="px-4 py-2 rounded-md bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium disabled:opacity-50"
          >
            {loading ? "Publishing..." : "Publish Article"}
          </button>

          <button
            type="button"
            onClick={() => handleSubmit("draft")}
            disabled={loading}
            className="px-4 py-2 rounded-md border border-slate-300 dark:border-slate-600 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Draft"}
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 rounded-md border border-slate-300 dark:border-slate-600 text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
