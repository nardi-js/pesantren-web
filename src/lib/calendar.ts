import { EventItem } from "@/data/events";

// Generate Google Calendar event creation URL
export function googleCalendarUrl(event: EventItem) {
  const start = toDateTimeUTC(event.date, event.time);
  // Assume 2 hour duration default
  const endDate = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const fmt = (d: Date) =>
    d
      .toISOString()
      .replace(/[-:]|\.\d{3}/g, "")
      .slice(0, 15) + "Z";
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    details: event.description,
    location: event.location,
    dates: `${fmt(start)}/${fmt(endDate)}`,
  });
  return `https://www.google.com/calendar/render?${params.toString()}`;
}

// Create ICS file content (VCALENDAR)
export function generateICS(event: EventItem) {
  const uid = `${event.slug}@pesantren.local`;
  const dtstamp = new Date();
  const start = toDateTimeUTC(event.date, event.time);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const fmt = (d: Date) =>
    d
      .toISOString()
      .replace(/[-:]|\.\d{3}/g, "")
      .slice(0, 15) + "Z";

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Pesantren Web//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${fmt(dtstamp)}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${escapeICS(event.title)}`,
    `DESCRIPTION:${escapeICS(event.description)}`,
    `LOCATION:${escapeICS(event.location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return ics;
}

export function downloadICS(event: EventItem) {
  const blob = new Blob([generateICS(event)], {
    type: "text/calendar;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${event.slug}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function toDateTimeUTC(date: string, time: string) {
  // Interpret input as local then convert to UTC
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  return new Date(Date.UTC(y, m - 1, d, hh, mm));
}

function escapeICS(text: string) {
  return text.replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\n/g, "\\n");
}

export function whatsappShareUrl(event: EventItem) {
  const base = "https://wa.me/?text=";
  const text = `${event.title}%0A${encodeURIComponent(
    event.description
  )}%0A${encodeURIComponent(window.location.href)}`;
  return base + text;
}
