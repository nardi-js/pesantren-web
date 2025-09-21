import type { Metadata } from "next";
import NewsClient from "@/components/news/NewsClient";

export const metadata: Metadata = {
  title: "Berita & Artikel - Pesantren",
  description:
    "Kumpulan berita & artikel terbaru seputar kegiatan dan informasi pesantren. Tetap update dengan perkembangan terkini dunia pendidikan Islam.",
  keywords:
    "berita pesantren, artikel islam, pendidikan islam, kegiatan pesantren",
};

export default function NewsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50/50 to-white dark:from-slate-900 dark:to-slate-800">
      <Hero />
      <NewsClient />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-sky-600 to-emerald-600" />
      <div className="absolute inset-0 bg-white/5 bg-opacity-10">
        <div className="w-full h-full opacity-20 bg-gradient-to-br from-transparent via-white/10 to-transparent" />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        <div className="text-center text-white">
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 animate-fade-up">
            Berita & Artikel
          </h1>
          <p className="text-xl lg:text-2xl text-sky-100 max-w-3xl mx-auto leading-relaxed animate-fade-up animation-delay-100">
            Tetap terhubung dengan berita terbaru dan artikel inspiratif dari
            dunia pendidikan Islam
          </p>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto animate-fade-up animation-delay-200">
            <div className="text-center">
              <div className="text-3xl font-bold text-sky-200">100+</div>
              <div className="text-sky-100">Artikel</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-sky-200">50+</div>
              <div className="text-sky-100">Kategori</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-sky-200">1000+</div>
              <div className="text-sky-100">Pembaca</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
