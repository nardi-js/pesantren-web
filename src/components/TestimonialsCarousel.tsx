"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Section } from "./Section";
import TestimonialModal from "./testimonials/TestimonialModal";

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

export function TestimonialsCarousel() {
  const [idx, setIdx] = useState(0);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTestimonial, setSelectedTestimonial] =
    useState<Testimonial | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const next = useCallback(
    () => setIdx((i) => (i + 1) % Math.max(testimonials.length, 1)),
    [testimonials.length]
  );

  const openModal = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTestimonial(null);
  };

  const truncateContent = (content: string, maxLength: number = 120) => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength).trim() + "...";
  };

  // Fetch approved testimonials
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        // Fetch approved testimonials, prioritizing featured ones
        const response = await fetch(
          "/api/testimonials?status=approved&limit=10"
        );
        const data = await response.json();

        if (data.success && data.data) {
          // Filter to get only the testimonials with content
          const validTestimonials = data.data.filter(
            (t: Testimonial) => t.content && t.content.trim().length > 0
          );
          setTestimonials(validTestimonials.slice(0, 6)); // Take max 6 for carousel
        }
      } catch (error) {
        console.error("Error fetching testimonials:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  useEffect(() => {
    if (testimonials.length > 1) {
      const id = setInterval(next, 6000);
      return () => clearInterval(id);
    }
  }, [next, testimonials.length]);

  if (loading) {
    return (
      <Section variant="muted">
        <div className="text-center mb-16">
          <h2 className="heading-md mb-4 text-[hsl(var(--foreground))]">
            Testimoni
          </h2>
          <p className="text-base md:text-lg text-soft max-w-2xl mx-auto">
            Pengalaman mereka tentang proses belajar dan kehidupan di pesantren
            modern kami.
          </p>
        </div>
        <div className="relative max-w-4xl mx-auto">
          <div className="overflow-hidden rounded-2xl">
            <div className="min-w-full px-4">
              <div className="surface-card elevated p-8 md:p-12 rounded-2xl relative overflow-hidden animate-pulse">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-sky-500 via-sky-400 to-emerald-400" />
                <div className="flex flex-col items-center text-center space-y-6">
                  <div className="h-20 w-20 rounded-full bg-gray-200 dark:bg-gray-700" />
                  <div className="space-y-4 w-full">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded max-w-md mx-auto" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded max-w-xs mx-auto" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>
    );
  }

  if (testimonials.length === 0) {
    return null; // Don't show section if no testimonials
  }

  return (
    <Section variant="muted">
      <div className="text-center mb-16">
        <h2 className="heading-md mb-4 text-[hsl(var(--foreground))]">
          Testimoni
        </h2>
        <p className="text-base md:text-lg text-soft max-w-2xl mx-auto">
          Pengalaman mereka tentang proses belajar dan kehidupan di pesantren
          modern kami.
        </p>
      </div>
      <div className="relative max-w-4xl mx-auto">
        <div className="overflow-hidden rounded-2xl">
          <div
            className="flex transition-transform duration-700 ease-out"
            style={{
              transform: `translateX(-${idx * 100}%)`,
            }}
          >
            {testimonials.map((t) => (
              <div key={t._id} className="min-w-full px-4">
                <div className="surface-card elevated p-8 md:p-12 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-sky-500 via-sky-400 to-emerald-400" />
                  <div className="flex flex-col items-center text-center space-y-6">
                    <div className="relative h-20 w-20 rounded-full overflow-hidden shadow-lg ring-4 ring-sky-100 dark:ring-sky-900/50">
                      <Image
                        src={
                          t.image ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            t.name
                          )}&background=10b981&color=fff&size=80`
                        }
                        alt={t.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="relative">
                        <svg
                          className="absolute -top-2 -left-2 w-6 h-6 text-sky-500/30"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z" />
                        </svg>
                        <blockquote className="text-lg md:text-xl leading-relaxed italic font-medium max-w-2xl mx-auto pl-4 text-[hsl(var(--foreground))]">
                          &ldquo;{truncateContent(t.content, 120)}&rdquo;
                        </blockquote>
                        {t.content.length > 120 && (
                          <button
                            onClick={() => openModal(t)}
                            className="mt-3 inline-flex items-center text-sm font-medium text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-200 transition-colors"
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

                      {/* Star Rating */}
                      <div className="flex justify-center items-center gap-1 mb-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-5 h-5 ${
                              star <= (t.rating || 0)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300 dark:text-gray-600"
                            }`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="ml-2 text-sm text-sky-600 dark:text-sky-300">
                          ({t.rating})
                        </span>
                      </div>

                      <div className="pt-4 border-t border-[hsl(var(--divider))]">
                        <p className="font-bold text-lg text-[hsl(var(--foreground))]">
                          {t.name}
                        </p>
                        <p className="text-sm text-sky-600 dark:text-sky-300 font-semibold uppercase tracking-wide">
                          {t.role}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {testimonials.length > 1 && (
          <div className="mt-8 flex justify-center gap-3">
            {testimonials.map((t, i) => (
              <button
                key={t._id}
                onClick={() => setIdx(i)}
                aria-label={`Lihat testimoni ${i + 1}`}
                className={`h-3 w-3 rounded-full transition-all duration-300 ${
                  i === idx
                    ? "bg-sky-500 scale-125 shadow-lg"
                    : "bg-[hsl(var(--border))] hover:bg-sky-300 dark:hover:bg-sky-600 hover:scale-110"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal untuk testimonial lengkap */}
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
    </Section>
  );
}

export default TestimonialsCarousel;
