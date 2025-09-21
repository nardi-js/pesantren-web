"use client";
import { FormField } from "@/components/admin/FormField";
import { ImageUploader, ImageData } from "@/components/admin/ImageUploader";
import { VideoEmbed } from "@/components/admin/VideoEmbed";
import { useToast } from "@/components/admin/ToastProvider";
import { AdminApi } from "@/lib/api";
import { uploadImageToCloudinary } from "@/lib/image-upload";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface EditBlogPageProps {
  params: {
    id: string;
  };
}

interface BlogData {
  _id: string;
  title: string;
  category: string;
  author: {
    name: string;
    avatar?: string;
  };
  tags: string[];
  excerpt: string;
  content: string;
  featuredImage: string;
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
}

export default function EditBlogPage({ params }: EditBlogPageProps) {
  const { push } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    author: "Admin",
    tags: "",
    excerpt: "",
    content: "",
    featuredImage: "",
    status: "draft" as "draft" | "published",
  });

  // Load existing blog data
  useEffect(() => {
    const loadBlog = async () => {
      try {
        setIsLoading(true);
        const response = await AdminApi.getBlog(params.id);

        if (response.success && response.data) {
          const blog = response.data as BlogData;
          setFormData({
            title: blog.title || "",
            category: blog.category || "",
            author: blog.author?.name || "Admin",
            tags: blog.tags?.join(", ") || "",
            excerpt: blog.excerpt || "",
            content: blog.content || "",
            featuredImage: blog.featuredImage || "",
            status: blog.status || "draft",
          });
        } else {
          throw new Error(response.error || "Failed to load blog");
        }
      } catch (error) {
        console.error("❌ Load blog error:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to load blog";
        push(`Error loading blog: ${errorMessage}`, "error");
        router.push("/admin/blog");
      } finally {
        setIsLoading(false);
      }
    };

    loadBlog();
  }, [params.id, push, router]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (status: "draft" | "published") => {
    if (!formData.title || !formData.content) {
      push("Please fill in required fields (Title and Content)", "error");
      return;
    }

    setIsSubmitting(true);
    console.log("🚀 Updating blog data:", { ...formData, status });

    try {
      let featuredImageUrl =
        formData.featuredImage ||
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop";

      // Upload new image to Cloudinary if selected
      if (selectedImage && !selectedImage.isUploaded) {
        console.log("📤 Uploading new image to Cloudinary...");
        const uploadResult = await uploadImageToCloudinary(selectedImage);

        if (uploadResult.success && uploadResult.url) {
          featuredImageUrl = uploadResult.url;
          console.log("✅ Image uploaded successfully:", featuredImageUrl);
        } else {
          console.error("❌ Image upload failed:", uploadResult.error);
          push(`Image upload failed: ${uploadResult.error}`, "error");
          setIsSubmitting(false);
          return;
        }
      }

      // Prepare data for submission
      const submitData = {
        ...formData,
        status,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
        author: {
          name: formData.author || "Admin",
        },
        featuredImage: featuredImageUrl,
      };

      console.log("📤 Sending to API:", submitData);

      const response = await AdminApi.updateBlog(params.id, submitData);
      console.log("📥 API Response:", response);

      if (response.success) {
        push(
          `Blog post ${
            status === "published" ? "published" : "updated"
          } successfully!`,
          "success"
        );
        router.push("/admin/blog");
      } else {
        throw new Error(response.error || "Failed to update blog post");
      }
    } catch (error) {
      console.error("❌ Blog update error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      push(
        `Failed to ${
          status === "published" ? "publish" : "update"
        } blog post: ${errorMessage}`,
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 max-w-4xl w-full">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto mb-4"></div>
            <p className="text-slate-500 dark:text-slate-400">
              Loading blog...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-wide">
            Edit Blog Post
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Update and manage your blog article.
          </p>
        </div>
        <Link
          href="/admin/blog"
          className="text-xs self-start sm:self-auto text-sky-600 dark:text-sky-400 hover:underline"
        >
          ← Back to Blog List
        </Link>
      </div>

      <form className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FormField label="Title" required>
            <input
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
              placeholder="Blog post title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
            />
          </FormField>
          <FormField label="Category" required>
            <select
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
              aria-label="Select blog category"
              value={formData.category}
              onChange={(e) => handleInputChange("category", e.target.value)}
            >
              <option value="">Select Category</option>
              <option value="Religious">Religious</option>
              <option value="Education">Education</option>
              <option value="Community">Community</option>
              <option value="Events">Events</option>
              <option value="News">News</option>
              <option value="Stories">Stories</option>
            </select>
          </FormField>
          <FormField label="Author">
            <input
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
              placeholder="Author name"
              value={formData.author}
              onChange={(e) => handleInputChange("author", e.target.value)}
            />
          </FormField>
          <FormField label="Tags">
            <input
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
              placeholder="Comma-separated tags"
              value={formData.tags}
              onChange={(e) => handleInputChange("tags", e.target.value)}
            />
          </FormField>
        </div>

        <FormField label="Excerpt">
          <textarea
            rows={3}
            className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
            placeholder="Brief description for blog listings"
            value={formData.excerpt}
            onChange={(e) => handleInputChange("excerpt", e.target.value)}
          />
        </FormField>

        <FormField label="Content" required>
          <textarea
            rows={15}
            className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
            placeholder="Write your blog post content here..."
            value={formData.content}
            onChange={(e) => handleInputChange("content", e.target.value)}
          />
        </FormField>

        <FormField
          label="Featured Image"
          hint="Will be uploaded when you save/publish"
        >
          <ImageUploader
            onImageSelect={(imageData) => {
              setSelectedImage(imageData);
              // Update preview URL for backward compatibility
              if (imageData) {
                handleInputChange("featuredImage", imageData.preview);
              }
            }}
            currentImage={formData.featuredImage}
          />
        </FormField>

        <FormField label="YouTube Video" hint="Optional embed">
          <VideoEmbed />
        </FormField>

        <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => handleSubmit("draft")}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving..." : "Save as Draft"}
            </button>
            <button
              type="button"
              onClick={() => handleSubmit("published")}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Publishing..." : "Update & Publish"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
