"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/Container";

interface GalleryItem {
  _id: string;
  title: string;
  description: string;
  type: "image" | "video" | "album";
  category: string;
  status: "draft" | "published";
  featured: boolean;
  tags: string[];
  coverImage: string;
  slug: string;
  content?: {
    type: "image" | "youtube";
    url: string;
    caption?: string;
    altText?: string;
    youtubeId?: string;
  };
  items?: Array<{
    type: "image" | "youtube";
    url: string;
    youtubeId?: string;
    caption?: string;
    order?: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function GalleryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [galleryItem, setGalleryItem] = useState<GalleryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    const fetchGalleryItem = async () => {
      try {
        const response = await fetch(`/api/gallery/${params.slug}`);
        const data = await response.json();

        if (data.success) {
          setGalleryItem(data.data);
        } else {
          router.push("/gallery");
        }
      } catch (error) {
        console.error("Error fetching gallery item:", error);
        router.push("/gallery");
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      fetchGalleryItem();
    }
  }, [params.slug, router]);

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  const nextImage = () => {
    if (galleryItem?.items) {
      setCurrentImageIndex(
        (prevIndex) => (prevIndex + 1) % galleryItem.items!.length
      );
    }
  };

  const prevImage = () => {
    if (galleryItem?.items) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? galleryItem.items!.length - 1 : prevIndex - 1
      );
    }
  };

  const getImageUrls = () => {
    if (!galleryItem) return [];

    if (galleryItem.type === "image" && galleryItem.content) {
      return [galleryItem.content.url];
    } else if (galleryItem.type === "album" && galleryItem.items) {
      return galleryItem.items
        .filter((item) => item.type === "image")
        .map((item) => item.url);
    }
    return [];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Container className="py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </Container>
      </div>
    );
  }

  if (!galleryItem) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Container className="py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Gallery item not found
            </h1>
            <Link href="/gallery" className="text-blue-600 hover:text-blue-700">
              Back to Gallery
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  const imageUrls = getImageUrls();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Container className="py-8">
        {/* Navigation */}
        <div className="mb-6">
          <Link
            href="/gallery"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Gallery
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
              {galleryItem.category}
            </span>
            {galleryItem.featured && (
              <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded-full text-sm font-medium">
                ⭐ Featured
              </span>
            )}
            <span className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-sm font-medium">
              {galleryItem.type.charAt(0).toUpperCase() +
                galleryItem.type.slice(1)}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {galleryItem.title}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
            {galleryItem.description}
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Created on {new Date(galleryItem.createdAt).toLocaleDateString()}
          </div>
        </div>

        {/* Content */}
        <div className="mb-8">
          {galleryItem.type === "image" && galleryItem.content && (
            <div className="max-w-4xl mx-auto">
              <div
                className="relative aspect-video rounded-lg overflow-hidden cursor-pointer"
                onClick={() => openLightbox(0)}
              >
                <Image
                  src={galleryItem.content.url}
                  alt={galleryItem.content.altText || galleryItem.title}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              {galleryItem.content.caption && (
                <p className="text-center text-gray-600 dark:text-gray-300 mt-4">
                  {galleryItem.content.caption}
                </p>
              )}
            </div>
          )}

          {galleryItem.type === "video" && galleryItem.content?.youtubeId && (
            <div className="max-w-4xl mx-auto">
              <div className="relative aspect-video rounded-lg overflow-hidden">
                <iframe
                  src={`https://www.youtube.com/embed/${galleryItem.content.youtubeId}?rel=0&modestbranding=1`}
                  title={galleryItem.title}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
              {galleryItem.content.caption && (
                <p className="text-center text-gray-600 dark:text-gray-300 mt-4">
                  {galleryItem.content.caption}
                </p>
              )}
            </div>
          )}

          {galleryItem.type === "album" && galleryItem.items && (
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {galleryItem.items.map((item, index) => (
                  <div key={index} className="group">
                    {item.type === "image" ? (
                      <div
                        className="relative aspect-video rounded-lg overflow-hidden cursor-pointer"
                        onClick={() => openLightbox(index)}
                      >
                        <Image
                          src={item.url}
                          alt={
                            item.caption ||
                            `${galleryItem.title} - ${index + 1}`
                          }
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="relative aspect-video rounded-lg overflow-hidden">
                        <iframe
                          src={`https://www.youtube.com/embed/${item.youtubeId}?rel=0&modestbranding=1`}
                          title={
                            item.caption ||
                            `${galleryItem.title} - Video ${index + 1}`
                          }
                          className="w-full h-full"
                          allowFullScreen
                        />
                      </div>
                    )}
                    {item.caption && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                        {item.caption}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tags */}
        {galleryItem.tags && galleryItem.tags.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {galleryItem.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Related/Back to Gallery */}
        <div className="text-center">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            View More Gallery Items
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </Container>

      {/* Lightbox for images */}
      {isLightboxOpen && imageUrls.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white text-xl z-10 bg-black/50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/70"
            >
              ✕
            </button>

            {imageUrls.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-2xl z-10 bg-black/50 rounded-full w-12 h-12 flex items-center justify-center hover:bg-black/70"
                >
                  ‹
                </button>

                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-2xl z-10 bg-black/50 rounded-full w-12 h-12 flex items-center justify-center hover:bg-black/70"
                >
                  ›
                </button>
              </>
            )}

            <div className="relative">
              <Image
                src={imageUrls[currentImageIndex]}
                alt={`Gallery image ${currentImageIndex + 1}`}
                width={800}
                height={600}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
