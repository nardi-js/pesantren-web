"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import Image from "next/image";

interface TestimonialModalProps {
  isOpen: boolean;
  onClose: () => void;
  testimonial: {
    name: string;
    position?: string;
    content: string;
    rating: number;
    avatar?: string;
  } | null;
}

export default function TestimonialModal({
  isOpen,
  onClose,
  testimonial,
}: TestimonialModalProps) {
  if (!isOpen || !testimonial) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto relative shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          title="Tutup"
          aria-label="Tutup modal"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        {/* Avatar */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
            {testimonial.avatar ? (
              <Image
                src={testimonial.avatar}
                alt={testimonial.name}
                width={80}
                height={80}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-emerald-600">
                {testimonial.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {/* Name & Position */}
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            {testimonial.name}
          </h3>
          {testimonial.position && (
            <p className="text-gray-600 mb-3">{testimonial.position}</p>
          )}

          {/* Rating */}
          <div className="flex items-center justify-center mb-4">
            {[...Array(5)].map((_, i) => (
              <StarIcon
                key={i}
                className={`w-5 h-5 ${
                  i < testimonial.rating ? "text-yellow-400" : "text-gray-300"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Full Content */}
        <div className="text-gray-700 leading-relaxed">
          <span className="text-4xl text-emerald-500 leading-none">
            &ldquo;
          </span>
          <p className="inline text-lg">{testimonial.content}</p>
          <span className="text-4xl text-emerald-500 leading-none">
            &rdquo;
          </span>
        </div>
      </div>
    </div>
  );
}
