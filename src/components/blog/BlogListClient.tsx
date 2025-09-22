"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { BlogApi, BlogPost } from "@/lib/blog-api";
import cn from "classnames";

export default function BlogListClient() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Load blogs and categories
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load categories
        const categoriesData = await BlogApi.getCategories();
        setCategories(["Semua", ...categoriesData]);

        // Load blogs
        const blogsResponse = await BlogApi.getBlogs({
          page: currentPage,
          limit: 9,
          category: selectedCategory !== "Semua" ? selectedCategory : undefined,
        });

        if (blogsResponse.success) {
          setBlogs(blogsResponse.data.blogs);
          setTotalPages(blogsResponse.data.pagination.pages);
        } else {
          setError(blogsResponse.error || "Failed to load blogs");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [selectedCategory, currentPage]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page when changing category
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-[hsl(var(--destructive))] border border-[hsl(var(--destructive-border))] rounded-xl p-6 max-w-md mx-auto">
          <p className="text-[hsl(var(--destructive-foreground))] font-medium">
            Gagal memuat artikel: {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Category Filter - Modern Islamic Style with Dark Mode */}
      <div className="flex flex-wrap gap-3 animate-fade-up justify-center">
        {categories.map((cat) => {
          const active = cat === selectedCategory;
          return (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              disabled={isLoading}
              className={cn(
                "px-8 py-4 rounded-2xl text-sm font-bold border transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 disabled:opacity-50 relative overflow-hidden",
                active
                  ? "bg-gradient-to-r from-emerald-500 to-sky-600 text-white border-transparent shadow-lg hover:shadow-xl transform hover:scale-105"
                  : "bg-[hsl(var(--surface))] border-[hsl(var(--border))] hover:border-emerald-300 text-[hsl(var(--muted-foreground))] hover:text-emerald-600 hover:bg-[hsl(var(--accent))] hover:shadow-md transition-colors duration-300"
              )}
            >
              {active && (
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-sky-700 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              )}
              <span className="relative z-10">{cat}</span>
            </button>
          );
        })}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
          {[...Array(10)].map((_, i) => (
            <BlogCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Blog Grid */}
      {!isLoading && blogs.length > 0 && (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
          {blogs.map((post, i) => (
            <BlogCard key={post._id} post={post} index={i} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && blogs.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-[hsl(var(--muted))] rounded-2xl p-8 max-w-md mx-auto">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-sky-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-2">
              Belum Ada Artikel
            </h3>
            <p className="text-[hsl(var(--muted-foreground))]">
              {selectedCategory === "Semua"
                ? "Belum ada artikel yang dipublikasikan."
                : `Belum ada artikel dalam kategori "${selectedCategory}".`}
            </p>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-8">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Sebelumnya
          </button>

          <div className="flex gap-1">
            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    "w-10 h-10 text-sm font-medium rounded-lg transition-all",
                    page === currentPage
                      ? "bg-gradient-to-r from-emerald-600 to-sky-500 text-white shadow-lg"
                      : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-emerald-600"
                  )}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Selanjutnya →
          </button>
        </div>
      )}
    </div>
  );
}

function BlogCard({ post, index }: { post: BlogPost; index: number }) {
  const publishedDate = new Date(post.publishedAt);

  return (
    <article
      className={cn(
        "group rounded-xl overflow-hidden bg-[hsl(var(--surface))] border border-[hsl(var(--border))] shadow-md hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-500 flex flex-col animate-fade-up hover:-translate-y-1",
        `animation-delay-${Math.min(index * 100, 500)}`
      )}
    >
      <div className="relative aspect-[16/11] overflow-hidden bg-[hsl(var(--muted))]">
        <Image
          src={
            post.featuredImage ||
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=500&fit=crop"
          }
          alt={post.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Category Badge - Islamic Style */}
        <div className="absolute top-4 left-4">
          <span className="px-4 py-2 bg-gradient-to-r from-emerald-500/95 to-sky-500/95 text-xs font-bold text-white rounded-full border border-white/30 shadow-lg">
            {post.category}
          </span>
        </div>

        {/* Views Badge */}
        <div className="absolute top-4 right-4">
          <div className="flex items-center gap-1 px-3 py-1.5 bg-[hsl(var(--surface))]/90 text-[hsl(var(--muted-foreground))] text-xs rounded-full border border-[hsl(var(--border))] shadow-sm">
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
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <span className="font-medium">{post.views}</span>
          </div>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="space-y-3">
          <h3 className="text-xl font-bold leading-tight text-[hsl(var(--foreground))] ">
            <Link href={`/blog/${post.slug}`} className="block">
              {post.title}
            </Link>
          </h3>

          <div className="flex items-center gap-3 text-xs text-[hsl(var(--muted-foreground))]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-sky-500 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-white text-xs font-bold">
                  {post.author.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="font-medium">{post.author.name}</span>
            </div>
            <span className="w-1 h-1 rounded-full bg-[hsl(var(--border))]" />
            <time dateTime={post.publishedAt} className="font-medium">
              {publishedDate.toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </time>
          </div>

          <p className="text-sm text-[hsl(var(--muted-foreground))] line-clamp-3 leading-relaxed">
            {post.excerpt}
          </p>
        </div>

        <div className="flex items-center justify-between mt-auto pt-4">
          <div className="flex flex-wrap gap-1">
            {post.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 rounded-md bg-[hsl(var(--accent))] text-xs font-medium text-[hsl(var(--accent-foreground))] border border-[hsl(var(--border))]"
              >
                #{tag}
              </span>
            ))}
          </div>

          <Link
            href={`/blog/${post.slug}`}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-gradient-to-r from-emerald-600 to-sky-500 hover:from-emerald-700 hover:to-sky-600 text-white rounded-full shadow-md hover:shadow-lg transition-all duration-300 group-hover:scale-105"
          >
            Baca
            <svg
              className="w-3 h-3 transition-transform group-hover:translate-x-0.5"
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
    </article>
  );
}

function BlogCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-[hsl(var(--surface))] border border-[hsl(var(--border))] shadow-lg animate-pulse">
      <div className="aspect-[16/10] bg-[hsl(var(--muted))]" />
      <div className="p-6 space-y-4">
        <div className="space-y-3">
          <div className="h-6 bg-[hsl(var(--muted))] rounded-lg" />
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-[hsl(var(--muted))] rounded-full" />
            <div className="h-3 bg-[hsl(var(--muted))] rounded w-24" />
            <div className="w-1 h-1 bg-[hsl(var(--muted))] rounded-full" />
            <div className="h-3 bg-[hsl(var(--muted))] rounded w-20" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-[hsl(var(--muted))] rounded" />
            <div className="h-4 bg-[hsl(var(--muted))] rounded w-3/4" />
            <div className="h-4 bg-[hsl(var(--muted))] rounded w-1/2" />
          </div>
        </div>
        <div className="flex items-center justify-between pt-4">
          <div className="flex gap-2">
            <div className="h-6 bg-[hsl(var(--muted))] rounded-md w-12" />
            <div className="h-6 bg-[hsl(var(--muted))] rounded-md w-16" />
          </div>
          <div className="h-8 bg-[hsl(var(--muted))] rounded-full w-16" />
        </div>
      </div>
    </div>
  );
}
