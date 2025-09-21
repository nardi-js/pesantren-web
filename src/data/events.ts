export interface EventItem {
  id: string;
  slug: string;
  title: string;
  category: string; // Kajian, Olahraga, Seminar, dll
  date: string; // ISO date (yyyy-mm-dd)
  time: string; // HH:MM (24h)
  location: string;
  description: string;
  image: string;
  tags?: string[];
}

export const EVENTS: EventItem[] = [
  {
    id: "1",
    slug: "kajian-subuh-rutin",
    title: "Kajian Subuh Rutin: Tafsir Juz Amma",
    category: "Kajian",
    date: "2025-03-20",
    time: "05:15",
    location: "Masjid Utama",
    description:
      "Kajian tafsir mendalam berfokus pada juz Amma dengan metode tematik dan tadabbur.",
    image: "https://source.unsplash.com/600x400/?mosque,light",
    tags: ["Tafsir", "Rutin"],
  },
  {
    id: "2",
    slug: "latihan-futsal-santri",
    title: "Latihan Futsal Santri Pekanan",
    category: "Olahraga",
    date: "2025-03-22",
    time: "16:00",
    location: "Lapangan Serbaguna",
    description:
      "Pembinaan fisik dan sportivitas melalui latihan futsal terstruktur untuk santri tingkat Tsanawiyah.",
    image: "https://source.unsplash.com/600x400/?futsal,sport",
    tags: ["Sport", "Pembinaan"],
  },
  {
    id: "3",
    slug: "seminar-motivasi-prestasi",
    title: "Seminar Motivasi Prestasi Akademik",
    category: "Seminar",
    date: "2025-03-25",
    time: "09:00",
    location: "Aula Pesantren",
    description:
      "Sesi motivasi dan strategi belajar efektif menghadapi ujian akhir tahun.",
    image: "https://source.unsplash.com/600x400/?seminar,education",
    tags: ["Motivasi", "Akademik"],
  },
  {
    id: "4",
    slug: "workshop-kaligrafi",
    title: "Workshop Kaligrafi Arab Dasar",
    category: "Workshop",
    date: "2025-04-02",
    time: "14:30",
    location: "Ruang Seni 1",
    description:
      "Belajar dasar-dasar khat naskhi dan rihani untuk pemula dengan bimbingan instruktur.",
    image: "https://source.unsplash.com/600x400/?calligraphy,arabic",
    tags: ["Seni", "Kaligrafi"],
  },
  {
    id: "5",
    slug: "bakti-sosial-ramadhan",
    title: "Bakti Sosial Ramadhan: Distribusi Paket Sembako",
    category: "Sosial",
    date: "2025-04-05",
    time: "08:00",
    location: "Desa Sukamulia",
    description:
      "Gerakan kepedulian sosial jelang Ramadhan melalui distribusi paket sembako untuk warga prasejahtera.",
    image: "https://source.unsplash.com/600x400/?charity,help",
    tags: ["Sosial", "Ramadhan"],
  },
];

export const EVENT_CATEGORIES = Array.from(
  new Set(EVENTS.map((e) => e.category))
);

export function findEvent(slug: string) {
  return EVENTS.find((e) => e.slug === slug);
}

export function upcomingEvents(reference: Date = new Date()) {
  const ref = reference.toISOString().split("T")[0];
  return EVENTS.filter((e) => e.date >= ref).sort((a, b) =>
    a.date.localeCompare(b.date)
  );
}
