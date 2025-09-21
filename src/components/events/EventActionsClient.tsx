"use client";
import Link from "next/link";
import { useCallback } from "react";
import { EventItem } from "@/data/events";
import {
  googleCalendarUrl,
  downloadICS,
  whatsappShareUrl,
} from "@/lib/calendar";

export default function EventActionsClient({ event }: { event: EventItem }) {
  const shareCurrent = useCallback(() => {
    if (navigator.share) {
      navigator
        .share({
          title: event.title,
          text: event.description,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
    }
  }, [event]);

  const shareWA = useCallback(() => {
    const url = whatsappShareUrl(event);
    window.open(url, "_blank", "noopener");
  }, [event]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl surface-card elevated p-6 space-y-5">
        <h3 className="text-sm font-semibold tracking-wide uppercase text-[hsl(var(--foreground-muted))]">
          Aksi
        </h3>
        <div className="flex flex-col gap-3">
          <Link
            href={googleCalendarUrl(event)}
            target="_blank"
            rel="noopener"
            className="btn-primary text-xs justify-center"
          >
            Tambah ke Google Calendar
          </Link>
          <button
            onClick={() => downloadICS(event)}
            className="btn-outline text-xs py-2.5"
          >
            Download ICS
          </button>
        </div>
      </div>
      <div className="rounded-2xl surface-card elevated p-6 space-y-4">
        <h3 className="text-sm font-semibold tracking-wide uppercase text-[hsl(var(--foreground-muted))]">
          Bagikan
        </h3>
        <div className="flex flex-col gap-3">
          <button onClick={shareCurrent} className="btn-primary text-xs py-2.5">
            Bagikan (Web Share)
          </button>
          <button onClick={shareWA} className="btn-outline text-xs py-2.5">
            Bagikan WhatsApp
          </button>
          <button
            onClick={() => navigator.clipboard.writeText(window.location.href)}
            className="text-[11px] text-sky-600 dark:text-sky-300 hover:underline self-start"
          >
            Copy Link
          </button>
        </div>
      </div>
    </div>
  );
}
