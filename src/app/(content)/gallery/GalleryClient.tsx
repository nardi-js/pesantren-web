"use client";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

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

const categories = [
  "All",
  "Events",
  "Daily Life",
  "Education",
  "Facilities",
  "Activities",
  "Religious",
  "Community",
];

export default function GalleryClient() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const fetchGallery = useCallback(
    async (page = 1, category = "All", search = "") => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "12",
          status: "published",
        });

        if (category !== "All") {
          params.append("category", category);
        }

        if (search) {
          params.append("search", search);
        }

        const response = await fetch(`/api/gallery?${params}`);
        const data = await response.json();

        if (data.success) {
          setGalleryItems(data.data.data);
          setTotalPages(data.data.pagination.pages);
        }
      } catch (error) {
        console.error("Error fetching gallery:", error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchGallery(currentPage, selectedCategory, searchQuery);
  }, [currentPage, selectedCategory, searchQuery, fetchGallery]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCurrentPage(1);
    const formData = new FormData(e.currentTarget);
    const search = formData.get("search") as string;
    setSearchQuery(search);
  };

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

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % galleryItems.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? galleryItems.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search and Filter */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-md mx-auto">
          <div className="relative">
            <input
              type="text"
              name="search"
              placeholder="Search gallery..."
              className="w-full px-4 py-2 pl-10 pr-4 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
              defaultValue={searchQuery}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </form>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-pulse"
            >
              <div className="w-full h-48 bg-gray-300 dark:bg-gray-700"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : galleryItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {galleryItems.map((item, index) => (
            <div
              key={item._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer"
              onClick={() =>
                item.type === "image" ? openLightbox(index) : undefined
              }
            >
              <div className="relative w-full h-48 overflow-hidden">
                <Image
                  src={item.coverImage}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                  {getTypeIcon(item.type)}{" "}
                  {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                </div>
                {item.featured && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs">
                    ⭐ Featured
                  </div>
                )}
                {item.type === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/80 rounded-full p-3">
                      <svg
                        className="w-8 h-8 text-gray-800"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
                  {item.description}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {item.category}
                  </span>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              {item.type === "video" && (
                <Link
                  href={`/gallery/${item.slug}`}
                  className="block w-full bg-blue-600 text-white text-center py-2 hover:bg-blue-700 transition-colors"
                >
                  Watch Video
                </Link>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📷</div>
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            No gallery items found
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            {searchQuery || selectedCategory !== "All"
              ? "Try adjusting your search or filter."
              : "Check back later for new gallery items."}
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300"
            >
              Previous
            </button>

            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    currentPage === page
                      ? "bg-blue-600 text-white"
                      : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300"
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300"
            >
              Next
            </button>
          </nav>
        </div>
      )}

      {/* Lightbox */}
      {isLightboxOpen && galleryItems[currentImageIndex] && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white text-xl z-10 bg-black/50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/70"
            >
              ✕
            </button>

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

            <div className="relative">
              <Image
                src={galleryItems[currentImageIndex].coverImage}
                alt={galleryItems[currentImageIndex].title}
                width={800}
                height={600}
                className="max-w-full max-h-full object-contain"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <h3 className="text-white text-lg font-semibold">
                  {galleryItems[currentImageIndex].title}
                </h3>
                <p className="text-gray-300 text-sm">
                  {galleryItems[currentImageIndex].description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
