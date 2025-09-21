"use client";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

// --- Media data ---
const mediaItems: MediaItem[] = [
  {
    id: "img-1",
    type: "image",
    src: "https://images.unsplash.com/photo-1496307653780-42ee777d4833?auto=format&fit=crop&w=900&q=60",
    alt: "Santri membaca di perpustakaan",
    w: 900,
    h: 600,
  },
  {
    id: "img-2",
    type: "image",
    src: "https://images.unsplash.com/photo-1460518451285-97b6aa326961?auto=format&fit=crop&w=900&q=60",
    alt: "Kegiatan belajar kelompok",
    w: 900,
    h: 600,
  },
  {
    id: "vid-1",
    type: "video",
    youtubeId: "dQw4w9WgXcQ",
    title: "Video Profil Pesantren",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
  },
  {
    id: "img-3",
    type: "image",
    src: "https://images.unsplash.com/photo-1581091870627-3b5c8b1d3f1d?auto=format&fit=crop&w=800&q=60",
    alt: "Laboratorium komputer santri",
    w: 800,
    h: 600,
  },
  {
    id: "img-4",
    type: "image",
    src: "https://images.unsplash.com/photo-1558021211-6d1403128f51?auto=format&fit=crop&w=900&q=60",
    alt: "Kegiatan olah raga pagi",
    w: 900,
    h: 600,
  },
  {
    id: "img-5",
    type: "image",
    src: "https://images.unsplash.com/photo-1503416997304-7f8bf166c121?auto=format&fit=crop&w=900&q=60",
    alt: "Ruang kelas modern",
    w: 900,
    h: 600,
  },
  {
    id: "vid-2",
    type: "video",
    youtubeId: "l482T0yNkeo",
    title: "Kegiatan Ekstrakurikuler",
    thumbnail: "https://img.youtube.com/vi/l482T0yNkeo/hqdefault.jpg",
  },
  {
    id: "img-6",
    type: "image",
    src: "https://images.unsplash.com/photo-1596495578069-7b3ac7b4d237?auto=format&fit=crop&w=900&q=60",
    alt: "Lingkungan asri pesantren",
    w: 900,
    h: 600,
  },
  {
    id: "img-7",
    type: "image",
    src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=60",
    alt: "Kegiatan diskusi agama",
    w: 900,
    h: 600,
  },
];

export type MediaItem =
  | {
      id: string;
      type: "image";
      src: string;
      alt: string;
      w: number;
      h: number;
    }
  | {
      id: string;
      type: "video";
      youtubeId: string;
      title: string;
      thumbnail: string;
    };

export default function GalleryClient() {
  const [lightbox, setLightbox] = useState<{
    open: boolean;
    item: Extract<MediaItem, { type: "image" }> | null;
  }>({ open: false, item: null });

  const openImage = useCallback(
    (item: Extract<MediaItem, { type: "image" }>) => {
      setLightbox({ open: true, item });
    },
    []
  );

  const close = useCallback(() => setLightbox({ open: false, item: null }), []);

  return (
    <>
      <MediaGrid onOpenImage={openImage} />
      <Lightbox state={lightbox} onClose={close} />
    </>
  );
}

function MediaGrid({
  onOpenImage,
}: {
  onOpenImage: (item: Extract<MediaItem, { type: "image" }>) => void;
}) {
  const [visible, setVisible] = useState(6);
  const shown = mediaItems.slice(0, visible);
  const canLoadMore = visible < mediaItems.length;
  return (
    <section className="py-14 section-base">
      <div className="app-container">
        <div className="mb-8 max-w-2xl">
          <h2 className="heading-sm mb-3 animate-fade-up animation-delay-0">
            Koleksi Terbaru
          </h2>
          <p className="text-soft animate-fade-up animation-delay-100">
            Jelajahi dokumentasi aktivitas terbaru kami. Klik gambar untuk
            memperbesar atau putar video langsung.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((item, idx) => {
            const delayClass =
              idx === 0
                ? "animation-delay-0"
                : idx === 1
                ? "animation-delay-100"
                : idx === 2
                ? "animation-delay-200"
                : idx === 3
                ? "animation-delay-0"
                : idx === 4
                ? "animation-delay-100"
                : "animation-delay-200";
            return (
              <div
                key={item.id}
                className={`group relative overflow-hidden rounded-xl surface-card elevated hoverable animate-zoom-in ${delayClass}`}
              >
                {item.type === "image" ? (
                  <ImageCard item={item} onOpen={() => onOpenImage(item)} />
                ) : (
                  <VideoCard item={item} />
                )}
              </div>
            );
          })}
        </div>
        {canLoadMore && (
          <div className="mt-10 flex justify-center">
            <button
              onClick={() =>
                setVisible((v) => Math.min(v + 3, mediaItems.length))
              }
              className="btn-outline"
              aria-label="Muat lebih banyak media"
            >
              Muat Lebih
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function ImageCard({
  item,
  onOpen,
}: {
  item: Extract<MediaItem, { type: "image" }>;
  onOpen: () => void;
}) {
  return (
    <>
      <Image
        src={item.src}
        alt={item.alt}
        width={item.w}
        height={item.h}
        className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
      <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col">
        <span className="text-sm font-medium text-white drop-shadow">
          {item.alt}
        </span>
        <button
          className="mt-2 self-start btn-outline !px-3 !py-1 text-xs font-semibold backdrop-blur-sm bg-white/70 dark:bg-white/10 border-white/40 hover:border-white hover:text-white hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-sky-400/70"
          aria-label="Perbesar gambar"
          onClick={onOpen}
        >
          Buka
        </button>
      </div>
    </>
  );
}

function VideoCard({ item }: { item: Extract<MediaItem, { type: "video" }> }) {
  const [play, setPlay] = useState(false);
  return (
    <div className="relative">
      {!play && (
        <>
          <div className="relative w-full overflow-hidden">
            <div className="pt-[56.25%]" />
            <Image
              src={item.thumbnail}
              alt={item.title}
              fill
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
          <button
            aria-label="Putar video"
            onClick={() => setPlay(true)}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="h-14 w-14 rounded-full bg-white/85 dark:bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-red-600 drop-shadow"
              >
                <path d="M10 15.5v-7l6 3.5-6 3.5Z" />
              </svg>
            </div>
          </button>
          <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col pointer-events-none">
            <span className="text-sm font-medium text-white drop-shadow">
              {item.title}
            </span>
          </div>
        </>
      )}
      {play && (
        <div className="relative w-full overflow-hidden">
          <div className="pt-[56.25%]" />
          <iframe
            src={`https://www.youtube.com/embed/${item.youtubeId}?autoplay=1&rel=0`}
            title={item.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full rounded-md"
          />
        </div>
      )}
    </div>
  );
}

// Lightbox Component
function Lightbox({
  state,
  onClose,
}: {
  state: { open: boolean; item: Extract<MediaItem, { type: "image" }> | null };
  onClose: () => void;
}) {
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const prevActiveRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (state.open) {
      prevActiveRef.current = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      prevActiveRef.current?.focus();
    }
  }, [state.open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!state.open) return;
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.open, onClose]);

  if (!state.open || !state.item) return null;

  return (
    <div
      ref={backdropRef}
      role="dialog"
      aria-modal="true"
      aria-label={state.item.alt}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-up"
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose();
      }}
    >
      <div className="relative max-w-5xl w-full mx-auto">
        <button
          onClick={onClose}
          aria-label="Tutup"
          className="absolute -top-12 right-0 text-white/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
        <Image
          src={state.item.src}
          alt={state.item.alt}
          width={state.item.w}
          height={state.item.h}
          className="w-full h-auto rounded-lg shadow-lg"
          sizes="100vw"
          priority
        />
        <p className="mt-4 text-center text-sm text-white/90 font-medium">
          {state.item.alt}
        </p>
      </div>
    </div>
  );
}
