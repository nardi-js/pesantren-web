"use client";
import { useState } from "react";
import Image from "next/image";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  avatar: string;
  text: string;
}

const ALL_TESTIMONIALS: Testimonial[] = Array.from({ length: 24 }).map(
  (_, i) => ({
    id: i + 1,
    name: `Santri ${i + 1}`,
    role: i % 3 === 0 ? "Alumni" : i % 3 === 1 ? "Santri Aktif" : "Wali Santri",
    avatar: `https://i.pravatar.cc/150?img=${(i % 70) + 1}`,
    text: "Lingkungan belajar yang kondusif, para asatidz penuh perhatian, dan pembinaan akhlak yang terasa nyata dalam keseharian.",
  })
);

const PAGE_SIZE = 9;

export default function TestimonialsClient() {
  const [page, setPage] = useState(1);
  const visible = ALL_TESTIMONIALS.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < ALL_TESTIMONIALS.length;

  return (
    <section className="section-base py-20 -mt-8">
      <div className="app-container space-y-12">
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {visible.map((t, idx) => (
            <Card key={t.id} t={t} idx={idx} />
          ))}
        </div>
        <div className="flex items-center justify-center gap-4">
          {hasMore ? (
            <button
              onClick={() => setPage((p) => p + 1)}
              className="px-8 py-3 text-sm font-semibold bg-gradient-to-r from-emerald-500 to-sky-600 hover:from-emerald-600 hover:to-sky-700 dark:from-emerald-400 dark:to-sky-500 dark:hover:from-emerald-500 dark:hover:to-sky-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Muat Lagi
            </button>
          ) : (
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Semua testimoni ditampilkan.
            </span>
          )}
          <button className="px-6 py-3 text-sm font-semibold border-2 border-emerald-500 dark:border-emerald-400 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all duration-300">
            Tambah Testimoni
          </button>
        </div>
      </div>
    </section>
  );
}

function Card({ t, idx }: { t: Testimonial; idx: number }) {
  const delayClass = `animation-delay-${(idx % 6) * 50}`; // assumes delay utilities (0,50,100,...)
  return (
    <figure
      className={`group relative flex flex-col rounded-xl bg-white dark:bg-gray-800/90 border border-gray-200/60 dark:border-gray-700/60 shadow-md hover:shadow-lg dark:hover:shadow-emerald-500/10 transition-all duration-300 overflow-hidden hover:scale-[1.025] animate-fade-up ${delayClass}`}
    >
      <div className="p-6 flex flex-col gap-5 flex-1">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Image
              src={t.avatar}
              alt={t.name}
              width={56}
              height={56}
              className="h-12 w-12 rounded-full ring-2 ring-emerald-200 dark:ring-emerald-600/50 object-cover"
            />
            <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-br from-sky-500 to-emerald-500 text-white text-[10px] font-bold flex items-center justify-center shadow">
              {t.name.split(" ")[1]}
            </span>
          </div>
          <div className="flex flex-col">
            <figcaption className="font-semibold text-[hsl(var(--foreground))] leading-tight">
              {t.name}
            </figcaption>
            <span className="text-xs font-medium text-sky-600 dark:text-sky-300">
              {t.role}
            </span>
          </div>
        </div>
        <blockquote className="text-sm leading-relaxed text-[hsl(var(--foreground-soft))]">
          &ldquo;{t.text}&rdquo;
        </blockquote>
      </div>
      <div className="h-1 w-full bg-gradient-to-r from-sky-500 via-sky-400 to-emerald-500 opacity-70 group-hover:opacity-100 transition-opacity" />
    </figure>
  );
}
