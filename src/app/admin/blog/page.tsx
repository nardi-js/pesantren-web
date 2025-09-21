"use client";
import { Modal } from "@/components/admin/Modal";
import { Pagination } from "@/components/admin/Pagination";
import { useState, useCallback } from "react";
import Link from "next/link";
import { useToast } from "@/components/admin/ToastProvider";
import { AdminApi } from "@/lib/api";
import { useEffect } from "react";

interface Blog {
  _id: string;
  title: string;
  excerpt: string;
  author: {
    name: string;
    avatar?: string;
  };
  status: "draft" | "published" | "archived";
  publishedAt?: string;
  views: number;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export default function BlogListPage() {
  return <BlogListClient />;
}

function BlogListClient() {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [bulkSelected, setBulkSelected] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBlogs, setTotalBlogs] = useState(0);
  const { push } = useToast();

  // Fetch blogs
  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await AdminApi.getBlogs({
        page: currentPage,
        limit: 10,
        search: searchQuery || undefined,
        status: filter === "all" ? undefined : filter,
      });

      if (response.success && response.data) {
        const responseData = response.data as {
          data: Blog[];
          pagination?: { pages: number; total: number };
        };
        setBlogs(responseData.data || []);
        if (responseData.pagination) {
          setTotalPages(responseData.pagination.pages || 1);
          setTotalBlogs(responseData.pagination.total || 0);
        }
      } else {
        throw new Error(response.error || "Failed to fetch blogs");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch blogs";

      // Don't show error for empty database scenarios
      if (
        errorMessage.toLowerCase().includes("not found") ||
        errorMessage.toLowerCase().includes("no blogs") ||
        errorMessage.includes("404")
      ) {
        setBlogs([]);
      } else {
        push(errorMessage, "error");
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, filter, push]);

  // Load blogs on mount and when filters change
  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const [deleting, setDeleting] = useState(false);

  // Filter blogs based on search and filters
  const filteredBlogs = blogs.filter((blog: Blog) => {
    const matchesFilter = filter === "all" || blog.status === filter;
    const matchesSearch =
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.author.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
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
      bulkSelected.length === filteredBlogs.length
        ? []
        : filteredBlogs.map((b: Blog) => b._id)
    );
  };

  const handleDelete = async () => {
    if (!selectedBlog) return;

    try {
      setDeleting(true);
      const response = await AdminApi.deleteBlog(selectedBlog._id);

      if (response.success) {
        push("Blog deleted successfully", "success");
        setDeleteOpen(false);
        setSelectedBlog(null);
        setBulkSelected([]);
        fetchBlogs(); // Reload the list
      } else {
        throw new Error(response.error || "Failed to delete blog");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete blog";
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
          Loading blogs...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-wide">Blog Posts</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your blog content and articles
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <input
            placeholder="Search posts..."
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
          <Link
            href="/admin/blog/new"
            className="rounded-md bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            New Post
          </Link>
        </div>
      </div>

      {/* Bulk Actions */}
      {bulkSelected.length > 0 && (
        <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-sm font-medium text-sky-800 dark:text-sky-200">
            {bulkSelected.length} post{bulkSelected.length !== 1 ? "s" : ""}{" "}
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

      {/* Blog Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/50 shadow">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50/70 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300">
              <th className="text-left px-4 py-3 font-semibold">
                <input
                  type="checkbox"
                  checked={
                    bulkSelected.length === filteredBlogs.length &&
                    filteredBlogs.length > 0
                  }
                  onChange={handleSelectAll}
                  className="rounded border-slate-300 dark:border-slate-600"
                  aria-label="Select all posts"
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
            {filteredBlogs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                      <span className="text-2xl">📝</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                        No blog posts yet
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Create your first blog post to get started.
                      </p>
                    </div>
                    <Link
                      href="/admin/blog/new"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors"
                    >
                      Create First Blog Post
                    </Link>
                  </div>
                </td>
              </tr>
            ) : (
              filteredBlogs.map((blog: Blog) => (
                <tr
                  key={blog._id}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition"
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={bulkSelected.includes(blog._id)}
                      onChange={() => handleBulkSelect(blog._id)}
                      className="rounded border-slate-300 dark:border-slate-600"
                      aria-label={`Select ${blog.title}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="max-w-xs">
                      <div className="font-medium text-slate-900 dark:text-slate-100 truncate">
                        {blog.title}
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 text-xs truncate mt-1">
                        {blog.excerpt}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {blog.author.name}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                      {blog.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        blog.status === "published"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                          : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
                      }`}
                    >
                      {blog.status === "published" ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {blog.views}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {blog.publishedAt
                      ? new Date(blog.publishedAt).toLocaleDateString()
                      : "Not published"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/blog/${blog._id}/edit`}
                        className="text-sky-600 hover:text-sky-500 text-xs font-medium"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => {
                          setSelectedBlog(blog);
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
          Showing {filteredBlogs.length} of {totalBlogs} posts
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/60 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
          <div className="text-2xl font-bold text-sky-600">
            {blogs.filter((b: Blog) => b.status === "published").length}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Published Posts
          </div>
        </div>
        <div className="bg-white/60 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {blogs.filter((b: Blog) => b.status === "draft").length}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Draft Posts
          </div>
        </div>
        <div className="bg-white/60 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
          <div className="text-2xl font-bold text-green-600">
            {blogs.reduce((sum: number, b: Blog) => sum + b.views, 0)}
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
          setSelectedBlog(null);
        }}
        title={
          bulkSelected.length > 0 ? "Delete Selected Posts" : "Delete Blog Post"
        }
        footer={
          <>
            <button
              onClick={() => {
                setDeleteOpen(false);
                setSelectedBlog(null);
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
            ? `Are you sure you want to delete ${bulkSelected.length} selected posts? This action cannot be undone.`
            : `Are you sure you want to delete "${selectedBlog?.title}"? This action cannot be undone.`}
        </p>
      </Modal>
    </div>
  );
}
