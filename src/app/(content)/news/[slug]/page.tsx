import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FrontendApi } from "@/lib/api";

interface NewsDetailProps {
  params: Promise<{ slug: string }>;
}

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
  relatedNews?: NewsItem[];
}

async function getNewsData(slug: string): Promise<NewsItem | null> {
  try {
    const response = await FrontendApi.getNewsBySlug(slug);
    if (response.success && response.data) {
      return response.data as NewsItem;
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch news:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: NewsDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const news = await getNewsData(slug);

  if (!news) {
    return {
      title: "Berita Tidak Ditemukan",
      description: "Halaman berita yang Anda cari tidak ditemukan.",
    };
  }

  return {
    title: `${news.title} - Pesantren`,
    description: news.excerpt,
    keywords: news.tags.join(", "),
    openGraph: {
      title: news.title,
      description: news.excerpt,
      images: news.image ? [{ url: news.image }] : [],
      type: "article",
      publishedTime: news.publishedAt,
      authors: [news.author.name],
    },
    twitter: {
      card: "summary_large_image",
      title: news.title,
      description: news.excerpt,
      images: news.image ? [news.image] : [],
    },
  };
}

// Helper functions for categories
function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    Academic: "📚",
    Event: "📅",
    Achievement: "🏆",
    Announcement: "📢",
  };
  return icons[category] || "📰";
}

function getCategoryTitle(category: string): string {
  const titles: Record<string, string> = {
    Academic: "Akademik",
    Event: "Kegiatan",
    Achievement: "Prestasi",
    Announcement: "Pengumuman",
  };
  return titles[category] || category;
}

export async function generateStaticParams() {
  // For now, return empty array to allow dynamic generation
  // You can implement this to pre-generate pages if needed
  return [];
}

export default async function NewsDetailPage({ params }: NewsDetailProps) {
  const { slug } = await params;
  const news = await getNewsData(slug);

  if (!news) {
    return notFound();
  }

  // Get related news by category
  const relatedNews = news.relatedNews || [];

  return (
    <div className="section-base pt-28 md:pt-32 pb-16">
      <div className="app-container">
        <div className="grid md:grid-cols-[1fr_300px] gap-12 lg:gap-16">
          {/* Main column */}
          <article className="max-w-3xl mx-auto md:mx-0 animate-fade-up">
            <div className="relative w-full h-[320px] md:h-[420px] rounded-xl overflow-hidden shadow-md mb-8">
              {news.image ? (
                <Image
                  src={news.image}
                  alt={news.title}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 800px"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-sky-400 to-emerald-400 flex items-center justify-center">
                  <span className="text-white text-6xl font-bold">
                    {news.title.charAt(0)}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />
            </div>

            <header className="space-y-4 mb-8">
              <h1 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-emerald-600 dark:from-sky-400 dark:to-emerald-400">
                {news.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-[hsl(var(--foreground-soft))]">
                <span className="inline-flex items-center gap-1">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4S14.21 4 12 4 8 5.79 8 8s1.79 4 4 4Zm0 0c-4.33 0-8 2.17-8 6v2h16v-2c0-3.83-3.67-6-8-6Z" />
                  </svg>
                  {news.author.name}
                </span>
                <time
                  className="inline-flex items-center gap-1"
                  dateTime={news.publishedAt || news.createdAt}
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 2v2m8-2v2M3 9h18M5 7h14v13H5z" />
                  </svg>
                  {new Date(
                    news.publishedAt || news.createdAt
                  ).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </time>
                <span className="inline-flex items-center gap-1">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M4 6h16v12H4z" />
                  </svg>
                  {news.category}
                </span>
                <span className="inline-flex items-center gap-1">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {news.views} views
                </span>
              </div>
            </header>

            <NewsContent content={news.content} />
            <NewsBottomMeta news={news} />
          </article>

          {/* Sidebar */}
          <aside className="hidden md:block space-y-8 animate-fade-up animation-delay-100">
            <div className="rounded-xl surface-card elevated p-5">
              <h2 className="text-sm font-semibold tracking-wide uppercase text-[hsl(var(--foreground-muted))] mb-4">
                Berita Terkait
              </h2>
              {relatedNews.length > 0 ? (
                <ul className="space-y-4">
                  {relatedNews.slice(0, 4).map((related) => (
                    <li key={related._id} className="flex gap-3 group">
                      <div className="relative h-14 w-20 rounded-lg overflow-hidden flex-shrink-0">
                        {related.image ? (
                          <Image
                            src={related.image}
                            alt={related.title}
                            fill
                            className="object-cover group-hover:scale-[1.05] transition-transform duration-500"
                            sizes="120px"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-sky-400 to-emerald-400 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              {related.title.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <Link
                        href={`/news/${related.slug}`}
                        className="text-sm font-medium leading-snug text-[hsl(var(--foreground))] hover:text-sky-600 dark:hover:text-sky-300 transition-colors line-clamp-3"
                      >
                        {related.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[hsl(var(--foreground-muted))]">
                  Belum ada berita terkait
                </p>
              )}
            </div>

            {/* Category info */}
            <div className="rounded-xl surface-card elevated p-5">
              <h2 className="text-sm font-semibold tracking-wide uppercase text-[hsl(var(--foreground-muted))] mb-4">
                Kategori
              </h2>
              <Link
                href={`/news?category=${news.category}`}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300 text-sm font-medium hover:bg-sky-200 dark:hover:bg-sky-900/60 transition-colors"
              >
                <span>{getCategoryIcon(news.category)}</span>
                {getCategoryTitle(news.category)}
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

// News Content Component
function NewsContent({ content }: { content: string }) {
  return (
    <div className="prose prose-sky prose-lg dark:prose-invert max-w-none leading-relaxed space-y-6 animate-fade-up animation-delay-50">
      <div
        dangerouslySetInnerHTML={{ __html: content }}
        className="[&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mt-8 [&>h2]:mb-4 [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:mt-6 [&>h3]:mb-3 [&>p]:mb-4 [&>ul]:mb-4 [&>ol]:mb-4 [&>blockquote]:border-l-4 [&>blockquote]:border-sky-500 [&>blockquote]:pl-4 [&>blockquote]:italic"
      />
    </div>
  );
}

// News Bottom Meta Component
function NewsBottomMeta({ news }: { news: NewsItem }) {
  return (
    <div className="mt-14 space-y-10 animate-fade-up animation-delay-100">
      {/* Tags */}
      {news.tags && news.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {news.tags.map((tag: string) => (
            <Link
              key={tag}
              href={`/news?tag=${encodeURIComponent(tag.toLowerCase())}`}
              className="px-4 py-1.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300 ring-1 ring-sky-200/60 dark:ring-sky-700/40 hover:bg-sky-200 dark:hover:bg-sky-900/60 transition-colors"
            >
              {tag}
            </Link>
          ))}
        </div>
      )}

      {/* Share */}
      <div className="flex flex-wrap items-center gap-4">
        <span className="text-sm font-medium text-[hsl(var(--foreground-soft))]">
          Bagikan:
        </span>
        <ShareButton
          network="facebook"
          url={`${
            process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3003"
          }/news/${news.slug}`}
        />
        <ShareButton
          network="twitter"
          url={`${
            process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3003"
          }/news/${news.slug}`}
          title={news.title}
        />
        <ShareButton
          network="whatsapp"
          url={`${
            process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3003"
          }/news/${news.slug}`}
          title={news.title}
        />
      </div>

      {/* Back to News */}
      <div className="pt-6 border-t border-[hsl(var(--divider))]">
        <Link
          href="/news"
          className="inline-flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-300 dark:hover:text-sky-200 transition-colors"
        >
          ← Kembali ke Berita
        </Link>
      </div>
    </div>
  );
}

function ShareButton({
  network,
  url,
  title,
}: {
  network: "facebook" | "twitter" | "whatsapp";
  url: string;
  title?: string;
}) {
  const shareMap: Record<
    string,
    { href: string; label: string; icon: React.ReactNode }
  > = {
    facebook: {
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        url
      )}`,
      label: "Facebook",
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13 22v-8h3l1-4h-4V7.5A1.5 1.5 0 0 1 14.5 6H17V2h-2.5A5.5 5.5 0 0 0 9 7.5V10H6v4h3v8h4Z" />
        </svg>
      ),
    },
    twitter: {
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        url
      )}&text=${encodeURIComponent(title || "")}`,
      label: "Twitter",
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22 5.9c-.7.3-1.4.5-2.2.6a3.7 3.7 0 0 0 1.6-2 7.4 7.4 0 0 1-2.3.9 3.7 3.7 0 0 0-6.3 3.4A10.6 10.6 0 0 1 3.2 4.9a3.7 3.7 0 0 0 1.1 5 3.7 3.7 0 0 1-1.7-.5v.1a3.7 3.7 0 0 0 3 3.6 3.7 3.7 0 0 1-1.7.1 3.7 3.7 0 0 0 3.4 2.5A7.5 7.5 0 0 1 2 18.6 10.5 10.5 0 0 0 7.7 20c7.3 0 11.4-6.1 11.4-11.4v-.5A8 8 0 0 0 22 5.9Z" />
        </svg>
      ),
    },
    whatsapp: {
      href: `https://wa.me/?text=${encodeURIComponent(
        (title ? title + " - " : "") + url
      )}`,
      label: "WhatsApp",
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.5 3.5A11.8 11.8 0 0 0 12 0 12 12 0 0 0 2.3 17.7L0 24l6.5-2.3A12 12 0 0 0 12 24h.1A12 12 0 0 0 24 12a11.8 11.8 0 0 0-3.5-8.5ZM12 22.1a10 10 0 0 1-5.1-1.4l-.4-.2-3.8 1.3 1.3-3.7-.3-.4a10 10 0 1 1 18.9-5.4A10 10 0 0 1 12 22.1Zm5.4-7.5c-.3-.2-1.7-.9-2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-.9 1.1-.2.2-.3.2-.6 0a8.1 8.1 0 0 1-2.4-1.5 9 9 0 0 1-1.6-2c-.2-.4 0-.6.1-.8l.3-.3c.2-.2.3-.4.4-.5l.2-.4c.1-.2 0-.4 0-.5L9.7 7c-.2-.5-.5-.4-.7-.4h-.6a1 1 0 0 0-.7.3c-.2.2-1 1-1 2.4s1 2.8 1.1 3c.1.2 2 3.2 4.9 4.5.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.6-.1 1.7-.7 1.9-1.3.2-.6.2-1.1.1-1.3-.1-.2-.3-.2-.6-.4Z" />
        </svg>
      ),
    },
  };
  const cfg = shareMap[network];
  return (
    <a
      href={cfg.href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-sky-500 hover:bg-sky-600 text-white shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 transition-colors"
      aria-label={`Bagikan ke ${cfg.label}`}
    >
      {cfg.icon}
      {cfg.label}
    </a>
  );
}
