"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { AdminApi } from "@/lib/api";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { ToastProvider } from "@/components/admin/ToastProvider";
import { IGallery } from "@/models/Gallery";

interface GalleryFormData {
  title: string;
  description: string;
  category: string;
  type: "image" | "video" | "album";
  status: "draft" | "published" | "archived";
  content?: {
    imageUrl?: string;
    videoUrl?: string;
    youtubeId?: string;
  };
  items?: Array<{
    imageUrl?: string;
    videoUrl?: string;
    youtubeId?: string;
    caption?: string;
  }>;
  coverImage?: string;
}

export default function EditGalleryPage() {
  const router = useRouter();
  const params = useParams();
  const galleryId = params.id as string;

  const [formData, setFormData] = useState<GalleryFormData>({
    title: "",
    description: "",
    category: "Events",
    type: "image",
    status: "draft",
    content: {},
    items: [],
    coverImage: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [albumItems, setAlbumItems] = useState<
    Array<{
      imageUrl?: string;
      videoUrl?: string;
      youtubeId?: string;
      caption?: string;
    }>
  >([]);

  const loadGalleryData = useCallback(async () => {
    try {
      setIsLoadingData(true);
      const response = await AdminApi.getGalleryItemById(galleryId);
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to load gallery data");
      }

      const data = response.data as IGallery;

      setFormData({
        title: data.title || "",
        description: data.description || "",
        category: data.category || "Events",
        type: data.type || "image",
        status: data.status || "draft",
        content: data.content || {},
        items: data.items || [],
        coverImage: data.coverImage || "",
      });

      if (data.type === "album" && data.items) {
        setAlbumItems(data.items);
      }
    } catch (error) {
      console.error("Error loading gallery data:", error);
      alert("Failed to load gallery data");
    } finally {
      setIsLoadingData(false);
    }
  }, [galleryId]);

  useEffect(() => {
    loadGalleryData();
  }, [loadGalleryData]);

  const extractYouTubeId = (url: string): string | null => {
    const regex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert("Title is required");
      return;
    }

    try {
      setIsLoading(true);

      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("category", formData.category);
      submitData.append("type", formData.type);
      submitData.append("status", formData.status);

      if (formData.coverImage) {
        submitData.append("coverImage", formData.coverImage);
      }

      if (formData.type === "image" || formData.type === "video") {
        if (formData.content?.imageUrl) {
          submitData.append("content[imageUrl]", formData.content.imageUrl);
        }
        if (formData.content?.videoUrl) {
          const youtubeId = extractYouTubeId(formData.content.videoUrl);
          if (youtubeId) {
            submitData.append("content[youtubeId]", youtubeId);
          } else {
            submitData.append("content[videoUrl]", formData.content.videoUrl);
          }
        }
      } else if (formData.type === "album") {
        albumItems.forEach((item, index) => {
          if (item.imageUrl) {
            submitData.append(`items[${index}][imageUrl]`, item.imageUrl);
          }
          if (item.videoUrl) {
            const youtubeId = extractYouTubeId(item.videoUrl);
            if (youtubeId) {
              submitData.append(`items[${index}][youtubeId]`, youtubeId);
            } else {
              submitData.append(`items[${index}][videoUrl]`, item.videoUrl);
            }
          }
          if (item.caption) {
            submitData.append(`items[${index}][caption]`, item.caption);
          }
        });
      }

      await AdminApi.updateGalleryItem(galleryId, submitData);

      alert("Gallery updated successfully!");
      router.push("/admin/gallery");
    } catch (error) {
      console.error("Error updating gallery:", error);
      alert("Failed to update gallery");
    } finally {
      setIsLoading(false);
    }
  };

  const addAlbumItem = () => {
    setAlbumItems((prev) => [...prev, { caption: "" }]);
  };

  const removeAlbumItem = (index: number) => {
    setAlbumItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateAlbumItem = (index: number, field: string, value: string) => {
    setAlbumItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
              Edit Gallery Item
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    title="Enter gallery title"
                    required
                  />
                </div>

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
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                    <option value="album">Album</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  title="Enter gallery description"
                  placeholder="Enter description..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <option value="Other">Other</option>
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
                        status: e.target.value as
                          | "draft"
                          | "published"
                          | "archived",
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    title="Select publication status"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cover Image
                </label>
                <ImageUploader
                  currentImage={formData.coverImage}
                  onUpload={(url: string) =>
                    setFormData((prev) => ({ ...prev, coverImage: url }))
                  }
                />
              </div>

              {/* Content based on type */}
              {formData.type === "image" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Image
                  </label>
                  <ImageUploader
                    currentImage={formData.content?.imageUrl || ""}
                    onUpload={(url: string) =>
                      setFormData((prev) => ({
                        ...prev,
                        content: { ...prev.content, imageUrl: url },
                      }))
                    }
                  />
                </div>
              )}

              {formData.type === "video" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    YouTube Video URL
                  </label>
                  <input
                    type="url"
                    value={formData.content?.videoUrl || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        content: { ...prev.content, videoUrl: e.target.value },
                      }))
                    }
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              )}

              {formData.type === "album" && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Album Items
                    </label>
                    <button
                      type="button"
                      onClick={addAlbumItem}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Add Item
                    </button>
                  </div>

                  {albumItems.map((item, index) => (
                    <div
                      key={index}
                      className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 mb-4"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-gray-700 dark:text-gray-300">
                          Item {index + 1}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeAlbumItem(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Image
                          </label>
                          <ImageUploader
                            currentImage={item.imageUrl || ""}
                            onUpload={(url: string) =>
                              updateAlbumItem(index, "imageUrl", url)
                            }
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            YouTube URL (optional)
                          </label>
                          <input
                            type="url"
                            value={item.videoUrl || ""}
                            onChange={(e) =>
                              updateAlbumItem(index, "videoUrl", e.target.value)
                            }
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Caption
                        </label>
                        <input
                          type="text"
                          value={item.caption || ""}
                          onChange={(e) =>
                            updateAlbumItem(index, "caption", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          title="Enter caption for this item"
                          placeholder="Enter caption..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => router.push("/admin/gallery")}
                  className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? "Updating..." : "Update Gallery"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}
