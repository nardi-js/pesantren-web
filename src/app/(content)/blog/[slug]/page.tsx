import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogApi, BlogPost } from "@/lib/blog-api";

interface Params {
  slug: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const response = await BlogApi.getBlogBySlug(resolvedParams.slug);
    if (!response.success || !response.data) {
      return { title: "Artikel Tidak Ditemukan" };
    }

    const post = response.data;
    return {
      title: `${post.title} | Blog Pesantren`,
      description: post.excerpt,
      openGraph: {
        title: post.title,
        description: post.excerpt,
        images: [{ url: post.featuredImage }],
        type: "article",
        publishedTime: post.publishedAt,
        authors: [post.author.name],
        tags: post.tags,
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: post.excerpt,
        images: [post.featuredImage],
      },
    };
  } catch (error) {
    console.error("Generate metadata error:", error);
    return { title: "Artikel Tidak Ditemukan" };
  }
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  try {
    const resolvedParams = await params;
    const response = await BlogApi.getBlogBySlug(resolvedParams.slug);

    if (!response.success || !response.data) {
      return notFound();
    }

    const post = response.data;

    // Get related posts from same category
    const relatedResponse = await BlogApi.getBlogs({
      category: post.category,
      limit: 3,
    });
    const relatedPosts = relatedResponse.success
      ? relatedResponse.data.blogs
          .filter((p) => p.slug !== post.slug)
          .slice(0, 3)
      : [];

    return (
      <div className="flex flex-col islamic-pattern">
        <Hero post={post} />
        <ArticleContent post={post} />
        {relatedPosts.length > 0 && <RelatedPosts posts={relatedPosts} />}
        <CommentsPlaceholder />
      </div>
    );
  } catch (error) {
    console.error("Blog detail page error:", error);
    return notFound();
  }
}

function Hero({ post }: { post: BlogPost }) {
  const publishedDate = new Date(post.publishedAt);

  return (
    <section className="relative w-full min-h-[85vh] overflow-hidden bg-gradient-to-br from-sky-100 via-sky-200 to-emerald-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 transition-colors duration-500">
      {/* Islamic Pattern Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-sky-500/10 to-emerald-500/10 dark:from-emerald-400/5 dark:via-sky-400/5 dark:to-emerald-400/5" />

      {/* Content */}
      <div className="relative z-10 flex items-center min-h-[85vh] mt-20">
        <div className="app-container py-20">
          <div className="max-w-4xl">
            {/* Modern Breadcrumb - Dual Theme */}
            <nav className="flex items-center space-x-3 text-sm mb-8">
              <Link
                href="/"
                className="text-gray-500 dark:text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors duration-300 font-medium"
              >
                Home
              </Link>
              <svg
                className="w-4 h-4 text-gray-300 dark:text-gray-600"
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
              <Link
                href="/blog"
                className="text-gray-500 dark:text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors duration-300 font-medium"
              >
                Blog
              </Link>
              <svg
                className="w-4 h-4 text-gray-300 dark:text-gray-600"
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
              <span className="text-sky-600 dark:text-sky-400 font-semibold">
                {post.category}
              </span>
            </nav>

            {/* Category Badge - Elegant Islamic Style with Dark Mode */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <div className="relative">
                <span className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 via-emerald-600 to-sky-600 dark:from-emerald-400 dark:via-emerald-500 dark:to-sky-500 text-white text-sm font-bold rounded-2xl shadow-lg border border-emerald-400/20 dark:border-emerald-300/30 transition-all duration-300">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {post.category}
                </span>
              </div>

              <div className="flex items-center gap-4 text-gray-600 dark:text-gray-300 text-sm">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-300">
                  <svg
                    className="w-4 h-4 text-gray-500 dark:text-gray-400"
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
                  <span className="font-medium">{post.views} views</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-300">
                  <svg
                    className="w-4 h-4 text-gray-500 dark:text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="font-medium">5 min read</span>
                </div>
              </div>
            </div>

            {/* Title - Clean & Readable for Both Themes */}
            <div className="space-y-6 mb-10">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-[1.1] max-w-4xl transition-colors duration-300">
                {post.title}
              </h1>

              {/* Excerpt - Professional for Both Themes */}
              <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 leading-relaxed max-w-3xl font-normal transition-colors duration-300">
                {post.excerpt}
              </p>
            </div>

            {/* Author Card - Modern Minimalist with Dark Mode */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4 px-8 py-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-sky-600 dark:from-emerald-400 dark:to-sky-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md transition-all duration-300">
                  {post.author.name.charAt(0)}
                </div>
                <div className="space-y-1">
                  <div className="text-gray-900 dark:text-white font-bold text-lg transition-colors duration-300">
                    {post.author.name}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm font-medium transition-colors duration-300">
                    {publishedDate.toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>

              {/* Share Buttons - Subtle with Dark Mode */}
              <div className="flex items-center gap-3">
                <span className="text-gray-600 dark:text-gray-400 text-sm font-medium hidden sm:block transition-colors duration-300">
                  Bagikan:
                </span>
                <div className="flex gap-2">
                  {[
                    {
                      name: "Twitter",
                      color:
                        "bg-sky-500 hover:bg-sky-600 dark:bg-sky-400 dark:hover:bg-sky-500",
                    },
                    {
                      name: "Facebook",
                      color:
                        "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600",
                    },
                    {
                      name: "WhatsApp",
                      color:
                        "bg-green-500 hover:bg-green-600 dark:bg-green-400 dark:hover:bg-green-500",
                    },
                  ].map((platform) => (
                    <button
                      key={platform.name}
                      title={`Share on ${platform.name}`}
                      className={`w-10 h-10 ${platform.color} text-white rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-sm hover:shadow-md`}
                    >
                      <div className="w-4 h-4 bg-white/90 rounded-sm"></div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ArticleContent({ post }: { post: BlogPost }) {
  const contentParagraphs = post.content.split("\n\n");

  return (
    <section className="py-16 bg-gradient-to-b from-white via-gray-50/30 to-white dark:from-gray-900 dark:via-gray-800/30 dark:to-gray-900 transition-colors duration-500">
      <div className="app-container">
        <div className="max-w-4xl mx-auto">
          {/* Article Header - Clean & Professional for Both Themes */}
          <div className="mb-16 pb-12 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div className="relative pl-8">
              <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-emerald-500 to-sky-500 dark:from-emerald-400 dark:to-sky-400 rounded-full transition-colors duration-300"></div>
              <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 leading-relaxed font-normal mb-8 transition-colors duration-300">
                {post.excerpt}
              </p>
            </div>

            {/* Enhanced Tags - Minimalist with Dark Mode */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-8">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="group px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-full border border-gray-200 dark:border-gray-600 hover:border-emerald-300 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-700 dark:hover:text-emerald-300 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
                  >
                    <span className="text-emerald-500 dark:text-emerald-400 mr-1">
                      #
                    </span>
                    <span>{tag}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Enhanced Article Body - Optimal Reading Experience for Both Themes */}
          <div className="space-y-8 mb-16">
            {contentParagraphs.map((paragraph, index) => (
              <div key={index} className="group">
                {paragraph.trim() && (
                  <div className="relative">
                    {/* Clean paragraph styling with dark mode support */}
                    <p className="text-gray-800 dark:text-gray-200 leading-[1.8] text-lg font-normal tracking-wide selection:bg-emerald-100 dark:selection:bg-emerald-900 selection:text-emerald-900 dark:selection:text-emerald-100 transition-colors duration-300">
                      {paragraph.trim()}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Professional Share Section with Dark Mode */}
          <div className="pt-12 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800/80 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm dark:shadow-gray-900/20 transition-all duration-300">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-sky-500 dark:from-emerald-400 dark:to-sky-400 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 transition-colors duration-300">
                      Bagikan artikel ini
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
                      Bantu sebarkan pengetahuan bermanfaat ini
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    title="Bagikan ke Twitter"
                    className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-110"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                    </svg>
                  </button>
                  <button
                    title="Bagikan ke Facebook"
                    className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-110"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </button>
                  <button
                    title="Bagikan ke WhatsApp"
                    className="p-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-110"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-gray-500 text-sm">
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
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <span>{post.views} likes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function RelatedPosts({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="app-container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Artikel Terkait
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Baca artikel menarik lainnya yang mungkin Anda sukai
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link
              key={post._id}
              href={`/blog/${post.slug}`}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-gray-100 hover:border-sky-200"
            >
              <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-emerald-100 via-sky-100 to-emerald-100 dark:from-emerald-900/20 dark:via-sky-900/20 dark:to-emerald-900/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <div className="text-emerald-600 dark:text-emerald-400 font-semibold text-lg">
                  Blog
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-gradient-to-r from-sky-500/90 to-emerald-500/90 backdrop-blur-sm text-white text-xs font-semibold rounded-full border border-white/20">
                    {post.category}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <h3 className="font-bold text-lg text-gray-900 group-hover:text-sky-600 transition-colors duration-300 line-clamp-2 leading-tight">
                  {post.title}
                </h3>

                <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <time className="text-xs text-gray-500">
                    {new Date(post.publishedAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </time>

                  <div className="flex items-center gap-2 text-xs text-gray-500">
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
                    <span>{post.views} views</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function CommentsPlaceholder() {
  return (
    <section className="py-16 bg-white">
      <div className="app-container">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-12 text-center border border-gray-200">
            <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
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
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Diskusi & Komentar
            </h3>

            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Fitur komentar akan segera hadir! Sementara itu, Anda dapat
              menghubungi kami melalui media sosial untuk berdiskusi tentang
              artikel ini.
            </p>

            <div className="flex justify-center gap-4">
              <button className="px-6 py-3 bg-gradient-to-r from-sky-500 to-sky-600 text-white font-semibold rounded-xl hover:from-sky-600 hover:to-sky-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                Hubungi Kami
              </button>
              <button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                Berlangganan Update
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
