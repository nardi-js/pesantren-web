"use client";
import { Modal } from "@/components/admin/Modal";
import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useToast } from "@/components/admin/ToastProvider";
import { AdminApi } from "@/lib/api";

interface GalleryItem {
  _id: string;
  title: string;
  description: string;
  imageCount: number;
  coverImage: string;
  album: string;
  status: "draft" | "published" | "archived";
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export default function GalleryListPage() {
  return <GalleryListClient />;
}

function GalleryListClient() {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedGallery, setSelectedGallery] = useState<GalleryItem | null>(
    null
  );
  const [bulkSelected, setBulkSelected] = useState<string[]>([]);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { push } = useToast();

  // Fetch gallery items
  const fetchGallery = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await AdminApi.getGallery({
        page: 1,
        limit: 50,
        search: searchQuery || undefined,
        status: filter === "all" ? undefined : filter,
      });

      if (response.success && response.data) {
        const responseData = response.data as { data: GalleryItem[] };
        setGallery(responseData.data || []);
      } else {
        throw new Error(response.error || "Failed to fetch gallery");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch gallery";

      // Don't show error for empty database scenarios
      if (
        errorMessage.toLowerCase().includes("not found") ||
        errorMessage.toLowerCase().includes("no gallery") ||
        errorMessage.includes("404")
      ) {
        setGallery([]);
        setError(null);
      } else {
        setError(errorMessage);
        push(errorMessage, "error");
      }
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filter, push]);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  const filteredGallery = gallery.filter((item: GalleryItem) => {
    const matchesFilter = filter === "all" || item.status === filter;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.album.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleBulkSelect = (id: string) => {
    setBulkSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setBulkSelected(
      bulkSelected.length === filteredGallery.length
        ? []
        : filteredGallery.map((g) => g._id)
    );
  };

  const handleDelete = async () => {
    if (!selectedGallery) return;

    try {
      setDeleting(true);
      const response = await AdminApi.deleteGalleryItem(selectedGallery._id);

      if (response.success) {
        push("Gallery item deleted successfully", "success");
        setDeleteOpen(false);
        setSelectedGallery(null);
        setBulkSelected([]);
        fetchGallery(); // Reload the list
      } else {
        throw new Error(response.error || "Failed to delete gallery item");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete gallery item";
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
          Loading gallery...
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
            Gallery Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage photo galleries and media albums
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <input
            placeholder="Search galleries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Filter by status"
            className="rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <div className="flex border border-slate-300 dark:border-slate-600 rounded-md">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-2 text-xs ${
                viewMode === "grid"
                  ? "bg-sky-600 text-white"
                  : "bg-white dark:bg-slate-800"
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-2 text-xs ${
                viewMode === "list"
                  ? "bg-sky-600 text-white"
                  : "bg-white dark:bg-slate-800"
              }`}
            >
              List
            </button>
          </div>
          <Link
            href="/admin/gallery/new"
            className="rounded-md bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            New Gallery
          </Link>
        </div>
      </div>

      {/* Bulk Actions */}
      {bulkSelected.length > 0 && (
        <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-sm font-medium text-sky-800 dark:text-sky-200">
            {bulkSelected.length} galler
            {bulkSelected.length !== 1 ? "ies" : "y"} selected
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

      {/* Gallery Content */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGallery.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🖼️</span>
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                No gallery items yet
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                Create your first gallery item to get started.
              </p>
              <Link
                href="/admin/gallery/new"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors"
              >
                Create First Gallery Item
              </Link>
            </div>
          ) : (
            filteredGallery.map((gallery) => (
              <div
                key={gallery._id}
                className="bg-white/60 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={bulkSelected.includes(gallery._id)}
                    onChange={() => handleBulkSelect(gallery._id)}
                    className="absolute top-3 left-3 rounded border-white z-10"
                    aria-label={`Select ${gallery.title}`}
                  />
                  <Image
                    src={gallery.coverImage}
                    alt={gallery.title}
                    width={400}
                    height={300}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        gallery.status === "published"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {gallery.status === "published" ? "Published" : "Draft"}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/60 text-white px-2 py-1 rounded text-xs">
                    {gallery.imageCount} photos
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {gallery.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {gallery.description}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {gallery.album}
                    </span>
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/gallery/${gallery._id}/edit`}
                        className="text-sky-600 hover:text-sky-500 text-xs font-medium"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => {
                          setSelectedGallery(gallery);
                          setDeleteOpen(true);
                        }}
                        className="text-red-600 hover:text-red-500 text-xs font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* List View */
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/50 shadow">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300">
                <th className="text-left px-4 py-3 font-semibold">
                  <input
                    type="checkbox"
                    checked={
                      bulkSelected.length === filteredGallery.length &&
                      filteredGallery.length > 0
                    }
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 dark:border-slate-600"
                    aria-label="Select all galleries"
                  />
                </th>
                <th scope="col" className="text-left px-4 py-3 font-semibold">
                  Gallery
                </th>
                <th scope="col" className="text-left px-4 py-3 font-semibold">
                  Album
                </th>
                <th scope="col" className="text-left px-4 py-3 font-semibold">
                  Photos
                </th>
                <th scope="col" className="text-left px-4 py-3 font-semibold">
                  Status
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
              {filteredGallery.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                        <span className="text-2xl">🖼️</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                          No gallery items yet
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                          Create your first gallery item to get started.
                        </p>
                      </div>
                      <Link
                        href="/admin/gallery/new"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors"
                      >
                        Create First Gallery Item
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredGallery.map((gallery) => (
                  <tr
                    key={gallery._id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={bulkSelected.includes(gallery._id)}
                        onChange={() => handleBulkSelect(gallery._id)}
                        className="rounded border-slate-300 dark:border-slate-600"
                        aria-label={`Select ${gallery.title}`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Image
                          src={gallery.coverImage}
                          alt={gallery.title}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded object-cover"
                        />
                        <div>
                          <div className="font-medium text-slate-900 dark:text-slate-100">
                            {gallery.title}
                          </div>
                          <div className="text-slate-500 dark:text-slate-400 text-xs">
                            {gallery.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300">
                        {gallery.album}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {gallery.imageCount}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          gallery.status === "published"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                            : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
                        }`}
                      >
                        {gallery.status === "published" ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {gallery.createdAt}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/gallery/${gallery._id}/edit`}
                          className="text-sky-600 hover:text-sky-500 text-xs font-medium"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => {
                            setSelectedGallery(gallery);
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
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white/60 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
          <div className="text-2xl font-bold text-sky-600">
            {
              gallery.filter((g: GalleryItem) => g.status === "published")
                .length
            }
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Published
          </div>
        </div>
        <div className="bg-white/60 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {gallery.filter((g: GalleryItem) => g.status === "draft").length}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Drafts
          </div>
        </div>
        <div className="bg-white/60 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
          <div className="text-2xl font-bold text-green-600">
            {gallery.reduce(
              (sum: number, g: GalleryItem) => sum + g.imageCount,
              0
            )}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Total Photos
          </div>
        </div>
        <div className="bg-white/60 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
          <div className="text-2xl font-bold text-indigo-600">
            {gallery.length}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Total Galleries
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <Modal
        open={deleteOpen}
        onCloseAction={() => {
          setDeleteOpen(false);
          setSelectedGallery(null);
        }}
        title={
          bulkSelected.length > 0
            ? "Delete Selected Galleries"
            : "Delete Gallery"
        }
        footer={
          <>
            <button
              onClick={() => {
                setDeleteOpen(false);
                setSelectedGallery(null);
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
            ? `Are you sure you want to delete ${bulkSelected.length} selected galleries? This action cannot be undone.`
            : `Are you sure you want to delete "${selectedGallery?.title}"? This action cannot be undone.`}
        </p>
      </Modal>
    </div>
  );
}
