"use client";
import { useMemo, useState, useEffect } from "react";
import { EVENT_CATEGORIES } from "@/data/events";
import Image from "next/image";
import Link from "next/link";

interface Event {
  _id: string;
  title: string;
  slug: string;
  description: string;
  featuredImage: string;
  date: string;
  time: string;
  location: string;
  category: string;
  tags: string[];
  registrationOpen: boolean;
  capacity?: number;
  registered: number;
  price?: number;
}

interface FilterState {
  category: string;
  date: string; // yyyy-mm-dd
  search: string;
}

const initialFilters: FilterState = { category: "All", date: "", search: "" };

// Dummy prayer times (could be fetched later)
const PRAYER_TIMES = [
  { label: "Subuh", time: "04:35" },
  { label: "Dzuhur", time: "12:01" },
  { label: "Ashar", time: "15:23" },
  { label: "Maghrib", time: "17:54" },
  { label: "Isya", time: "19:05" },
];

export default function EventsClient() {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: "1",
          limit: "50",
          upcoming: "true", // Only get upcoming events
        });

        if (filters.category !== "All") {
          params.append("category", filters.category);
        }

        if (filters.search) {
          params.append("search", filters.search);
        }

        const response = await fetch(`/api/events?${params}`);
        const result = await response.json();

        if (result.success) {
          setEvents(result.data.events);
        } else {
          setError("Gagal memuat data events");
        }
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Gagal memuat data events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [filters.category, filters.search]);

  const change = (k: keyof FilterState, v: string) =>
    setFilters((f) => ({ ...f, [k]: v }));

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (filters.date) {
        const eventDate = new Date(e.date).toISOString().split("T")[0];
        if (eventDate !== filters.date) return false;
      }
      return true;
    });
  }, [events, filters.date]);

  const nextUpcoming = useMemo(() => filtered[0], [filtered]);

  return (
    <section className="section-base pt-20 pb-20">
      <div className="app-container space-y-14">
        <Filters
          filters={filters}
          onChange={change}
          onResetAll={() => setFilters(initialFilters)}
        />

        {nextUpcoming && <UpcomingHighlight item={nextUpcoming} />}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="animate-pulse">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-64"></div>
              </div>
            ))
          ) : error ? (
            <div className="col-span-full text-center text-red-500">
              {error}
            </div>
          ) : (
            filtered.map((e, idx) => (
              <EventCard key={e._id} event={e} idx={idx} />
            ))
          )}
          {!loading && !error && filtered.length === 0 && (
            <p className="col-span-full text-center text-sm text-[hsl(var(--foreground-soft))]">
              Tidak ada event cocok dengan filter.
            </p>
          )}
        </div>
        <PrayerTimes />
      </div>
    </section>
  );
}

function Filters({
  filters,
  onChange,
  onResetAll,
}: {
  filters: FilterState;
  onChange: (k: keyof FilterState, v: string) => void;
  onResetAll: () => void;
}) {
  return (
    <div className="rounded-xl surface-card elevated p-6 flex flex-col md:flex-row gap-6 md:items-end animate-fade-up">
      <div className="flex flex-col gap-2 w-full md:w-48">
        <label
          htmlFor="filter-category"
          className="text-xs font-semibold tracking-wide uppercase text-[hsl(var(--foreground-muted))]"
        >
          Kategori
        </label>
        <select
          id="filter-category"
          aria-label="Pilih kategori"
          value={filters.category}
          onChange={(e) => onChange("category", e.target.value)}
          className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50"
        >
          <option value="All">Semua</option>
          {EVENT_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-2 w-full md:w-52">
        <label
          htmlFor="filter-date"
          className="text-xs font-semibold tracking-wide uppercase text-[hsl(var(--foreground-muted))]"
        >
          Tanggal
        </label>
        <input
          id="filter-date"
          aria-label="Filter tanggal"
          type="date"
          value={filters.date}
          onChange={(e) => onChange("date", e.target.value)}
          className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50"
        />
      </div>
      <div className="flex flex-col gap-2 flex-1">
        <label
          htmlFor="filter-search"
          className="text-xs font-semibold tracking-wide uppercase text-[hsl(var(--foreground-muted))]"
        >
          Cari Judul
        </label>
        <input
          id="filter-search"
          aria-label="Cari judul event"
          placeholder="Cari event..."
          value={filters.search}
          onChange={(e) => onChange("search", e.target.value)}
          className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50"
        />
      </div>
      <div className="flex gap-3 md:ml-auto">
        <button
          onClick={() => onChange("category", "All")}
          className="btn-outline text-xs px-4 py-2"
        >
          Reset
        </button>
        <button onClick={onResetAll} className="btn-primary text-xs px-5 py-2">
          Clear
        </button>
      </div>
    </div>
  );
}

function UpcomingHighlight({ item }: { item: Event }) {
  return (
    <div className="rounded-2xl overflow-hidden surface-card elevated hoverable grid md:grid-cols-[320px_1fr] gap-0 animate-fade-up">
      <div className="relative h-56 md:h-full">
        <Image
          src={item.featuredImage}
          alt={item.title}
          fill
          className="object-cover object-center transition-transform duration-500 md:group-hover:scale-[1.04]"
          sizes="(max-width:768px) 100vw, 320px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent opacity-60" />
        <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-[11px] font-semibold bg-sky-500 text-white shadow ring-1 ring-sky-300/50">
          Upcoming
        </span>
      </div>
      <div className="p-8 flex flex-col gap-5">
        <div className="space-y-3">
          <h2 className="heading-sm md:heading-md text-[hsl(var(--foreground))]">
            {item.title}
          </h2>
          <MetaLine event={item} />
          <p className="text-soft line-clamp-4 max-w-prose">
            {item.description}
          </p>
        </div>
        <div className="mt-auto flex flex-wrap gap-3 items-center">
          <Link
            href={`/events/${item.slug}`}
            className="inline-flex items-center gap-2 rounded-full bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold px-6 py-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 transition-colors shadow"
          >
            Lihat Detail
          </Link>
          {item.tags?.slice(0, 3).map((t: string) => (
            <span
              key={t}
              className="px-3 py-1 rounded-full text-[11px] font-semibold bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function EventCard({ event, idx }: { event: Event; idx: number }) {
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
          src={event.featuredImage}
          alt={event.title}
          fill
          className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.06]"
          sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent opacity-0 group-hover:opacity-75 transition-opacity" />
        <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/80 dark:bg-white/10 backdrop-blur-sm text-sky-700 dark:text-sky-300 ring-1 ring-sky-300/50 dark:ring-sky-600/40">
          {event.category}
        </span>
      </div>
      <div className="p-5 flex flex-col gap-3 flex-1">
        <h3 className="font-semibold text-base leading-snug line-clamp-2 bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-emerald-600 dark:from-sky-400 dark:to-emerald-400">
          {event.title}
        </h3>
        <MetaLine event={event} small />
        <p className="text-sm text-[hsl(var(--foreground-soft))] line-clamp-3">
          {event.description}
        </p>

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {event.tags.slice(0, 2).map((tag: string) => (
              <span
                key={tag}
                className="px-2 py-1 rounded-full text-[10px] font-semibold bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm"
              >
                {tag}
              </span>
            ))}
            {event.tags.length > 2 && (
              <span className="px-2 py-1 rounded-full text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                +{event.tags.length - 2}
              </span>
            )}
          </div>
        )}

        <div className="pt-1 mt-auto">
          <Link
            href={`/events/${event.slug}`}
            className="inline-flex items-center rounded-full bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold px-4 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 transition-colors shadow"
          >
            Lihat Detail
          </Link>
        </div>
      </div>
    </article>
  );
}

function MetaLine({ event, small }: { event: Event; small?: boolean }) {
  return (
    <div
      className={`flex flex-wrap items-center gap-4 ${
        small ? "text-[11px]" : "text-xs"
      } font-medium text-[hsl(var(--foreground-soft))]`}
    >
      <span className="inline-flex items-center gap-1">
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M8 2v2m8-2v2M3 9h18M5 7h14v13H5z" />
        </svg>
        {new Date(event.date).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
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

function PrayerTimes() {
  return (
    <div className="rounded-2xl surface-card elevated p-6 animate-fade-up">
      <h2 className="text-sm font-semibold tracking-wide uppercase text-[hsl(var(--foreground-muted))] mb-4">
        Jadwal Sholat (Dummy)
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {PRAYER_TIMES.map((p) => (
          <div
            key={p.label}
            className="flex flex-col items-center gap-1 p-3 rounded-xl bg-[hsl(var(--surface-alt))] ring-1 ring-[hsl(var(--border)/0.6)]"
          >
            <span className="text-[11px] font-semibold tracking-wide text-sky-600 dark:text-sky-300 uppercase">
              {p.label}
            </span>
            <span className="text-sm font-medium text-[hsl(var(--foreground))]">
              {p.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
