"use client";
import { useEffect, useState } from "react";
import { SummaryCard } from "@/components/admin/SummaryCard";
import { AnimatedSection } from "@/components/admin/AnimatedSection";

interface SummaryResponse {
  success: boolean;
  stats: {
    content: {
      news: number;
      blogs: number;
      events: number;
      gallery: number;
      testimonials: number;
    };
    donations: { count: number; totalAmount: number };
    users: number;
  };
  recent: Array<{
    id: string;
    type: string;
    title: string;
    createdAt: string;
  }>;
  generatedAt: string;
  cached?: boolean;
  error?: string;
}

export function DashboardOverview() {
  const [data, setData] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/summary", { cache: "no-store" });
        const json: SummaryResponse = await res.json();
        if (!json.success)
          throw new Error(json.error || "Failed to load summary");
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 30000); // refresh every 30s
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const shimmer = "animate-pulse bg-slate-200 dark:bg-slate-800";

  return (
    <AnimatedSection>
      <div className="space-y-8">
        <header className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Dashboard Overview
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Ringkasan singkat aktivitas & konten terbaru.
            </p>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-500 flex flex-col items-end">
            <span>
              Last update:{" "}
              {data ? new Date(data.generatedAt).toLocaleTimeString() : "--"}
            </span>
            {data?.cached && (
              <span className="text-[10px] text-amber-600 dark:text-amber-400">
                cached
              </span>
            )}
          </div>
        </header>

        {error && (
          <div className="p-4 rounded-lg border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/30 text-sm text-red-700 dark:text-red-300">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  setData(null);
                }}
                className="px-3 py-1 text-xs rounded-md bg-red-600 text-white hover:bg-red-500"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Key metrics */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            label="Total Content"
            value={
              data
                ? data.stats.content.news +
                  data.stats.content.blogs +
                  data.stats.content.events
                : 0
            }
            loading={loading}
          />
          <SummaryCard
            label="Total Donations"
            value={
              data
                ? data.stats.donations.totalAmount.toLocaleString("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                  })
                : "Rp 0"
            }
            loading={loading}
          />
          <SummaryCard
            label="Total Users"
            value={data ? data.stats.users : 0}
            loading={loading}
          />
          <SummaryCard
            label="Testimonials"
            value={data ? data.stats.content.testimonials : 0}
            loading={loading}
          />
        </div>

        {/* Recent items */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 bg-white/60 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-lg font-semibold mb-4">Aktivitas Terbaru</h2>
            <div className="space-y-3">
              {loading && !data && (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className={`h-10 rounded-md ${shimmer}`} />
                  ))}
                </div>
              )}
              {data && data.recent.length === 0 && (
                <p className="text-sm text-slate-500">Belum ada aktivitas.</p>
              )}
              {data &&
                data.recent.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
                  >
                    <span className="text-base font-semibold">
                      {item.type === "news"
                        ? "📰"
                        : item.type === "blog"
                        ? "📝"
                        : "📅"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {item.title}
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(item.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="bg-white/60 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-lg font-semibold mb-4">Ringkasan</h2>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span>News</span>
                <span>{data?.stats.content.news ?? "-"}</span>
              </li>
              <li className="flex justify-between">
                <span>Blogs</span>
                <span>{data?.stats.content.blogs ?? "-"}</span>
              </li>
              <li className="flex justify-between">
                <span>Events</span>
                <span>{data?.stats.content.events ?? "-"}</span>
              </li>
              <li className="flex justify-between">
                <span>Gallery Items</span>
                <span>{data?.stats.content.gallery ?? "-"}</span>
              </li>
              <li className="flex justify-between">
                <span>Donations</span>
                <span>{data?.stats.donations.count ?? "-"}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
