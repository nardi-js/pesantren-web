"use client";
import { FormField } from "@/components/admin/FormField";
import { ImageUploader, ImageData } from "@/components/admin/ImageUploader";
import { YouTubeInput } from "@/components/admin/YouTubePreview";
import { useToast } from "@/components/admin/ToastProvider";
import { AdminApi } from "@/lib/api";
import { uploadImageToCloudinary } from "@/lib/image-upload";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

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

interface News {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image?: string;
  videoUrl?: string;
  author: {
    name: string;
    email?: string;
    role?: string;
  };
  status: "draft" | "published";
  publishedAt?: string;
  views: number;
  category: string;
  priority: number;
  featured: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export default function EditNewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { push } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [news, setNews] = useState<News | null>(null);
  const [newsId, setNewsId] = useState<string>("");
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

  // Resolve params first
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setNewsId(resolvedParams.id);
    };
    resolveParams();
  }, [params]);

  // Load news data
  useEffect(() => {
    if (!newsId) return;

    const loadNews = async () => {
      try {
        setInitialLoading(true);
        const response = await AdminApi.getNewsById(newsId);

        if (response.success && response.data) {
          const newsData = response.data as News;
          setNews(newsData);
          setFormData({
            title: newsData.title,
            excerpt: newsData.excerpt,
            content: newsData.content,
            category: newsData.category,
            videoUrl: newsData.videoUrl || "",
            authorName: newsData.author.name,
            authorEmail: newsData.author.email || "",
            authorRole: newsData.author.role || "Admin",
            status: newsData.status,
            priority: newsData.priority,
            featured: newsData.featured,
            tags: newsData.tags.join(", "),
            image: newsData.image || "",
          });
        } else {
          throw new Error(response.error || "Failed to load news");
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to load news";
        push(errorMessage, "error");
        router.push("/admin/news");
      } finally {
        setInitialLoading(false);
      }
    };

    loadNews();
  }, [newsId, push, router]);

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
    console.log("🚀 Updating news data:", { ...formData, status });

    try {
      let imageUrl = formData.image || "";

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

      const response = await AdminApi.updateNews(newsId, submitData);
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
        throw new Error(response.error || "Failed to update news");
      }
    } catch (error) {
      console.error("❌ News update error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update news";
      push(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
        <p className="ml-3 text-slate-600 dark:text-slate-400">
          Loading news...
        </p>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="text-center">
        <p className="text-slate-600 dark:text-slate-400">News not found</p>
        <Link href="/admin/news" className="text-sky-600 hover:underline">
          Back to news list
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-wide">
            Edit News Article
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Update &ldquo;{news.title}&rdquo;
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
          hint="Upload a new image to replace current one"
        >
          <ImageUploader
            onImageSelect={(imageData) => {
              setSelectedImage(imageData);
              if (imageData) {
                handleInputChange("image", imageData.preview);
              }
            }}
            currentImage={selectedImage?.preview || formData.image}
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
