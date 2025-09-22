"use client";
import { Modal } from "@/components/admin/Modal";
import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useToast } from "@/components/admin/ToastProvider";
import { AdminApi } from "@/lib/api";

interface Testimonial {
  _id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  email?: string;
  phone?: string;
  image?: string;
  status: "pending" | "approved" | "rejected";
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function TestimonialsListPage() {
  return <TestimonialsListClient />;
}

function TestimonialsListClient() {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] =
    useState<Testimonial | null>(null);
  const [bulkSelected, setBulkSelected] = useState<string[]>([]);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const { push } = useToast();

  // Fetch testimonials
  const fetchTestimonials = useCallback(async () => {
    try {
      setLoading(true);
      const response = await AdminApi.getTestimonials({
        page: 1,
        limit: 50,
        search: searchQuery || undefined,
        status: filter === "all" ? undefined : filter,
      });

      if (response.success && response.data) {
        const responseData = response.data as { data: Testimonial[] };
        setTestimonials(responseData.data || []);
      } else {
        throw new Error(response.error || "Failed to fetch testimonials");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch testimonials";

      // Don't show error for empty database scenarios
      if (
        errorMessage.toLowerCase().includes("not found") ||
        errorMessage.toLowerCase().includes("no testimonials") ||
        errorMessage.includes("404")
      ) {
        setTestimonials([]);
      } else {
        push(errorMessage, "error");
      }
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filter, push]);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const filteredTestimonials = testimonials.filter(
    (testimonial: Testimonial) => {
      const matchesFilter = filter === "all" || testimonial.status === filter;
      const matchesSearch =
        testimonial.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        testimonial.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        testimonial.role.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    }
  );

  const handleBulkSelect = (id: string) => {
    setBulkSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleDelete = async () => {
    if (!selectedTestimonial) return;

    try {
      const response = await AdminApi.deleteTestimonial(
        selectedTestimonial._id
      );

      if (response.success) {
        push("Testimonial deleted successfully", "success");
        setDeleteOpen(false);
        setSelectedTestimonial(null);
        setBulkSelected([]);
        fetchTestimonials(); // Reload the list
      } else {
        throw new Error(response.error || "Failed to delete testimonial");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete testimonial";
      push(errorMessage, "error");
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto"></div>
        <p className="mt-4 text-slate-600 dark:text-slate-400">
          Loading testimonials...
        </p>
      </div>
    );
  }

  const handleApprove = async (testimonial: Testimonial) => {
    try {
      const response = await fetch(
        `/api/admin/testimonials/${testimonial._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...testimonial,
            status: "approved",
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        push("Testimonial approved successfully", "success");
        fetchTestimonials(); // Reload the list
      } else {
        throw new Error(result.error || "Failed to approve testimonial");
      }
    } catch (error) {
      push("Failed to approve testimonial", "error");
    }
  };

  const handleReject = async (testimonial: Testimonial) => {
    try {
      const response = await fetch(
        `/api/admin/testimonials/${testimonial._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...testimonial,
            status: "rejected",
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        push("Testimonial rejected", "info");
        fetchTestimonials(); // Reload the list
      } else {
        throw new Error(result.error || "Failed to reject testimonial");
      }
    } catch (error) {
      push("Failed to reject testimonial", "error");
    }
  };

  const handleToggleFeatured = async (testimonial: Testimonial) => {
    try {
      const newFeaturedStatus = !testimonial.featured;

      const response = await fetch(
        `/api/admin/testimonials/${testimonial._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...testimonial,
            featured: newFeaturedStatus,
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        push(
          `Testimonial ${
            newFeaturedStatus ? "featured" : "unfeatured"
          } successfully`,
          "success"
        );
        fetchTestimonials(); // Reload the list to reflect changes
      } else {
        throw new Error(result.error || "Failed to update featured status");
      }
    } catch (error) {
      push("Failed to update featured status", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-wide">
            Testimonials Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage testimonials and reviews from students, parents, and alumni
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <input
            placeholder="Search testimonials..."
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
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
          <Link
            href="/admin/testimonials/create"
            className="rounded-md bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            New Testimonial
          </Link>
        </div>
      </div>

      {/* Bulk Actions */}
      {bulkSelected.length > 0 && (
        <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-sm font-medium text-sky-800 dark:text-sky-200">
            {bulkSelected.length} testimonial
            {bulkSelected.length !== 1 ? "s" : ""} selected
          </span>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-xs rounded-md bg-green-600 hover:bg-green-500 text-white">
              Approve
            </button>
            <button className="px-3 py-1.5 text-xs rounded-md bg-yellow-600 hover:bg-yellow-500 text-white">
              Feature
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

      {/* Testimonials List */}
      <div className="space-y-4">
        {filteredTestimonials.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
              No testimonials yet
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              Create your first testimonial to get started.
            </p>
            <Link
              href="/admin/testimonials/create"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors"
            >
              Create First Testimonial
            </Link>
          </div>
        ) : (
          filteredTestimonials.map((testimonial) => (
            <div
              key={testimonial._id}
              className="bg-white/60 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={bulkSelected.includes(testimonial._id)}
                  onChange={() => handleBulkSelect(testimonial._id)}
                  className="mt-1 rounded border-slate-300 dark:border-slate-600"
                  aria-label={`Select testimonial from ${testimonial.name}`}
                />

                <div className="flex-shrink-0">
                  <Image
                    src={
                      testimonial.image ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        testimonial.name
                      )}&background=10b981&color=fff&size=64`
                    }
                    alt={testimonial.name}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                </div>

                <div className="flex-grow min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                        {testimonial.name}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {testimonial.role}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {testimonial.featured && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                          Featured
                        </span>
                      )}
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          testimonial.status === "approved"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                            : testimonial.status === "pending"
                            ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
                            : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                        }`}
                      >
                        {testimonial.status === "approved"
                          ? "Approved"
                          : testimonial.status === "pending"
                          ? "Pending"
                          : "Rejected"}
                      </span>
                    </div>
                  </div>

                  <blockquote className="mt-3 text-slate-700 dark:text-slate-300 italic">
                    &ldquo;{testimonial.content}&rdquo;
                  </blockquote>

                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {testimonial.createdAt}
                    </span>
                    <div className="flex gap-2">
                      {testimonial.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleApprove(testimonial)}
                            className="text-green-600 hover:text-green-500 text-xs font-medium"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(testimonial)}
                            className="text-red-600 hover:text-red-500 text-xs font-medium"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleToggleFeatured(testimonial)}
                        className="text-yellow-600 hover:text-yellow-500 text-xs font-medium"
                      >
                        {testimonial.featured ? "Unfeature" : "Feature"}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTestimonial(testimonial);
                          setDetailsOpen(true);
                        }}
                        className="text-sky-600 hover:text-sky-500 text-xs font-medium"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTestimonial(testimonial);
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
            </div>
          ))
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white/60 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
          <div className="text-2xl font-bold text-green-600">
            {
              testimonials.filter((t: Testimonial) => t.status === "approved")
                .length
            }
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Approved
          </div>
        </div>
        <div className="bg-white/60 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {
              testimonials.filter((t: Testimonial) => t.status === "pending")
                .length
            }
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Pending
          </div>
        </div>
        <div className="bg-white/60 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
          <div className="text-2xl font-bold text-orange-600">
            {testimonials.filter((t: Testimonial) => t.featured).length}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Featured
          </div>
        </div>
        <div className="bg-white/60 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
          <div className="text-2xl font-bold text-indigo-600">
            {testimonials.length}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Total
          </div>
        </div>
      </div>

      {/* Details Modal */}
      <Modal
        open={detailsOpen}
        onCloseAction={() => {
          setDetailsOpen(false);
          setSelectedTestimonial(null);
        }}
        title="Testimonial Details"
        footer={
          <button
            onClick={() => {
              setDetailsOpen(false);
              setSelectedTestimonial(null);
            }}
            className="px-3 py-1.5 text-xs rounded-md border border-slate-300 dark:border-slate-600"
          >
            Close
          </button>
        }
      >
        {selectedTestimonial && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Image
                src={selectedTestimonial.image || "/images/default-avatar.png"}
                alt={selectedTestimonial.name}
                width={80}
                height={80}
                className="w-20 h-20 rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold text-lg">
                  {selectedTestimonial.name}
                </h3>
                <p className="text-slate-500">{selectedTestimonial.role}</p>

                {/* Rating Stars */}
                <div className="flex items-center gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-5 h-5 ${
                        star <= selectedTestimonial.rating
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">
                    ({selectedTestimonial.rating}/5)
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
              <h4 className="font-medium mb-3 text-slate-900 dark:text-slate-100">
                Contact Information
              </h4>
              <div className="grid grid-cols-1 gap-3 text-sm">
                {selectedTestimonial.email && (
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-slate-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      Email:
                    </span>
                    <span className="text-slate-600 dark:text-slate-400">
                      {selectedTestimonial.email}
                    </span>
                  </div>
                )}
                {selectedTestimonial.phone && (
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-slate-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      Phone:
                    </span>
                    <span className="text-slate-600 dark:text-slate-400">
                      {selectedTestimonial.phone}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Testimonial Content */}
            <div>
              <h4 className="font-medium mb-3 text-slate-900 dark:text-slate-100">
                Testimonial Content
              </h4>
              <blockquote className="italic text-slate-700 dark:text-slate-300 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border-l-4 border-blue-500">
                &ldquo;{selectedTestimonial.content}&rdquo;
              </blockquote>
            </div>

            {/* Status Information */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Status:
                </span>
                <div className="mt-1">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      selectedTestimonial.status === "approved"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : selectedTestimonial.status === "rejected"
                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    }`}
                  >
                    {selectedTestimonial.status.charAt(0).toUpperCase() +
                      selectedTestimonial.status.slice(1)}
                  </span>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Featured:
                </span>
                <div className="mt-1">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      selectedTestimonial.featured
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                    }`}
                  >
                    {selectedTestimonial.featured ? "Yes" : "No"}
                  </span>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 col-span-2">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Submitted:
                </span>
                <div className="mt-1 text-slate-600 dark:text-slate-400">
                  {new Date(selectedTestimonial.createdAt).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={deleteOpen}
        onCloseAction={() => {
          setDeleteOpen(false);
          setSelectedTestimonial(null);
        }}
        title={
          bulkSelected.length > 0
            ? "Delete Selected Testimonials"
            : "Delete Testimonial"
        }
        footer={
          <>
            <button
              onClick={() => {
                setDeleteOpen(false);
                setSelectedTestimonial(null);
              }}
              className="px-3 py-1.5 text-xs rounded-md border border-slate-300 dark:border-slate-600"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 text-xs rounded-md bg-red-600 hover:bg-red-500 text-white"
            >
              Delete
            </button>
          </>
        }
      >
        <p className="text-sm">
          {bulkSelected.length > 0
            ? `Are you sure you want to delete ${bulkSelected.length} selected testimonials? This action cannot be undone.`
            : `Are you sure you want to delete the testimonial from "${selectedTestimonial?.name}"? This action cannot be undone.`}
        </p>
      </Modal>
    </div>
  );
}
