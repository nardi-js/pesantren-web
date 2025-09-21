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
    <Section className="bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
            Berita Terkini
          </h2>
          <p className="text-gray-600">Informasi terbaru dari Pesantren</p>
        </div>

        <div className="space-y-12">
          {/* Breaking News Ticker */}
          {breakingNews.length > 0 && (
            <div className="relative bg-blue-500 text-white px-6 py-3 rounded-lg overflow-hidden">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
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
                        className="inline-block mx-8 hover:text-blue-100 transition-colors"
                      >
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Featured News Carousel */}
          {featuredNews.length > 0 && (
            <div className="relative">
              <h3 className="text-2xl font-bold mb-6 flex items-center text-gray-800">
                <span className="text-2xl mr-3">🌟</span>
                Berita Utama
              </h3>

              <div className="relative overflow-hidden rounded-lg">
                <div
                  className={`flex carousel-smooth transform ${
                    currentCarouselIndex === 0
                      ? "translate-x-0"
                      : currentCarouselIndex === 1
                      ? "-translate-x-full"
                      : currentCarouselIndex === 2
                      ? "-translate-x-[200%]"
                      : "-translate-x-[300%]"
                  }`}
                >
                  {featuredNews.map((item) => (
                    <div
                      key={item._id}
                      className="flex-shrink-0 w-full relative"
                    >
                      <Link href={`/news/${item.slug}`} className="block group">
                        <div className="relative h-96 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                              <span className="text-6xl opacity-30">📰</span>
                            </div>
                          )}

                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                            <div className="flex items-center space-x-3 mb-3">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm ${getCategoryColor(
                                  item.category
                                )}`}
                              >
                                {getCategoryIcon(item.category)}{" "}
                                {getCategoryTitle(item.category)}
                              </span>
                              <span className="text-sm opacity-90">
                                👁️ {item.views} views
                              </span>
                            </div>
                            <h4 className="text-2xl font-bold mb-3 group-hover:text-yellow-300 transition-colors">
                              {item.title}
                            </h4>
                            <p className="text-gray-200 text-sm line-clamp-2">
                              {item.excerpt}
                            </p>
                            <div className="flex items-center justify-between mt-4">
                              <span className="text-sm opacity-80">
                                📅{" "}
                                {formatDate(item.publishedAt || item.createdAt)}
                              </span>
                              <span className="text-sm bg-blue-500 px-3 py-1 rounded-full">
                                Baca Selengkapnya →
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>

                {/* Carousel Indicators */}
                {featuredNews.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {featuredNews.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentCarouselIndex(index)}
                        className={`w-3 h-3 rounded-full transition-all ${
                          index === currentCarouselIndex
                            ? "bg-white scale-110"
                            : "bg-white/50 hover:bg-white/75"
                        }`}
                        title={`Go to slide ${index + 1}`}
                        aria-label={`Slide indicator ${index + 1}`}
                      />
                    ))}
                  </div>
                )}

                {/* Carousel Navigation */}
                {featuredNews.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setCurrentCarouselIndex((prev) =>
                          prev === 0 ? featuredNews.length - 1 : prev - 1
                        )
                      }
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
                      title="Previous slide"
                      aria-label="Previous news item"
                    >
                      ←
                    </button>
                    <button
                      onClick={() =>
                        setCurrentCarouselIndex(
                          (prev) => (prev + 1) % featuredNews.length
                        )
                      }
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
                      title="Next slide"
                      aria-label="Next news item"
                    >
                      →
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Categorized News Sections */}
          {newsSections.map((section) => (
            <div key={section.title} className="bg-white rounded-lg p-6">
              <h3 className="text-2xl font-bold mb-6 flex items-center text-gray-800">
                <span className="text-2xl mr-3">{section.icon}</span>
                {section.title}
              </h3>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {section.items.map((item) => (
                  <Link
                    key={item._id}
                    href={`/news/${item.slug}`}
                    className="group block bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
                  >
                    <div className="relative h-48">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <span className="text-4xl opacity-30">
                            {section.icon}
                          </span>
                        </div>
                      )}

                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-500 text-white">
                          {section.icon} {section.title}
                        </span>
                      </div>

                      <div className="absolute bottom-3 right-3">
                        <span className="text-white text-xs bg-gray-800 px-2 py-1 rounded">
                          {item.views} views
                        </span>
                      </div>
                    </div>

                    <div className="p-4">
                      <h4 className="font-semibold mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 text-gray-800">
                        {item.title}
                      </h4>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {item.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>
                          {formatDate(item.publishedAt || item.createdAt)}
                        </span>
                        <span className="text-blue-500 group-hover:text-blue-600 font-medium">
                          Lihat Detail
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
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-2xl font-bold mb-6 flex items-center text-gray-800">
                <span className="text-2xl mr-3">📰</span>
                Semua Berita
              </h3>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allNews.slice(0, 6).map((item) => (
                  <Link
                    key={item._id}
                    href={`/news/${item.slug}`}
                    className="group block bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
                  >
                    <div className="relative h-48">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <span className="text-4xl opacity-30">📰</span>
                        </div>
                      )}

                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-500 text-white">
                          {getCategoryIcon(item.category)}{" "}
                          {getCategoryTitle(item.category)}
                        </span>
                      </div>
                    </div>

                    <div className="p-4">
                      <h4 className="font-semibold mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 text-gray-800">
                        {item.title}
                      </h4>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {item.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>
                          {formatDate(item.publishedAt || item.createdAt)}
                        </span>
                        <span className="text-blue-500 group-hover:text-blue-600 font-medium">
                          Lihat Detail
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
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              Lihat Semua Berita →
            </Link>
          </div>

          {/* Empty State */}
          {allNews.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 text-gray-300">📰</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Belum Ada Berita
              </h3>
              <p className="text-gray-500">
                Berita akan ditampilkan di sini setelah dipublikasikan oleh
                admin
              </p>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
