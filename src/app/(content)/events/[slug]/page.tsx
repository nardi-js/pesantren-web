import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findEvent, EVENTS } from "@/data/events";
// Calendar helpers only used in client component now

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return EVENTS.map((e) => ({ slug: e.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const event = findEvent(params.slug);
  if (!event) return { title: "Event Tidak Ditemukan" };
  return {
    title: event.title,
    description: event.description,
    openGraph: {
      title: event.title,
      description: event.description,
      type: "article",
      images: [{ url: event.image }],
    },
  };
}

export default function EventDetailPage({ params }: Props) {
  const event = findEvent(params.slug);
  if (!event) return notFound();
  return (
    <article className="pt-28 md:pt-32 pb-20 space-y-16 islamic-pattern">
      <header className="app-container">
        <div className="relative h-64 md:h-80 w-full rounded-2xl overflow-hidden bg-gradient-to-br from-sky-100 via-sky-200 to-emerald-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 border border-emerald-200/50 dark:border-emerald-700/30">
          {/* Islamic Pattern Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-sky-500/10 to-emerald-500/10 dark:from-emerald-400/5 dark:via-sky-400/5 dark:to-emerald-400/5" />

          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-gray-900 dark:text-white space-y-4">
            <div className="flex flex-wrap gap-3 items-center">
              <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/90 text-white backdrop-blur-sm ring-1 ring-emerald-300/50">
                {event.category}
              </span>
              {event.tags?.map((t) => (
                <span
                  key={t}
                  className="px-3 py-1 rounded-full text-[11px] font-medium bg-white/15 dark:bg-gray-800/80 backdrop-blur-sm ring-1 ring-white/30 dark:ring-gray-600/30"
                >
                  {t}
                </span>
              ))}
            </div>
            <h1 className="heading-md md:heading-lg max-w-3xl drop-shadow-md bg-gradient-to-r from-emerald-600 via-sky-600 to-emerald-600 dark:from-emerald-400 dark:via-sky-400 dark:to-emerald-400 bg-clip-text text-transparent">
              {event.title}
            </h1>
            <MetaLine event={event} />
          </div>
        </div>
      </header>
      <div className="app-container grid lg:grid-cols-[1fr_320px] gap-12 items-start">
        <div className="prose prose-sky dark:prose-invert max-w-none leading-relaxed animate-fade-up">
          <p>{event.description}</p>
          <h2>Rincian Kegiatan</h2>
          <ul>
            <li>Lokasi: {event.location}</li>
            <li>Tanggal: {event.date}</li>
            <li>Waktu: {event.time} WIB</li>
            <li>Kategori: {event.category}</li>
          </ul>
          <h2>Map (Placeholder)</h2>
          <div className="rounded-xl overflow-hidden ring-1 ring-[hsl(var(--border))] bg-[hsl(var(--surface-alt))] p-8 text-center text-sm text-[hsl(var(--foreground-soft))]">
            Embed peta bisa diletakkan di sini.
          </div>
          <h2>Catatan</h2>
          <p>
            Konten deskriptif tambahan bisa ditambahkan di sini untuk
            menjelaskan detail teknis, dress code, perlengkapan yang harus
            dibawa, dsb.
          </p>
        </div>
        <aside className="space-y-6 animate-fade-up animation-delay-100">
          <EventActionsClient event={event} />
          <div className="rounded-2xl surface-card elevated p-6 space-y-3">
            <h3 className="text-sm font-semibold tracking-wide uppercase text-[hsl(var(--foreground-muted))]">
              Event Lainnya
            </h3>
            <ul className="space-y-3 text-sm">
              {EVENTS.filter((e) => e.slug !== event.slug)
                .slice(0, 5)
                .map((e) => (
                  <li key={e.id} className="flex flex-col">
                    <Link
                      href={`/events/${e.slug}`}
                      className="font-medium text-sky-600 dark:text-sky-300 hover:underline line-clamp-2"
                    >
                      {e.title}
                    </Link>
                    <span className="text-[11px] text-[hsl(var(--foreground-soft))]">
                      {e.date} • {e.time}
                    </span>
                  </li>
                ))}
            </ul>
          </div>
        </aside>
      </div>
    </article>
  );
}

import { EventItem } from "@/data/events";
function MetaLine({ event }: { event: EventItem }) {
  return (
    <div className="flex flex-wrap items-center gap-6 text-sm font-medium">
      <span className="inline-flex items-center gap-1">
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M8 2v2m8-2v2M3 9h18M5 7h14v13H5z" />
        </svg>
        {new Date(event.date + "T" + event.time).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </span>
      <span className="inline-flex items-center gap-1">
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 0V3m0 18v-4m9-5h-4M3 12h4" />
        </svg>
        {event.time} WIB
      </span>
      <span className="inline-flex items-center gap-1">
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2 4 7v7c0 5 8 8 8 8s8-3 8-8V7l-8-5Z" />
        </svg>
        {event.location}
      </span>
    </div>
  );
}

// Client interactivity moved to EventActionsClient (imported below)
import EventActionsClient from "@/components/events/EventActionsClient";
