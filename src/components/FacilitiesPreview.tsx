"use client";
import { Section } from "./Section";
import Image from "next/image";

// Static facilities data adapted from profile page
const facilities = [
  {
    id: 1,
    title: "Perpustakaan",
    desc: "Koleksi buku islami & referensi modern.",
    img: "/Perpustakaan.jpg", // ✅ absolute from public/
    icon: "📚",
  },
  {
    id: 2,
    title: "Canteen",
    desc: "Tempat makan & istirahat santri.",
    img: "/CanteenPondok.jpg",
    icon: "🍽️",
  },
  {
    id: 3,
    title: "Masjid",
    desc: "Pusat kegiatan ibadah & pembinaan ruhiyah.",
    img: "/Masjid.jpg",
    icon: "🕌",
  },
  {
    id: 4,
    title: "Asrama",
    desc: "Lingkungan tempat tinggal yang nyaman & teratur.",
    img: "/Asrama.jpg",
    icon: "🏠",
  },
  {
    id: 5,
    title: "Lapangan Olahraga",
    desc: "Fasilitas olahraga untuk kesehatan jasmani.",
    img: "/lapangan.jpg",
    icon: "⚽",
  },
  {
    id: 6,
    title: "Gazebo",
    desc: "Tempat bersantai & diskusi santai.",
    img: "/Gazebo.jpg",
    icon: "🏡",
  },
];

export function FacilitiesPreview() {
  return (
    <Section variant="muted" className="py-16 md:py-20">
      <div className="mb-12 text-center">
        <h2 className="heading-sm md:heading-md mb-4 text-[hsl(var(--foreground))]">
          Fasilitas Pesantren
        </h2>
        <p className="text-soft max-w-2xl md:text-lg mx-auto leading-relaxed">
          Sarana pendukung pembelajaran dan pengembangan karakter santri yang
          modern dan nyaman.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {facilities.map((facility, index) => (
          <div
            key={facility.id}
            className={`group surface-card elevated hoverable rounded-xl overflow-hidden transition-all duration-300 animate-fade-up ${
              index % 3 === 1
                ? "animation-delay-100"
                : index % 3 === 2
                ? "animation-delay-200"
                : "animation-delay-0"
            }`}
          >
            {/* Image container */}
            <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-sky-100 to-emerald-100 dark:from-sky-900/20 dark:to-emerald-900/20">
              <Image
                src={facility.img}
                alt={facility.title}
                width={400}
                height={200}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

              {/* Icon overlay */}
              <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm flex items-center justify-center text-xl shadow-lg">
                {facility.icon}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-3">
              <h3 className="font-semibold text-lg tracking-tight text-[hsl(var(--foreground))] group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                {facility.title}
              </h3>
              <p className="text-soft text-sm leading-relaxed">
                {facility.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Call to action */}
      <div className="text-center mt-12">
        <a
          href="/profile"
          className="inline-flex items-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
        >
          <span>Lihat Semua Fasilitas</span>
          <svg
            className="w-4 h-4"
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
        </a>
      </div>
    </Section>
  );
}
