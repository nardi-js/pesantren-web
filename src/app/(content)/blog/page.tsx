import type { Metadata } from "next";
import BlogListClient from "@/components/blog/BlogListClient";

export const metadata: Metadata = {
  title: "Blog Pesantren",
  description:
    "Cerita & artikel santri, kegiatan harian, inspirasi, dan kisah pembelajaran.",
};

export default function BlogPage() {
  return (
    <div className="flex flex-col islamic-pattern">
      <Hero />
      <ListingSection />
      <CTASection />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative w-full h-[400px] md:h-[480px] overflow-hidden flex items-center justify-center bg-gradient-to-br from-sky-100 via-sky-200 to-emerald-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800">
      {/* Islamic Pattern Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-sky-500/10 to-emerald-500/10 dark:from-emerald-400/5 dark:via-sky-400/5 dark:to-emerald-400/5" />

      <div className="relative z-10 text-center px-6 max-w-4xl space-y-6 mt-20">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-emerald-600 via-sky-600 to-emerald-600 dark:from-emerald-400 dark:via-sky-400 dark:to-emerald-400 bg-clip-text text-transparent animate-fade-up">
          Cerita & Artikel Santri
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto font-medium animate-fade-up animation-delay-100 leading-relaxed">
          Wawasan, inspirasi, dan catatan perjalanan menuntut ilmu di lingkungan
          pesantren modern dan islami
        </p>
      </div>
    </section>
  );
}

function ListingSection() {
  return (
    <section className="section-base py-20 -mt-8">
      <div className="app-container space-y-14">
        <div className="space-y-6 animate-fade-up">
          <h2 className="heading-sm md:heading-md">Tulisan Terbaru</h2>
          <p className="text-soft max-w-prose text-sm md:text-base">
            Kumpulan artikel terbaru dari para santri dan pembina—membahas
            disiplin, aktivitas harian, inspirasi, hingga refleksi spiritual.
          </p>
        </div>
        <BlogListClient />
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-16">
      <div className="app-container">
        <div className="rounded-2xl relative overflow-hidden p-10 md:p-14 bg-gradient-to-br from-sky-600 via-sky-500 to-emerald-500 text-white shadow-lg flex flex-col items-start gap-6 animate-fade-up">
          <div className="absolute inset-0 opacity-[0.15] bg-[radial-gradient(circle_at_center,white,transparent_70%)] pointer-events-none" />
          <h2 className="text-2xl md:text-3xl font-bold leading-tight max-w-xl">
            Punya Cerita atau Gagasan? Bagikan untuk Menginspirasi Santri Lain.
          </h2>
          <p className="text-white/90 max-w-2xl text-sm md:text-base">
            Kami membuka ruang berbagi. Tulis pengalaman belajar, kisah
            adaptasi, atau refleksi yang bermanfaat bagi komunitas.
          </p>
          <a
            href="#"
            className="inline-flex items-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur px-8 py-3 text-sm font-semibold text-white border border-white/30 shadow-md hover:shadow transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            Tulis Cerita Kamu
          </a>
        </div>
      </div>
    </section>
  );
}
