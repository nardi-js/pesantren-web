"use client";
import Image from "next/image";
import Link from "next/link";
import { Section } from "./Section";
import { useState, useEffect } from "react";
import { FrontendApi } from "@/lib/api";

interface NewsItem {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  image?: string;
  category: string;
  featured: boolean;
  publishedAt?: string;
  createdAt: string;
  views: number;
  priority: number;
}

interface NewsSection {
  title: string;
  icon: string;
  color: string;
  bgColor: string;
  items: NewsItem[];
}

export function NewsHighlight() {
  const [allNews, setAllNews] = useState<NewsItem[]>([]);
  const [featuredNews, setFeaturedNews] = useState<NewsItem[]>([]);
  const [breakingNews, setBreakingNews] = useState<NewsItem[]>([]);
  const [newsSections, setNewsSections] = useState<NewsSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);

  useEffect(() => {
    const fetchAllNews = async () => {
      try {
        setLoading(true);

        // Fetch featured news
        const featuredResponse = await FrontendApi.getFeaturedNews(5);
        if (featuredResponse.success && featuredResponse.data) {
          const featuredData = featuredResponse.data as { news: NewsItem[] };
          setFeaturedNews(featuredData.news || []);
        }

        // Fetch latest news
        const latestResponse = await FrontendApi.getLatestNews(12);
        if (latestResponse.success && latestResponse.data) {
          const latestData = latestResponse.data as { news: NewsItem[] };
          const newsItems = latestData.news || [];
          setAllNews(newsItems);

          // Breaking news (priority 5 atau featured dengan views tinggi)
          const breaking = newsItems
            .filter(
              (item) =>
                item.priority === 5 || (item.featured && item.views > 50)
            )
            .slice(0, 3);
          setBreakingNews(breaking);

          // Categorize news
          const categories = [
            "Academic",
            "Event",
            "Achievement",
            "Announcement",
          ];
          const sections: NewsSection[] = categories
            .map((category) => {
              const categoryItems = newsItems
                .filter((item) => item.category === category)
                .slice(0, 3);
              return {
                title: getCategoryTitle(category),
                icon: getCategoryIcon(category),
                color: getCategoryColor(category),
                bgColor: getCategoryBgColor(category),
                items: categoryItems,
              };
            })
            .filter((section) => section.items.length > 0);

          setNewsSections(sections);
        }
      } catch (error) {
        console.error("Failed to fetch news:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllNews();
  }, []);

  // Breaking news ticker rotation - removed since using CSS animation
  // useEffect(() => {
  //   if (breakingNews.length > 1) {
  //     const interval = setInterval(() => {
  //       setCurrentBreakingIndex((prev) => (prev + 1) % breakingNews.length);
  //     }, 4000);
  //     return () => clearInterval(interval);
  //   }
  // }, [breakingNews.length]);

  // Featured carousel rotation
  useEffect(() => {
    if (featuredNews.length > 1) {
      const interval = setInterval(() => {
        setCurrentCarouselIndex((prev) => (prev + 1) % featuredNews.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [featuredNews.length]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getCategoryTitle = (category: string): string => {
    const titles: Record<string, string> = {
      Academic: "Akademik",
      Event: "Kegiatan",
      Achievement: "Prestasi",
      Announcement: "Pengumuman",
    };
    return titles[category] || category;
  };

  const getCategoryIcon = (category: string): string => {
    const icons: Record<string, string> = {
      Academic: "📚",
      Event: "📅",
      Achievement: "🏆",
      Announcement: "📢",
    };
    return icons[category] || "📰";
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      Academic: "text-blue-600",
      Event: "text-green-600",
      Achievement: "text-yellow-600",
      Announcement: "text-red-600",
    };
    return colors[category] || "text-gray-600";
  };

  const getCategoryBgColor = (category: string): string => {
    const colors: Record<string, string> = {
      Academic: "bg-blue-50 dark:bg-blue-900/20",
      Event: "bg-green-50 dark:bg-green-900/20",
      Achievement: "bg-yellow-50 dark:bg-yellow-900/20",
      Announcement: "bg-red-50 dark:bg-red-900/20",
    };
    return colors[category] || "bg-gray-50 dark:bg-gray-900/20";
  };
  if (loading) {
    return (
      <Section className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Berita Terkini</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Informasi terbaru dari Pesantren
            </p>
          </div>

          {/* Loading States */}
          <div className="space-y-8">
            {/* Breaking News Loading */}
            <div className="bg-red-500 text-white px-6 py-3 rounded-lg">
              <div className="animate-pulse flex items-center space-x-4">
                <span className="font-bold">⚡ BREAKING:</span>
                <div className="h-4 bg-red-300 rounded w-96"></div>
              </div>
            </div>

            {/* Featured Carousel Loading */}
            <div className="relative">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                <div className="h-80 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-3 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* News Grid Loading */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
                >
                  <div className="h-48 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>
    );
  }

  return (
    <Section className="relative overflow-hidden pt-24 pb-20">
      {/* decorative blurred gradients */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-500/20 dark:bg-emerald-400/10 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-sky-500/20 dark:bg-sky-400/10 blur-3xl" />
      </div>
      <div className="relative app-container">
        {/* Header */}
        <div className="text-center mb-14 max-w-3xl mx-auto">
          <h2 className="heading-lg mb-3 bg-gradient-to-r from-emerald-600 via-sky-600 to-emerald-600 bg-clip-text text-transparent dark:from-emerald-400 dark:via-sky-400 dark:to-emerald-400">
            Berita Terkini
          </h2>
          <p className="text-soft text-base md:text-lg">
            Informasi terbaru dari Pesantren
          </p>
        </div>

        <div className="space-y-16">
          {/* Breaking News Ticker */}
          {breakingNews.length > 0 && (
            <div className="relative bg-gradient-to-r from-emerald-500 to-sky-600 text-white px-6 py-3 rounded-xl overflow-hidden shadow-lg">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="animate-pulse text-lg">⚡</span>
                  <span className="font-semibold text-sm uppercase tracking-wide">
                    Breaking
                  </span>
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="ticker-content whitespace-nowrap">
                    {breakingNews.map((item) => (
                      <Link
                        key={item._id}
                        href={`/news/${item.slug}`}
                        className="inline-block mx-8 hover:text-white/90 transition-colors font-medium"
                      >
                        {item.title}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Featured News Carousel (moved outside breaking ticker) */}
          {featuredNews.length > 0 && (
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold tracking-tight flex items-center gap-2 text-[hsl(var(--foreground))]">
                  <span className="text-2xl">🌟</span>
                  Berita Utama
                </h3>
                {featuredNews.length > 1 && (
                  <div className="flex gap-2">
                    {featuredNews.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentCarouselIndex(i)}
                        className={`h-2.5 w-2.5 rounded-full transition-all ${
                          i === currentCarouselIndex
                            ? "bg-gradient-to-r from-emerald-500 to-sky-500 scale-110 shadow"
                            : "bg-[hsl(var(--foreground-muted))]/30 hover:bg-[hsl(var(--foreground-muted))]/60"
                        }`}
                        aria-label={`Slide ${i + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="relative overflow-hidden rounded-2xl surface-card elevated">
                <div
                  className={`flex transition-transform duration-700 ease-out [width:${
                    featuredNews.length * 100
                  }%] ${
                    currentCarouselIndex === 0
                      ? "translate-x-0"
                      : `-translate-x-[${currentCarouselIndex}00%]`
                  }`}
                >
                  {featuredNews.map((item) => (
                    <div key={item._id} className="w-full shrink-0 relative">
                      <Link
                        href={`/news/${item.slug}`}
                        className="group block h-full"
                      >
                        <div className="relative h-80 md:h-96 w-full overflow-hidden">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.title}
                              fill
                              priority
                              className="object-cover transition-transform duration-[1200ms] group-hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                              <span className="text-6xl opacity-30">📰</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                          <div className="absolute bottom-0 inset-x-0 p-8 flex flex-col gap-4">
                            <div className="flex flex-wrap items-center gap-3 text-xs">
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white/90 font-medium border border-white/20">
                                {getCategoryIcon(item.category)}{" "}
                                {getCategoryTitle(item.category)}
                              </span>
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/40 text-white/80 font-medium">
                                👁️ {item.views}
                              </span>
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/40 text-white/80 font-medium">
                                📅{" "}
                                {formatDate(item.publishedAt || item.createdAt)}
                              </span>
                            </div>
                            <div className="space-y-3 max-w-3xl">
                              <h4 className="text-2xl md:text-3xl font-bold leading-snug tracking-tight text-white drop-shadow group-hover:text-emerald-200 transition-colors">
                                {item.title}
                              </h4>
                              <p className="text-white/80 text-sm md:text-base line-clamp-2 md:line-clamp-3">
                                {item.excerpt}
                              </p>
                            </div>
                            <div>
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-white/90 bg-white/15 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 group-hover:bg-emerald-500/30 group-hover:text-white transition-colors">
                                Baca Selengkapnya →
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Categorized News Sections */}
          {newsSections.map((section) => (
            <div
              key={section.title}
              className="surface-card elevated rounded-2xl p-8 space-y-8"
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <h3 className="text-lg font-semibold tracking-tight flex items-center gap-3 text-[hsl(var(--foreground))]">
                  <span className="text-2xl" aria-hidden>
                    {section.icon}
                  </span>
                  {section.title}
                  <span className="text-[10px] px-2 py-1 rounded-full bg-[hsl(var(--surface-alt))] text-[hsl(var(--foreground-muted))] font-medium">
                    {section.items.length} berita
                  </span>
                </h3>
                <Link
                  href="/news"
                  className="text-xs font-medium px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-sky-500 text-white shadow hover:shadow-md hover:from-emerald-600 hover:to-sky-600 transition-all"
                >
                  Lihat Semua →
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {section.items.map((item) => (
                  <Link
                    key={item._id}
                    href={`/news/${item.slug}`}
                    className="group relative rounded-xl overflow-hidden surface-subtle border border-[hsl(var(--border))] hover:border-emerald-400/50 transition-colors flex flex-col"
                  >
                    <div className="relative h-40 w-full overflow-hidden">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-100/30 to-sky-100/30 dark:from-emerald-400/10 dark:to-sky-400/10">
                          <span className="text-3xl opacity-30">
                            {section.icon}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                        <span className="px-2 py-1 rounded-full text-[10px] font-semibold tracking-wide bg-white/80 text-emerald-700 shadow backdrop-blur-md">
                          {getCategoryTitle(item.category)}
                        </span>
                      </div>
                      <div className="absolute bottom-3 right-3 text-[10px] font-medium text-white/90 bg-black/50 px-2 py-1 rounded-full backdrop-blur-sm">
                        👁️ {item.views}
                      </div>
                    </div>
                    <div className="p-4 flex flex-col gap-3 flex-1">
                      <h4 className="font-semibold leading-snug text-[hsl(var(--foreground))] line-clamp-2 group-hover:text-emerald-600 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-sm text-[hsl(var(--foreground-soft))] line-clamp-2">
                        {item.excerpt}
                      </p>
                      <div className="mt-auto pt-2 flex items-center justify-between text-[10px] text-[hsl(var(--foreground-muted))]">
                        <span>
                          📅 {formatDate(item.publishedAt || item.createdAt)}
                        </span>
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-medium group-hover:gap-2 transition-all">
                          Detail
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {/* All News Fallback */}
          {newsSections.length === 0 && allNews.length > 0 && (
            <div className="surface-card elevated rounded-2xl p-8 space-y-8">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <h3 className="text-lg font-semibold tracking-tight flex items-center gap-2 text-[hsl(var(--foreground))]">
                  <span className="text-2xl">📰</span>
                  Semua Berita
                </h3>
                <Link
                  href="/news"
                  className="text-xs font-medium px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-sky-500 text-white shadow hover:shadow-md hover:from-emerald-600 hover:to-sky-600 transition-all"
                >
                  Lihat Semua →
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {allNews.slice(0, 6).map((item) => (
                  <Link
                    key={item._id}
                    href={`/news/${item.slug}`}
                    className="group relative rounded-xl overflow-hidden surface-subtle border border-[hsl(var(--border))] hover:border-emerald-400/50 transition-colors flex flex-col"
                  >
                    <div className="relative h-40 w-full overflow-hidden">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-100/30 to-sky-100/30 dark:from-emerald-400/10 dark:to-sky-400/10">
                          <span className="text-3xl opacity-30">📰</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                        <span className="px-2 py-1 rounded-full text-[10px] font-semibold tracking-wide bg-white/80 text-emerald-700 shadow backdrop-blur-md">
                          {getCategoryTitle(item.category)}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 flex flex-col gap-3 flex-1">
                      <h4 className="font-semibold leading-snug text-[hsl(var(--foreground))] line-clamp-2 group-hover:text-emerald-600 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-sm text-[hsl(var(--foreground-soft))] line-clamp-2">
                        {item.excerpt}
                      </p>
                      <div className="mt-auto pt-2 flex items-center justify-between text-[10px] text-[hsl(var(--foreground-muted))]">
                        <span>
                          📅 {formatDate(item.publishedAt || item.createdAt)}
                        </span>
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-medium group-hover:gap-2 transition-all">
                          Detail
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* View All News Button */}
          <div className="text-center">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-emerald-500 via-sky-500 to-emerald-600 hover:from-emerald-600 hover:via-sky-600 hover:to-emerald-700 text-white font-medium shadow-lg hover:shadow-xl transition-all text-sm tracking-wide"
            >
              <span>Lihat Semua Berita</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>

          {/* Empty State */}
          {allNews.length === 0 && !loading && (
            <div className="text-center py-16">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/10 to-sky-500/10 text-4xl mb-6">
                📰
              </div>
              <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-2">
                Belum Ada Berita
              </h3>
              <p className="text-[hsl(var(--foreground-soft))] max-w-md mx-auto">
                Berita akan ditampilkan di sini setelah dipublikasikan oleh
                admin.
              </p>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
