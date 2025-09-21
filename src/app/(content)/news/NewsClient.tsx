"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useMemo } from "react";

interface NewsItem {
  id: string;
  title: string;
  description: string;
  image: string;
  slug: string;
  featured?: boolean;
  date: string;
}

// Dummy data (could be fetched later)
const NEWS_DATA: NewsItem[] = [
  {
    id: "1",
    title: "Pelatihan Tahfidz Intensif Ramadhan 1447H",
    description:
      "Program khusus peningkatan hafalan Al-Qur'an selama bulan Ramadhan dengan metode talaqqi dan muraja'ah terstruktur.",
    image: "https://source.unsplash.com/600x400/?quran,islamic,study",
    slug: "pelatihan-tahfidz-intensif-ramadhan-1447h",
    featured: true,
    date: "2025-03-15",
  },
  {
    id: "2",
    title: "Workshop Sains Terapan untuk Santri Madrasah Aliyah",
    description:
      "Eksperimen laboratorium sains terapan untuk mendorong minat penelitian di kalangan santri tingkat lanjut.",
    image: "https://source.unsplash.com/600x400/?science,laboratory,students",
    slug: "workshop-sains-terapan-santri-aliyah",
    date: "2025-03-10",
  },
  {
    id: "3",
    title: "Kegiatan Bakti Sosial Bersama Warga Sekitar Pesantren",
    description:
      "Distribusi paket sembako dan layanan kesehatan gratis sebagai wujud kepedulian sosial santri.",
    image: "https://source.unsplash.com/600x400/?charity,community,help",
    slug: "bakti-sosial-bersama-warga",
    date: "2025-03-05",
  },
  {
    id: "4",
    title: "Lomba Pidato Bahasa Arab dan Inggris Tingkat Pesantren",
    description:
      "Ajang peningkatan kemampuan retorika dan penguasaan bahasa asing bagi santri tingkat Tsanawiyah dan Aliyah.",
    image:
      "https://source.unsplash.com/600x400/?publicspeaking,language,education",
    slug: "lomba-pidato-bahasa-arab-inggris",
    date: "2025-02-28",
  },
  {
    id: "5",
    title: "Penanaman Pohon dalam Program Go Green Pesantren",
    description:
      "Gerakan penghijauan lingkungan pesantren sebagai bagian dari edukasi kepedulian alam dan keberlanjutan.",
    image: "https://source.unsplash.com/600x400/?tree,planting,green",
    slug: "program-go-green-penanaman-pohon",
    date: "2025-02-20",
  },
  {
    id: "6",
    title: "Kajian Kitab Klasik Bersama Ulama Tamu Nasional",
    description:
      "Sesi intensif kajian kitab turats selama tiga hari dengan fokus pada pendalaman fikih dan tafsir.",
    image: "https://source.unsplash.com/600x400/?mosque,lecture,islamic",
    slug: "kajian-kitab-klasik-ulama-tamu",
    date: "2025-02-12",
  },
  {
    id: "7",
    title: "Prestasi Santri dalam Olimpiade Matematika Regional",
    description:
      "Beberapa santri berhasil meraih medali perak dan perunggu dalam ajang kompetisi matematika tingkat regional.",
    image:
      "https://source.unsplash.com/600x400/?mathematics,competition,students",
    slug: "prestasi-santri-olimpiade-matematika",
    date: "2025-02-05",
  },
  {
    id: "8",
    title: "Peluncuran Program Bahasa Asing Intensif Semester Genap",
    description:
      "Program peningkatan kemampuan berbicara Bahasa Arab dan Inggris melalui klub percakapan harian.",
    image: "https://source.unsplash.com/600x400/?language,learning,students",
    slug: "program-bahasa-asing-intensif",
    date: "2025-01-28",
  },
];

const PAGE_SIZE = 6;

export default function NewsClient() {
  const [page, setPage] = useState(1);

  // Separate featured article (first item with featured flag)
  const featured = useMemo(() => NEWS_DATA.find((n) => n.featured), []);
  const rest = useMemo(() => NEWS_DATA.filter((n) => !n.featured), []);

  const totalPages = Math.ceil(rest.length / PAGE_SIZE);
  const start = (page - 1) * PAGE_SIZE;
  const current = rest.slice(start, start + PAGE_SIZE);

  return (
    <section className="py-16 section-base">
      <div className="app-container space-y-14">
        {page === 1 && featured && <FeaturedCard item={featured} />}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {current.map((item, idx) => (
            <NewsCard key={item.id} item={item} idx={idx} />
          ))}
        </div>
        <Pagination
          page={page}
          totalPages={totalPages}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
        />
      </div>
    </section>
  );
}

function FeaturedCard({ item }: { item: NewsItem }) {
  return (
    <article className="group relative rounded-2xl overflow-hidden surface-card elevated hoverable animate-fade-up">
      <div className="grid md:grid-cols-2 gap-0">
        <div className="relative h-64 md:h-full order-1 md:order-none">
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.04]"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-black/50 via-black/10 to-transparent opacity-60 group-hover:opacity-70 transition-opacity" />
        </div>
        <div className="p-8 flex flex-col justify-center space-y-5">
          <div className="space-y-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300 ring-1 ring-sky-200/60 dark:ring-sky-700/50">
              Featured
            </span>
            <h2 className="heading-sm md:heading-md line-clamp-3 bg-clip-text text-transparent bg-gradient-to-br from-sky-600 to-emerald-600 dark:from-sky-300 dark:to-emerald-300">
              {item.title}
            </h2>
            <p className="text-soft line-clamp-4 max-w-prose">
              {item.description}
            </p>
          </div>
          <div>
            <Link
              href={`/news/${item.slug}`}
              className="inline-flex items-center gap-2 rounded-full bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold px-6 py-2.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 shadow hover:shadow-md"
            >
              Read More
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-4 w-4"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function NewsCard({ item, idx }: { item: NewsItem; idx: number }) {
  const delay =
    idx % 3 === 0
      ? "animation-delay-0"
      : idx % 3 === 1
      ? "animation-delay-100"
      : "animation-delay-200";
  return (
    <article
      className={`group flex flex-col rounded-xl overflow-hidden surface-card elevated hoverable animate-fade-up ${delay}`}
    >
      <div className="relative h-48">
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.06]"
          sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent opacity-0 group-hover:opacity-75 transition-opacity" />
      </div>
      <div className="p-5 flex flex-col gap-3 flex-1">
        <h3 className="font-semibold text-base leading-snug line-clamp-2 text-[hsl(var(--foreground))]">
          {item.title}
        </h3>
        <p className="text-sm text-[hsl(var(--foreground-soft))] line-clamp-3">
          {item.description}
        </p>
        <div className="pt-1 mt-auto">
          <Link
            href={`/news/${item.slug}`}
            className="inline-flex items-center rounded-full bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold px-4 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 transition-colors shadow"
          >
            Read More
          </Link>
        </div>
      </div>
    </article>
  );
}

function Pagination({
  page,
  totalPages,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-center gap-4 pt-4">
      <button
        onClick={onPrev}
        disabled={page === 1}
        className="px-5 py-2 rounded-full text-sm font-semibold border border-sky-300/60 dark:border-sky-700/60 bg-white/60 dark:bg-sky-950/30 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-sky-50 dark:hover:bg-sky-900/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60"
        aria-label="Halaman sebelumnya"
      >
        Previous
      </button>
      <span className="text-sm font-medium text-[hsl(var(--foreground-soft))]">
        Page{" "}
        <span className="text-[hsl(var(--foreground))] font-semibold">
          {page}
        </span>{" "}
        of {totalPages}
      </span>
      <button
        onClick={onNext}
        disabled={page === totalPages}
        className="px-5 py-2 rounded-full text-sm font-semibold border border-sky-300/60 dark:border-sky-700/60 bg-white/60 dark:bg-sky-950/30 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-sky-50 dark:hover:bg-sky-900/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60"
        aria-label="Halaman berikutnya"
      >
        Next
      </button>
    </div>
  );
}
