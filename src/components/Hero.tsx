"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Container from "./Container";

const fallbackSlides = [
  {
    src: "https://source.unsplash.com/1920x1080/?mosque,architecture",
    alt: "Islamic Architecture",
  },
  {
    src: "https://source.unsplash.com/1920x1080/?education,books",
    alt: "Islamic Education",
  },
  {
    src: "https://source.unsplash.com/1920x1080/?nature,peaceful",
    alt: "Peaceful Environment",
  },
];

interface HeroProps {
  videoUrl?: string; // Cloudinary video URL if available
}

export function Hero({ videoUrl }: HeroProps) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setIndex((i) => (i + 1) % fallbackSlides.length),
      4000
    );
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative h-screen min-h-[620px] w-full overflow-hidden flex items-center">
      {/* Background media */}
      {videoUrl ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster={fallbackSlides[0].src}
        >
          <source src={videoUrl} />
        </video>
      ) : (
        <div className="absolute inset-0">
          {fallbackSlides.map((s, i) => (
            <Image
              key={i}
              src={s.src}
              alt={s.alt}
              fill
              className={`object-cover transition-opacity duration-1000 ${
                i === index ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
        </div>
      )}
      {/* Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,hsl(var(--brand-300)/0.55),transparent_60%),linear-gradient(to_bottom_right,hsl(var(--brand-900)/0.85),hsl(var(--brand-800)/0.9),hsl(var(--brand-900)/0.92))]" />

      <Container className="relative z-10 h-full flex flex-col justify-center text-center animate-fade-up">
        <div className="max-w-4xl mx-auto">
          <h1 className="heading-lg md:heading-xl text-white mb-6 leading-tight">
            Membangun Generasi Islami
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-sky-300 via-sky-200 to-emerald-200">
              Berwawasan Global
            </span>
          </h1>
          <p className="text-lg md:text-2xl text-white/80 mb-10 max-w-3xl mx-auto leading-relaxed font-medium">
            Pesantren Modern yang menanamkan nilai Qur&apos;ani, karakter mulia,
            dan kecakapan abad 21 untuk masa depan yang cerah.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/daftar"
              className="btn-primary px-10 py-4 text-base md:text-lg font-semibold shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all"
            >
              Daftar Sekarang
            </Link>
            <Link
              href="/gallery"
              className="btn-outline text-white border-white/40 hover:border-white/70 hover:bg-white/10 backdrop-blur-sm px-10 py-4 text-base md:text-lg font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02]"
            >
              Lihat Galeri
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center animate-bounce">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
          </div>
          <span className="text-white/60 text-xs tracking-widest font-semibold uppercase">
            Scroll
          </span>
        </div>
      </Container>
    </section>
  );
}

export default Hero;
// NOTE: Duplicate legacy hero implementation removed.
