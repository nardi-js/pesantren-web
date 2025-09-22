"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import type { News } from "@/types/news";

interface FilterState {
  category: string;
  search: string;
}

const initialFilters: FilterState = { category: "All", search: "" };

export default function NewsClient() {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);
  const [featuredNews, setFeaturedNews] = useState<News[]>([]);

  // Fetch news from API
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: "1",
          limit: "50",
        });

        if (filters.category !== "All") {
          params.append("category", filters.category);
        }

        if (filters.search) {
          params.append("search", filters.search);
        }

        const response = await fetch(`/api/news?${params}`);
        const result = await response.json();

        if (result.success) {
          setNews(result.data.news || []);
          setCategories(result.data.categories || []);
        } else {
          setError("Gagal memuat data berita");
        }
      } catch (err) {
        console.error("Error fetching news:", err);
        setError("Gagal memuat data berita");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [filters.category, filters.search]);

  // Fetch featured news
  useEffect(() => {
    const fetchFeaturedNews = async () => {
      try {
        const response = await fetch("/api/news?featured=true&limit=3");
        const result = await response.json();

        if (result.success) {
          setFeaturedNews(result.data.news || []);
        }
      } catch (err) {
        console.error("Failed to fetch featured news:", err);
      }
    };

    fetchFeaturedNews();
  }, []);

  const change = (k: keyof FilterState, v: string) =>
    setFilters((f) => ({ ...f, [k]: v }));

  const filtered = useMemo(() => {
    return news.filter((item) => item.status === "published");
  }, [news]);

  const latestNews = useMemo(() => filtered[0], [filtered]);

  return (
    <section className="section-base pt-20 pb-20">
      <div className="app-container space-y-14">
        <Filters
          filters={filters}
          onChange={change}
          onResetAll={() => setFilters(initialFilters)}
          categories={categories}
        />

        {latestNews && <NewsHighlight item={latestNews} />}

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="animate-pulse">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-64"></div>
              </div>
            ))
          ) : error ? (
            <div className="col-span-full text-center text-red-500">
              {error}
            </div>
          ) : (
            filtered.map((item) => <NewsCard key={item._id} news={item} />)
          )}
          {!loading && !error && filtered.length === 0 && (
            <p className="col-span-full text-center text-sm text-[hsl(var(--foreground-soft))]">
              Tidak ada berita cocok dengan filter.
            </p>
          )}
        </div>

        <FeaturedSection news={featuredNews} />
      </div>
    </section>
  );
}

function Filters({
  filters,
  onChange,
  onResetAll,
  categories,
}: {
  filters: FilterState;
  onChange: (k: keyof FilterState, v: string) => void;
  onResetAll: () => void;
  categories: string[];
}) {
  return (
    <div className="rounded-xl surface-card elevated p-6 flex flex-col md:flex-row gap-6 md:items-end animate-fade-up">
      <div className="flex flex-col gap-2 w-full md:w-48">
        <label
          htmlFor="filter-category"
          className="text-sm font-medium text-[hsl(var(--foreground-soft))]"
        >
          Kategori
        </label>
        <select
          id="filter-category"
          value={filters.category}
          onChange={(e) => onChange("category", e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        >
          <option value="All">Semua Kategori</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2 flex-1">
        <label
          htmlFor="filter-search"
          className="text-sm font-medium text-[hsl(var(--foreground-soft))]"
        >
          Cari Berita
        </label>
        <input
          id="filter-search"
          type="text"
          placeholder="Ketik kata kunci..."
          value={filters.search}
          onChange={(e) => onChange("search", e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        />
      </div>

      <button
        onClick={onResetAll}
        className="btn-outline px-6 py-2 whitespace-nowrap"
      >
        Reset Filter
      </button>
    </div>
  );
}

function NewsHighlight({ item }: { item: News }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="rounded-2xl surface-card elevated overflow-hidden animate-fade-up animation-delay-100">
      <div className="grid md:grid-cols-2 gap-0">
        <div className="relative aspect-[4/3] md:aspect-auto">
          <Image
            src={
              item.image ||
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=500&fit=crop"
            }
            alt={item.title}
            fill
            className="object-cover"
          />
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 rounded-full bg-emerald-500 text-white text-sm font-medium">
              Terbaru
            </span>
          </div>
        </div>
        <div className="p-8 flex flex-col justify-center">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-[hsl(var(--foreground-soft))]">
              <span className="px-2 py-1 rounded bg-[hsl(var(--surface-alt))] text-emerald-600 font-medium">
                {item.category}
              </span>
              <span></span>
              <span>{item.publishedAt && formatDate(item.publishedAt)}</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-[hsl(var(--foreground))] leading-tight">
              {item.title}
            </h3>
            <p className="text-[hsl(var(--foreground-soft))] leading-relaxed">
              {item.excerpt}
            </p>
            <Link
              href={`/news/${item.slug}`}
              className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium group"
            >
              Baca Selengkapnya
              <svg
                className="w-4 h-4 transition-transform group-hover:translate-x-1"
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
        </div>
      </div>
    </div>
  );
}

function NewsCard({ news }: { news: News }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Link href={`/news/${news.slug}`}>
      <article className="group surface-card hoverable rounded-xl overflow-hidden animate-fade-up">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={
              news.image ||
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=500&fit=crop"
            }
            alt={news.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3">
            <span className="px-2 py-1 rounded-full bg-white/90 text-emerald-600 text-xs font-medium">
              {news.category}
            </span>
          </div>
        </div>
        <div className="p-6 space-y-3">
          <div className="flex items-center gap-2 text-xs text-[hsl(var(--foreground-soft))]">
            <span>{news.publishedAt && formatDate(news.publishedAt)}</span>
            <span></span>
            <span>{news.views} views</span>
          </div>
          <h3 className="text-lg font-bold text-[hsl(var(--foreground))] leading-tight line-clamp-2 group-hover:text-emerald-600">
            {news.title}
          </h3>
          <p className="text-sm text-[hsl(var(--foreground-soft))] line-clamp-3">
            {news.excerpt}
          </p>
          <div className="flex items-center gap-3 pt-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-sky-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {news.author.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm font-medium text-[hsl(var(--foreground))]">
              {news.author.name}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

/* Featured articles section (mirrors PrayerTimes placement on events page) */
function FeaturedSection({ news }: { news: News[] }) {
  if (!news || news.length === 0) return null;

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight text-[hsl(var(--foreground))]">
          Berita Unggulan
        </h2>
        <Link
          href="/news"
          className="text-sm font-medium text-emerald-600 hover:text-emerald-500"
          aria-label="Lihat semua berita"
        >
          Lihat Semua →
        </Link>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {news.map((item) => (
          <article
            key={item._id}
            className="group surface-card hoverable rounded-xl overflow-hidden flex flex-col"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src={
                  item.image ||
                  "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800&h=500&fit=crop"
                }
                alt={item.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-3 left-3 flex gap-2">
                <span className="px-2 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-semibold tracking-wide uppercase">
                  Featured
                </span>
              </div>
            </div>
            <div className="p-5 flex flex-col gap-3 flex-1">
              <h3 className="text-base font-semibold leading-snug text-[hsl(var(--foreground))] line-clamp-2 group-hover:text-emerald-600">
                {item.title}
              </h3>
              <p className="text-xs text-[hsl(var(--foreground-soft))] line-clamp-3 leading-relaxed">
                {item.excerpt}
              </p>
              <div className="mt-auto pt-2 flex items-center justify-between">
                <Link
                  href={`/news/${item.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-500"
                  aria-label={`Baca berita ${item.title}`}
                >
                  Baca
                  <svg
                    className="w-3 h-3"
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
                <span className="text-[10px] font-medium text-[hsl(var(--foreground-muted))]">
                  {item.views} view{item.views !== 1 && "s"}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
