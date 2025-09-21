"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { FrontendApi } from "@/lib/api";

interface NewsItem {
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

interface NewsResponse {
  news: NewsItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  categories: string[];
}

export default function NewsClient() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [featuredNews, setFeaturedNews] = useState<NewsItem[]>([]);

  // Fetch news data
  const fetchNews = async (page = 1, category = "all", search = "") => {
    try {
      setLoading(true);
      const params: Record<string, unknown> = {
        page,
        limit: 9,
        sortBy: "publishedAt",
        sortOrder: "desc" as const,
      };

      if (category !== "all") {
        params.category = category;
      }

      if (search) {
        params.search = search;
      }

      const response = await FrontendApi.getNews(params);

      if (response.success && response.data) {
        const data = response.data as NewsResponse;
        setNews(data.news || []);
        setCategories(data.categories || []);
        setTotalPages(data.pagination?.pages || 1);
      } else {
        throw new Error(response.error || "Failed to fetch news");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch news";
      setError(errorMessage);
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch featured news
  const fetchFeaturedNews = async () => {
    try {
      const response = await FrontendApi.getFeaturedNews(3);
      if (response.success && response.data) {
        const data = response.data as NewsResponse;
        setFeaturedNews(data.news || []);
      }
    } catch (err) {
      console.error("Failed to fetch featured news:", err);
    }
  };

  useEffect(() => {
    fetchNews(1, selectedCategory, searchQuery);
    fetchFeaturedNews();
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    if (searchQuery) {
      const timeoutId = setTimeout(() => {
        fetchNews(1, selectedCategory, searchQuery);
        setCurrentPage(1);
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      fetchNews(1, selectedCategory, "");
      setCurrentPage(1);
    }
  }, [searchQuery, selectedCategory]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchNews(page, selectedCategory, searchQuery);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (error) {
    return (
      <section className="py-16 container mx-auto px-4">
        <div className="text-center">
          <div className="text-red-500 mb-4">Error: {error}</div>
          <button
            onClick={() => fetchNews(1, selectedCategory, searchQuery)}
            className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 container mx-auto px-4">
      <div className="space-y-12">
        {/* Search and Filter */}
        <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
          <div className="w-full lg:w-96">
            <input
              type="text"
              placeholder="Cari berita..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === "all"
                  ? "bg-sky-600 text-white"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
              }`}
            >
              Semua
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === category
                    ? "bg-sky-600 text-white"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Featured News */}
        {featuredNews.length > 0 && currentPage === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Berita Unggulan
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {featuredNews.map((item) => (
                <FeaturedCard
                  key={item._id}
                  item={item}
                  formatDate={formatDate}
                />
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
          </div>
        )}

        {/* News Grid */}
        {!loading && news.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {selectedCategory === "all"
                ? "Semua Berita"
                : `Berita ${selectedCategory}`}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map((item) => (
                <NewsCard key={item._id} item={item} formatDate={formatDate} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && news.length === 0 && (
          <div className="text-center py-12">
            <div className="text-slate-500 dark:text-slate-400 text-lg">
              {searchQuery || selectedCategory !== "all"
                ? "Tidak ada berita yang ditemukan"
                : "Belum ada berita yang dipublikasikan"}
            </div>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </section>
  );
}

function FeaturedCard({
  item,
  formatDate,
}: {
  item: NewsItem;
  formatDate: (date: string) => string;
}) {
  return (
    <article className="group relative rounded-xl overflow-hidden bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-up">
      <div className="aspect-video relative overflow-hidden">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-sky-400 to-emerald-400 flex items-center justify-center">
            <span className="text-white text-4xl font-bold">
              {item.title.charAt(0)}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <span className="inline-block px-3 py-1 bg-sky-600 text-white text-sm rounded-full mb-2">
            {item.category}
          </span>
          <h3 className="text-white font-bold text-lg line-clamp-2">
            {item.title}
          </h3>
        </div>
      </div>

      <div className="p-6">
        <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-3 mb-4">
          {item.excerpt}
        </p>

        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {formatDate(item.publishedAt || item.createdAt)}
          </div>
          <Link
            href={`/news/${item.slug}`}
            className="text-sky-600 hover:text-sky-700 font-medium text-sm hover:underline"
          >
            Baca Selengkapnya
          </Link>
        </div>
      </div>
    </article>
  );
}

function NewsCard({
  item,
  formatDate,
}: {
  item: NewsItem;
  formatDate: (date: string) => string;
}) {
  return (
    <article className="group bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-up">
      <div className="aspect-video relative overflow-hidden">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center">
            <span className="text-white text-3xl font-bold">
              {item.title.charAt(0)}
            </span>
          </div>
        )}
        <div className="absolute top-4 left-4">
          <span className="inline-block px-3 py-1 bg-white/90 text-slate-700 text-xs rounded-full">
            {item.category}
          </span>
        </div>
        {item.featured && (
          <div className="absolute top-4 right-4">
            <span className="inline-block px-3 py-1 bg-amber-500 text-white text-xs rounded-full">
              Featured
            </span>
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 line-clamp-2 group-hover:text-sky-600 transition-colors">
          {item.title}
        </h3>

        <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-3 mb-4">
          {item.excerpt}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 text-sm text-slate-500 dark:text-slate-400">
            <span>{formatDate(item.publishedAt || item.createdAt)}</span>
            <span>•</span>
            <span>{item.views} views</span>
          </div>
          <Link
            href={`/news/${item.slug}`}
            className="text-sky-600 hover:text-sky-700 font-medium text-sm hover:underline"
          >
            Baca
          </Link>
        </div>
      </div>
    </article>
  );
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex justify-center items-center space-x-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
      >
        Previous
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            currentPage === page
              ? "bg-sky-600 text-white"
              : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
      >
        Next
      </button>
    </div>
  );
}
