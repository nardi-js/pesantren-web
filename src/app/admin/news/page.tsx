"use client";
import { Modal } from "@/components/admin/Modal";
import { Pagination } from "@/components/admin/Pagination";
import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useToast } from "@/components/admin/ToastProvider";
import { AdminApi } from "@/lib/api";

interface News {
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

export default function NewsListPage() {
  return <NewsListClient />;
}

function NewsListClient() {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [bulkSelected, setBulkSelected] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalNews, setTotalNews] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const { push } = useToast();

  // Fetch news
  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      const response = await AdminApi.getNews({
        page: currentPage,
        limit: 10,
        search: searchQuery || undefined,
        status: filter === "all" ? undefined : filter,
        priority: priorityFilter === "all" ? undefined : priorityFilter,
      });

      if (response.success && response.data) {
        const responseData = response.data as {
          data: News[];
          pagination?: { pages: number; total: number };
        };
        setNews(responseData.data || []);
        if (responseData.pagination) {
          setTotalPages(responseData.pagination.pages || 1);
          setTotalNews(responseData.pagination.total || 0);
        }
      } else {
        throw new Error(response.error || "Failed to fetch news");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch news";

      // Don't show error for empty database scenarios
      if (
        errorMessage.toLowerCase().includes("not found") ||
        errorMessage.toLowerCase().includes("no news") ||
        errorMessage.includes("404")
      ) {
        setNews([]);
      } else {
        push(errorMessage, "error");
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, filter, priorityFilter, push]);

  // Load news on mount and when filters change
  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // Filter news based on search and filters
  const filteredNews = news.filter((newsItem: News) => {
    const matchesFilter = filter === "all" || newsItem.status === filter;
    const matchesPriority =
      priorityFilter === "all" ||
      newsItem.priority === parseInt(priorityFilter);
    const matchesSearch =
      newsItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      newsItem.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      newsItem.author.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesPriority && matchesSearch;
  });

  // Update search and reload
  const handleSearch = useCallback((term: string) => {
    setSearchQuery(term);
    setCurrentPage(1); // Reset to first page
  }, []);

  const handleFilterChange = useCallback((status: string) => {
    setFilter(status);
    setCurrentPage(1); // Reset to first page
  }, []);

  const handlePriorityFilterChange = useCallback((priority: string) => {
    setPriorityFilter(priority);
    setCurrentPage(1); // Reset to first page
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleBulkSelect = (id: string) => {
    setBulkSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setBulkSelected(
      bulkSelected.length === filteredNews.length
        ? []
        : filteredNews.map((n: News) => n._id)
    );
  };

  const handleDelete = async () => {
    if (!selectedNews) return;

    try {
      setDeleting(true);
      const response = await AdminApi.deleteNews(selectedNews._id);

      if (response.success) {
        push("News deleted successfully", "success");
        setDeleteOpen(false);
        setSelectedNews(null);
        setBulkSelected([]);
        fetchNews(); // Reload the list
      } else {
        throw new Error(response.error || "Failed to delete news");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete news";
      push(errorMessage, "error");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto"></div>
        <p className="mt-4 text-slate-600 dark:text-slate-400">
          Loading news...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-wide">
            News & Announcements
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage news articles and official announcements
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <input
            placeholder="Search news..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <select
            value={filter}
            onChange={(e) => handleFilterChange(e.target.value)}
            aria-label="Filter by status"
            className="rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => handlePriorityFilterChange(e.target.value)}
            aria-label="Filter by priority"
            className="rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
          >
            <option value="all">All Priorities</option>
            <option value="3">High Priority (3)</option>
            <option value="2">Medium Priority (2)</option>
            <option value="1">Low Priority (1)</option>
          </select>
          <Link
            href="/admin/news/new"
            className="rounded-md bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            New Article
          </Link>
        </div>
      </div>

      {/* Bulk Actions */}
      {bulkSelected.length > 0 && (
        <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-sm font-medium text-sky-800 dark:text-sky-200">
            {bulkSelected.length} article{bulkSelected.length !== 1 ? "s" : ""}{" "}
            selected
          </span>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-xs rounded-md bg-green-600 hover:bg-green-500 text-white">
              Publish
            </button>
            <button className="px-3 py-1.5 text-xs rounded-md bg-yellow-600 hover:bg-yellow-500 text-white">
              Draft
            </button>
            <button
              onClick={() => setDeleteOpen(true)}
              className="px-3 py-1.5 text-xs rounded-md bg-red-600 hover:bg-red-500 text-white"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* News Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/50 shadow">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50/70 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300">
              <th className="text-left px-4 py-3 font-semibold">
                <input
                  type="checkbox"
                  checked={
                    bulkSelected.length === filteredNews.length &&
                    filteredNews.length > 0
                  }
                  onChange={handleSelectAll}
                  className="rounded border-slate-300 dark:border-slate-600"
                  aria-label="Select all articles"
                />
              </th>
              <th scope="col" className="text-left px-4 py-3 font-semibold">
                Title
              </th>
              <th scope="col" className="text-left px-4 py-3 font-semibold">
                Author
              </th>
              <th scope="col" className="text-left px-4 py-3 font-semibold">
                Category
              </th>
              <th scope="col" className="text-left px-4 py-3 font-semibold">
                Priority
              </th>
              <th scope="col" className="text-left px-4 py-3 font-semibold">
                Status
              </th>
              <th scope="col" className="text-left px-4 py-3 font-semibold">
                Views
              </th>
              <th scope="col" className="text-left px-4 py-3 font-semibold">
                Date
              </th>
              <th scope="col" className="text-left px-4 py-3 font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {filteredNews.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                      <span className="text-2xl">📰</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                        No news articles yet
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Create your first news article to get started.
                      </p>
                    </div>
                    <Link
                      href="/admin/news/new"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors"
                    >
                      Create First News Article
                    </Link>
                  </div>
                </td>
              </tr>
            ) : (
              filteredNews.map((news: News) => (
                <tr
                  key={news._id}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition"
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={bulkSelected.includes(news._id)}
                      onChange={() => handleBulkSelect(news._id)}
                      className="rounded border-slate-300 dark:border-slate-600"
                      aria-label={`Select ${news.title}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="max-w-xs">
                      <div className="font-medium text-slate-900 dark:text-slate-100 truncate">
                        {news.title}
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 text-xs truncate mt-1">
                        {news.excerpt}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {news.author.name}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                      {news.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        news.priority >= 3
                          ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                          : news.priority >= 2
                          ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
                          : "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300"
                      }`}
                    >
                      {news.priority >= 3
                        ? "High"
                        : news.priority >= 2
                        ? "Medium"
                        : "Low"}{" "}
                      ({news.priority})
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        news.status === "published"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                          : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
                      }`}
                    >
                      {news.status === "published" ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {news.views}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {news.publishedAt
                      ? new Date(news.publishedAt).toLocaleDateString()
                      : "Not published"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/news/${news._id}/edit`}
                        className="text-sky-600 hover:text-sky-500 text-xs font-medium"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => {
                          setSelectedNews(news);
                          setDeleteOpen(true);
                        }}
                        className="text-red-600 hover:text-red-500 text-xs font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Showing {filteredNews.length} of {totalNews} articles
        </span>
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white/60 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
          <div className="text-2xl font-bold text-sky-600">
            {news.filter((n: News) => n.status === "published").length}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Published
          </div>
        </div>
        <div className="bg-white/60 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {news.filter((n: News) => n.status === "draft").length}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Drafts
          </div>
        </div>
        <div className="bg-white/60 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
          <div className="text-2xl font-bold text-red-600">
            {news.filter((n: News) => n.priority >= 3).length}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            High Priority
          </div>
        </div>
        <div className="bg-white/60 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
          <div className="text-2xl font-bold text-green-600">
            {news.reduce((sum: number, n: News) => sum + n.views, 0)}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Total Views
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <Modal
        open={deleteOpen}
        onCloseAction={() => {
          setDeleteOpen(false);
          setSelectedNews(null);
        }}
        title={
          bulkSelected.length > 0
            ? "Delete Selected Articles"
            : "Delete News Article"
        }
        footer={
          <>
            <button
              onClick={() => {
                setDeleteOpen(false);
                setSelectedNews(null);
              }}
              className="px-3 py-1.5 text-xs rounded-md border border-slate-300 dark:border-slate-600"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-3 py-1.5 text-xs rounded-md bg-red-600 hover:bg-red-500 text-white disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </>
        }
      >
        <p className="text-sm">
          {bulkSelected.length > 0
            ? `Are you sure you want to delete ${bulkSelected.length} selected articles? This action cannot be undone.`
            : `Are you sure you want to delete "${selectedNews?.title}"? This action cannot be undone.`}
        </p>
      </Modal>
    </div>
  );
}
