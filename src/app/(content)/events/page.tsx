import type { Metadata } from "next";
import EventsClient from "@/components/events/EventsClient";

export const metadata: Metadata = {
  title: "Agenda & Kegiatan",
  description: "Lihat jadwal kajian, kegiatan harian, dan event pesantren",
};

export default function EventsPage() {
  return (
    <div className="flex flex-col islamic-pattern">
      <Hero />
      <EventsClient />
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
          Agenda & Kegiatan
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto font-medium animate-fade-up animation-delay-100 leading-relaxed">
          Lihat jadwal kajian, kegiatan harian, dan event pesantren
        </p>
      </div>
    </section>
  );
}
