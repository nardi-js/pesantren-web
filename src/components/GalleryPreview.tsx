"use client";
import Image from "next/image";
import Link from "next/link";
import { Section } from "./Section";
import { useState, useEffect } from "react";

interface GalleryItem {
  _id: string;
  title: string;
  description: string;
  type: "image" | "video" | "album";
  category: string;
  coverImage: string;
  slug: string;
  featured: boolean;
  content?: {
    type: "image" | "youtube";
    youtubeId?: string;
  };
}

export function GalleryPreview() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedGallery = async () => {
      try {
        const response = await fetch(
          "/api/gallery?featured=true&limit=4&status=published"
        );
        const data = await response.json();

        if (data.success) {
          setGalleryItems(data.data.data);
        }
      } catch (error) {
        console.error("Error fetching featured gallery:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedGallery();
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "image":
        return "🖼️";
      case "video":
        return "🎥";
      case "album":
        return "📸";
      default:
        return "📷";
    }
  };

  return (
    <Section variant="base">
      <div className="text-center mb-16">
        <h2 className="heading-md mb-4 text-[hsl(var(--foreground))]">
          Galeri Pesantren
        </h2>
        <p className="text-base md:text-lg text-soft max-w-2xl mx-auto">
          Dokumentasi suasana dan kegiatan santri yang mencerminkan kehidupan
          islami modern yang bermakna.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="group relative aspect-video rounded-xl overflow-hidden surface-card animate-pulse"
            >
              <div className="w-full h-full bg-gray-300 dark:bg-gray-700"></div>
            </div>
          ))}
        </div>
      ) : galleryItems.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {galleryItems.map((item, index) => (
            <Link
              key={item._id}
              href={`/gallery/${item.slug}`}
              className={`group relative aspect-video rounded-xl overflow-hidden surface-card elevated hoverable transition-all duration-500 animate-zoom-in hover:scale-[1.02] ${
                index === 0
                  ? "animation-delay-0"
                  : index === 1
                  ? "animation-delay-100"
                  : index === 2
                  ? "animation-delay-200"
                  : "animation-delay-300"
              }`}
            >
              <Image
                src={item.coverImage}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Type indicator */}
              <div className="absolute top-3 left-3 bg-white/90 dark:bg-gray-900/90 text-gray-800 dark:text-white px-2 py-1 rounded-md text-xs font-medium">
                {getTypeIcon(item.type)}{" "}
                {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
              </div>

              {/* Featured badge */}
              {item.featured && (
                <div className="absolute top-3 right-3 bg-yellow-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                  ⭐ Featured
                </div>
              )}

              {/* Play button for videos */}
              {item.type === "video" && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-white/90 rounded-full p-3">
                    <svg
                      className="w-6 h-6 text-gray-800"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Content info */}
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="font-semibold text-sm mb-1 line-clamp-1">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-200 line-clamp-2">
                  {item.description}
                </p>
                <div className="mt-2 text-xs">
                  <span className="bg-white/20 px-2 py-1 rounded">
                    {item.category}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📷</div>
          <p className="text-gray-600 dark:text-gray-300">
            No featured gallery items available yet.
          </p>
        </div>
      )}

      <div className="text-center mt-12">
        <Link
          href="/gallery"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-sky-600 dark:from-emerald-400 dark:to-sky-400 text-white rounded-lg font-medium hover:scale-105 transition-transform duration-200 shadow-lg"
        >
          Lihat Semua Gallery
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
    </Section>
  );
}
