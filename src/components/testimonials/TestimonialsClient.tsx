"use client";
import Image from "next/image";
import { useState } from "react";
import { usePaginatedApi } from "@/hooks/useApi";
import TestimonialSubmissionForm from "./TestimonialSubmissionForm";
import TestimonialModal from "./TestimonialModal";

interface Testimonial {
  _id: string;
  name: string;
  role: string;
  image?: string;
  content: string;
  rating: number;
  status: "pending" | "approved" | "rejected";
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function TestimonialsClient() {
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] =
    useState<Testimonial | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    allItems: testimonials,
    loading,
    error,
    loadMore,
    hasMore,
    refetch,
  } = usePaginatedApi<Testimonial>("/api/testimonials", {
    limit: 9,
    status: "approved",
  });

  // Ensure testimonials is always an array
  const safeTestimonials = Array.isArray(testimonials) ? testimonials : [];

  const openModal = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTestimonial(null);
  };

  if (loading && safeTestimonials.length === 0) {
    return (
      <section className="section-base py-20 -mt-8 bg-white dark:bg-gray-900">
        <div className="app-container">
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="rounded-xl bg-gray-200 dark:bg-gray-700 h-64"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="section-base py-20 -mt-8 bg-white dark:bg-gray-900">
        <div className="app-container">
          <div className="text-center">
            <p className="text-red-500">Error loading testimonials: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-base py-20 -mt-8 bg-white dark:bg-gray-900">
      <div className="app-container space-y-12">
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {safeTestimonials.map((t, idx) => (
            <Card key={t._id} t={t} idx={idx} onReadMore={() => openModal(t)} />
          ))}
        </div>

        {safeTestimonials.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              Belum ada testimoni yang tersedia.
            </p>
          </div>
        )}

        <div className="flex items-center justify-center gap-4">
          {hasMore ? (
            <button
              onClick={loadMore}
              disabled={loading}
              className="px-8 py-3 text-sm font-semibold bg-gradient-to-r from-emerald-500 to-sky-600 hover:from-emerald-600 hover:to-sky-700 dark:from-emerald-400 dark:to-sky-500 dark:hover:from-emerald-500 dark:hover:to-sky-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? "Memuat..." : "Muat Lagi"}
            </button>
          ) : safeTestimonials.length > 0 ? (
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Semua testimoni ditampilkan.
            </span>
          ) : null}
          <button
            onClick={() => setShowSubmissionForm(true)}
            className="px-6 py-3 text-sm font-semibold border-2 border-emerald-500 dark:border-emerald-400 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all duration-300"
          >
            Tambah Testimoni
          </button>
        </div>
      </div>

      {/* Testimonial Submission Modal */}
      {showSubmissionForm && (
        <TestimonialSubmissionForm
          onClose={() => setShowSubmissionForm(false)}
          onSuccess={() => {
            refetch();
            setShowSubmissionForm(false);
          }}
        />
      )}

      {/* Testimonial Detail Modal */}
      <TestimonialModal
        isOpen={isModalOpen}
        onClose={closeModal}
        testimonial={
          selectedTestimonial
            ? {
                name: selectedTestimonial.name,
                position: selectedTestimonial.role,
                content: selectedTestimonial.content,
                rating: selectedTestimonial.rating,
                avatar: selectedTestimonial.image,
              }
            : null
        }
      />
    </section>
  );
}

function Card({
  t,
  idx,
  onReadMore,
}: {
  t: Testimonial;
  idx: number;
  onReadMore: () => void;
}) {
  const delayClass = `animation-delay-${(idx % 6) * 50}`; // assumes delay utilities (0,50,100,...)

  // Default avatar if no image provided
  const avatarSrc =
    t.image ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      t.name
    )}&background=10b981&color=fff&size=56`;

  // Truncate content to 35 characters
  const truncateContent = (content: string, maxLength: number = 35) => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength).trim() + "...";
  };

  return (
    <figure
      className={`group relative flex flex-col rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl dark:hover:shadow-emerald-500/20 transition-all duration-300 overflow-hidden hover:scale-[1.025] animate-fade-up ${delayClass}`}
    >
      {t.featured && (
        <div className="absolute top-4 right-4 z-10">
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-md">
            ⭐ Featured
          </span>
        </div>
      )}

      <div className="p-8 flex flex-col gap-6 flex-1">
        <div className="flex items-center gap-5">
          <div className="relative">
            <Image
              src={avatarSrc}
              alt={t.name}
              width={64}
              height={64}
              className="h-16 w-16 rounded-full ring-2 ring-emerald-200 dark:ring-emerald-600/50 object-cover"
            />
            <span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-gradient-to-br from-sky-500 to-emerald-500 text-white text-xs font-bold flex items-center justify-center shadow">
              {t.name.charAt(0)}
            </span>
          </div>
          <div className="flex flex-col flex-1">
            <figcaption className="font-semibold text-lg text-gray-900 dark:text-white leading-tight">
              {t.name}
            </figcaption>
            <span className="text-sm font-medium text-sky-600 dark:text-sky-300 mt-1">
              {t.role}
            </span>

            {/* Star Rating */}
            <div className="flex items-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-4 h-4 ${
                    star <= (t.rating || 0)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300 dark:text-gray-600"
                  }`}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              {t.rating && (
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
                  ({t.rating})
                </span>
              )}
            </div>
          </div>
        </div>
        <div>
          <blockquote className="text-base leading-relaxed text-gray-700 dark:text-gray-300 font-medium mb-3">
            &ldquo;{truncateContent(t.content, 35)}&rdquo;
          </blockquote>
          {t.content.length > 35 && (
            <button
              onClick={onReadMore}
              className="inline-flex items-center text-sm font-medium text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-200 transition-colors"
            >
              Baca Selengkapnya
              <svg
                className="ml-1 w-4 h-4"
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
            </button>
          )}
        </div>
      </div>
      <div className="h-1.5 w-full bg-gradient-to-r from-sky-500 via-sky-400 to-emerald-500 opacity-70 group-hover:opacity-100 transition-opacity" />
    </figure>
  );
}
