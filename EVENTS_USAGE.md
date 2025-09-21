# Events Feature Usage Guide

## Struktur Data

Semua event ada di file `src/data/events.ts` dengan interface:

```ts
interface EventItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  date: string; // format: YYYY-MM-DD
  time: string; // format: HH:MM (24 jam)
  location: string;
  description: string;
  image: string; // URL gambar
  tags?: string[];
}
```

Tambahkan event baru cukup push objek baru ke array `EVENTS` (urutkan berdasarkan tanggal agar lebih rapi—sorting runtime juga sudah dilakukan untuk upcoming highlight).

## Menambah Event

1. Buka `src/data/events.ts`
2. Tambahkan objek baru:

```ts
{
  id: "6",
  slug: "nama-slug-khusus",
  title: "Judul Event",
  category: "Seminar", // atau buat kategori baru
  date: "2025-05-10",
  time: "09:00",
  location: "Aula Utama",
  description: "Deskripsi singkat informatif.",
  image: "https://source.unsplash.com/600x400/?education",
  tags: ["Akademik", "Umum"],
},
```

3. Pastikan `slug` unik.
4. Done—Next.js akan statically generate detail page melalui `generateStaticParams`.

## Kategori

`EVENT_CATEGORIES` diekstrak otomatis dari array. Tidak perlu daftar manual. Jika ingin membatasi ke whitelist tertentu, bisa ganti implementasi menjadi array statis:

```ts
export const EVENT_CATEGORIES = [
  "Kajian",
  "Seminar",
  "Workshop",
  "Sosial",
  "Olahraga",
];
```

## Filtering di UI

Filter yang tersedia pada `EventsClient`:

- Kategori (dropdown)
- Tanggal spesifik (exact match)
- Pencarian judul (case-insensitive substring)

Jika ingin menambah filter rentang tanggal:

```ts
// Ganti state date menjadi { from: string; to: string }
// Lalu di filter:
if (filters.from && e.date < filters.from) return false;
if (filters.to && e.date > filters.to) return false;
```

## Upcoming Highlight

Digunakan `upcomingEvents()` yang menyaring event `e.date >= today`. Jika ingin highlight berdasarkan event terdekat yang belum lewat dan masih dalam jam mendatang (same-day time), modifikasi fungsi:

```ts
export function upcomingEvents(reference: Date = new Date()) {
  const today = reference.toISOString().split("T")[0];
  return EVENTS.filter((e) => {
    if (e.date > today) return true;
    if (e.date === today) return e.time >= reference.toTimeString().slice(0, 5);
    return false;
  }).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
}
```

## Detail Page

Lokasi: `src/app/events/[slug]/page.tsx` menampilkan:

- Hero (gambar + overlay + tags + meta)
- Deskripsi + section tambahan (prose + Tailwind Typography)
- Placeholder map container
- Sidebar: aksi (Google Calendar, ICS download), share, daftar event lain (related ringan)

Untuk menambahkan peta sebenarnya (misal Google Maps embed):

```tsx
<iframe
  className="w-full aspect-video rounded-xl ring-1 ring-[hsl(var(--border))]"
  loading="lazy"
  allowFullScreen
  referrerPolicy="no-referrer-when-downgrade"
  src="https://www.google.com/maps/embed?pb=..."
/>
```

Pastikan ganti placeholder div.

## Add to Calendar

Helper di `src/lib/calendar.ts`:

- `googleCalendarUrl(event)` → Buka tab baru Google Calendar
- `downloadICS(event)` → Unduh file `.ics`
  Durasi default = 2 jam. Ubah dengan menambah properti `durationMinutes` di event (bisa opsional) lalu adjust helper.

## WhatsApp / Share

Menggunakan:

- Web Share API (fallback ke copy link)
- WhatsApp share via `whatsappShareUrl(event)`

Jika ingin share text lebih kaya (misal format multiline rapi):

```ts
const message = [
  event.title,
  "",
  event.description,
  "",
  `Tanggal: ${event.date} ${event.time} WIB`,
  `Lokasi: ${event.location}`,
  window.location.href,
].join("\n");
```

Lalu lakukan `encodeURIComponent(message)`.

## Prayer Times (Dummy)

Sekarang hard-coded di `EventsClient`. Integrasi API (misal Aladhan):

```ts
const res = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=Bandung&country=Indonesia&method=2`);
const data = await res.json();
setPrayerTimes([
  { label: 'Subuh', time: data.data.timings.Fajr.slice(0,5) },
  ...
]);
```

Tempatkan logic di client dan tambahkan state `loading`. Cache sederhana bisa pakai sessionStorage.

## Styling & Theming

- Gunakan utility seperti `surface-card`, `elevated`, `hoverable`, `heading-*` (sudah dipakai di code yang ada).
- Animasi memakai kelas `animate-fade-up` + optional `animation-delay-*`.
- Tambah delay lain tinggal definisikan di CSS util Anda jika belum ada.

## SEO & Metadata

- Listing page pakai metadata statis di `events/page.tsx`.
- Detail page gunakan `generateMetadata` → fallback title jika tidak ditemukan.
- Bisa tambahkan `alternates.canonical` atau `openGraph.url` jika domain final sudah diketahui.

## Menjadikan Data Dinamis (Opsional)

Jika nanti mau load dari database / API:

1. Ganti `EVENTS` menjadi fetch di server component (listing & detail) atau gunakan Route Handler `/api/events`.
2. Untuk static generation: gunakan `revalidate` pada file route.
3. Pastikan slug tetap stabil (disimpan di DB).

## Error Handling

Saat slug tidak ditemukan → `notFound()` memicu halaman 404 bawaan Next.
Bisa kustom dengan membuat `src/app/not-found.tsx`.

## Ekstensi Potensial

- Pagination untuk banyak event.
- Grouping by month.
- i18n (tanggal format lokal + terjemahan label).
- RSVP/registrasi (form + email).
- Integrasi kalender internal ICS aggregator.

## Ringkas Alur File

- Data: `src/data/events.ts`
- Listing: `src/app/events/page.tsx`
- Client interaktif: `src/components/events/EventsClient.tsx`
- Detail: `src/app/events/[slug]/page.tsx`
- Helpers: `src/lib/calendar.ts`

Jika ada langkah yang ingin diperdalam atau diubah (misal durasi event dinamis, map interaktif dengan Leaflet), beri tahu dan akan ditambahkan.
