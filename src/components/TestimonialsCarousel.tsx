"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Section } from "./Section";

const testimonials = [
  {
    id: 1,
    name: "Ahmad",
    role: "Alumni 2022",
    photo: "https://i.pravatar.cc/150?img=11",
    text: "Pesantren ini membentuk karakter dan kedisiplinan saya. Lingkungan yang mendukung hafalan Qur'an dan belajar modern.",
  },
  {
    id: 2,
    name: "Fatimah",
    role: "Wali Santri",
    photo: "https://i.pravatar.cc/150?img=32",
    text: "Anak saya berkembang pesat dalam akhlak, kemandirian, dan wawasan global tanpa meninggalkan nilai Islam.",
  },
  {
    id: 3,
    name: "Ustadz Yusuf",
    role: "Pengajar",
    photo: "https://i.pravatar.cc/150?img=56",
    text: "Kurikulum terpadu memadukan tahfidz, akademik, dan life skill. Santri aktif dan antusias belajar.",
  },
];

export function TestimonialsCarousel() {
  const [idx, setIdx] = useState(0);
  const next = useCallback(
    () => setIdx((i) => (i + 1) % testimonials.length),
    []
  );

  useEffect(() => {
    const id = setInterval(next, 6000);
    return () => clearInterval(id);
  }, [next]);

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
            className={`flex transition-transform duration-700 ease-out ${
              idx === 0
                ? "translate-x-0"
                : idx === 1
                ? "-translate-x-full"
                : idx === 2
                ? "-translate-x-[200%]"
                : "-translate-x-0"
            }`}
          >
            {testimonials.map((t) => (
              <div key={t.id} className="min-w-full px-4">
                <div className="surface-card elevated p-8 md:p-12 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-sky-500 via-sky-400 to-emerald-400" />
                  <div className="flex flex-col items-center text-center space-y-6">
                    <div className="relative h-20 w-20 rounded-full overflow-hidden shadow-lg ring-4 ring-sky-100 dark:ring-sky-900/50">
                      <Image
                        src={t.photo}
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
                          &ldquo;{t.text}&rdquo;
                        </blockquote>
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
        <div className="mt-8 flex justify-center gap-3">
          {testimonials.map((t, i) => (
            <button
              key={t.id}
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
      </div>
    </Section>
  );
}

export default TestimonialsCarousel;
