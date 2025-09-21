import Image from "next/image";
import Link from "next/link";
import { Section } from "./Section";

const galleryItems = [
  {
    id: 1,
    type: "image",
    src: "https://source.unsplash.com/600x400/?mosque,classroom",
    alt: "Kegiatan Belajar",
  },
  {
    id: 2,
    type: "image",
    src: "https://source.unsplash.com/600x400/?students,islamic",
    alt: "Lingkungan Pesantren",
  },
  {
    id: 3,
    type: "image",
    src: "https://source.unsplash.com/600x400/?library,islam",
    alt: "Fasilitas",
  },
  { id: 4, type: "video", youtubeId: "dQw4w9WgXcQ", alt: "Video Kegiatan" },
];

export function GalleryPreview() {
  return (
    <Section variant="base">
      <div className="text-center mb-16">
        <h2 className="heading-md mb-4 text-[hsl(var(--foreground))]">
          Galeri Pesantren
        </h2>
        <p className="text-base md:text-lg text-soft max-w-2xl mx-auto">
          Dokumentasi suasana dan kegiatan santri yang mencerminkan kehidupan
          islami modern yang bermakna.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {galleryItems.map((item, index) => (
          <div
            key={item.id}
            className={`group relative aspect-video rounded-xl overflow-hidden surface-card elevated hoverable transition-all duration-500 animate-zoom-in hover:scale-[1.02] ${
              index === 0
                ? "animation-delay-0"
                : index === 1
                ? "animation-delay-100"
                : index === 2
                ? "animation-delay-200"
                : "animation-delay-200"
            }`}
          >
            {item.type === "image" ? (
              <Image
                src={item.src!}
                alt={item.alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width:768px) 100vw, (max-width:1200px) 25vw, 300px"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center">
                <div className="relative w-full h-full">
                  <iframe
                    className="absolute inset-0 h-full w-full rounded-xl"
                    src={`https://www.youtube.com/embed/${item.youtubeId}?rel=0&controls=1&modestbranding=1`}
                    title={item.alt}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {item.type === "video" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
                  <svg
                    className="w-6 h-6 text-sky-600 ml-1"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
              <span className="inline-block px-3 py-1 bg-[hsl(var(--surface)/0.92)] dark:bg-[hsl(var(--surface-alt)/0.92)] backdrop-blur-sm text-[hsl(var(--foreground))] dark:text-[hsl(var(--foreground))] text-sm font-medium rounded-full shadow-lg border border-[hsl(var(--border))]">
                {item.alt}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="text-center mt-12">
        <Link
          href="/gallery"
          className="btn-primary px-8 py-3 text-base md:text-lg font-semibold inline-flex items-center gap-2 group"
        >
          Lihat Galeri Lengkap
          <span className="transition-transform group-hover:translate-x-1">
            →
          </span>
        </Link>
      </div>
    </Section>
  );
}

export default GalleryPreview;
