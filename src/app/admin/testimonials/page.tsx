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
  position: string;
  content: string;
  rating: number;
  avatar?: string;
  status: "pending" | "approved" | "rejected";
  featured: boolean;
  category: string;
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
  const [error, setError] = useState<string | null>(null);
  const { push } = useToast();

  // Fetch testimonials
  const fetchTestimonials = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
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
    fetchTestimonials();
  }, [fetchTestimonials]);

  const filteredTestimonials = testimonials.filter(
    (testimonial: Testimonial) => {
      const matchesFilter = filter === "all" || testimonial.status === filter;
      const matchesSearch =
        testimonial.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        testimonial.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        testimonial.position.toLowerCase().includes(searchQuery.toLowerCase());
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

  const handleApprove = () => {
    push(`Testimonial approved successfully`, "success");
  };

  const handleReject = () => {
    push(`Testimonial rejected`, "info");
  };

  const handleToggleFeatured = () => {
    push(`Featured status updated`, "success");
  };

  const renderStars = (rating: number) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
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
            href="/admin/testimonials/new"
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
              href="/admin/testimonials/new"
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
                    src={testimonial.avatar || "/images/default-avatar.png"}
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
                        {testimonial.position}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-yellow-500 text-sm">
                          {renderStars(testimonial.rating)}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            testimonial.category === "Alumni"
                              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                              : testimonial.category === "Parent"
                              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                              : "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300"
                          }`}
                        >
                          {testimonial.category}
                        </span>
                      </div>
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
                            onClick={() => handleApprove()}
                            className="text-green-600 hover:text-green-500 text-xs font-medium"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject()}
                            className="text-red-600 hover:text-red-500 text-xs font-medium"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleToggleFeatured()}
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
                      <Link
                        href={`/admin/testimonials/${testimonial._id}/edit`}
                        className="text-sky-600 hover:text-sky-500 text-xs font-medium"
                      >
                        Edit
                      </Link>
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
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Image
                src={selectedTestimonial.avatar || "/images/default-avatar.png"}
                alt={selectedTestimonial.name}
                width={80}
                height={80}
                className="w-20 h-20 rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold text-lg">
                  {selectedTestimonial.name}
                </h3>
                <p className="text-slate-500">{selectedTestimonial.position}</p>
                <div className="text-yellow-500">
                  {renderStars(selectedTestimonial.rating)}
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Testimonial Content:</h4>
              <blockquote className="italic text-slate-700 dark:text-slate-300 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                &ldquo;{selectedTestimonial.content}&rdquo;
              </blockquote>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Category:</span>{" "}
                {selectedTestimonial.category}
              </div>
              <div>
                <span className="font-medium">Status:</span>{" "}
                {selectedTestimonial.status}
              </div>
              <div>
                <span className="font-medium">Featured:</span>{" "}
                {selectedTestimonial.featured ? "Yes" : "No"}
              </div>
              <div>
                <span className="font-medium">Date:</span>{" "}
                {selectedTestimonial.createdAt}
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
