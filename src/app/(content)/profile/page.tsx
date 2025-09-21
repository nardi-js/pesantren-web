import type { Metadata } from "next";
import { AcademicCapIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { Section } from "../../../components/Section";

export const metadata: Metadata = {
  title: "Profil Pesantren",
  description:
    "Profil Pesantren Modern: visi, misi, tenaga pengajar, dan fasilitas.",
};

// Dummy data
const teachers = Array.from({ length: 6 }).map((_, i) => ({
  id: i + 1,
  name: `Ustadz/Ustadzah ${i + 1}`,
  role: i % 2 === 0 ? "Pengajar Tahfidz" : "Pengajar Akademik",
  photo: `https://i.pravatar.cc/150?img=${i + 10}`,
}));

const facilities = [
  {
    id: 1,
    title: "Perpustakaan",
    desc: "Koleksi buku islami & referensi modern.",
    img: "https://source.unsplash.com/400x300/?library",
  },
  {
    id: 2,
    title: "Lab Komputer",
    desc: "Fasilitas teknologi untuk pembelajaran digital.",
    img: "https://source.unsplash.com/400x300/?computer,lab",
  },
  {
    id: 3,
    title: "Masjid",
    desc: "Pusat kegiatan ibadah & pembinaan ruhiyah.",
    img: "https://source.unsplash.com/400x300/?mosque,interior",
  },
  {
    id: 4,
    title: "Asrama",
    desc: "Lingkungan tempat tinggal yang nyaman & teratur.",
    img: "https://source.unsplash.com/400x300/?dormitory",
  },
];

export default function ProfilePage() {
  return (
    <main className="flex flex-col w-full islamic-pattern">
      {/* Hero */}
      <section className="relative w-full h-[400px] md:h-[480px] overflow-hidden flex items-center justify-center bg-gradient-to-br from-sky-100 via-sky-200 to-emerald-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800">
        {/* Islamic Pattern Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-sky-500/10 to-emerald-500/10 dark:from-emerald-400/5 dark:via-sky-400/5 dark:to-emerald-400/5" />

        <div className="relative z-10 text-center px-6 max-w-4xl space-y-6 mt-20">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-emerald-600 via-sky-600 to-emerald-600 dark:from-emerald-400 dark:via-sky-400 dark:to-emerald-400 bg-clip-text text-transparent animate-fade-up">
            Profil Pesantren
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto font-medium animate-fade-up animation-delay-100 leading-relaxed">
            Mengenal lebih dekat visi, misi, pendidik dan fasilitas yang
            mendukung pembentukan generasi Qur&apos;ani
          </p>
        </div>
      </section>

      {/* About Us */}
      <Section variant="base" className="-mt-8">
        <div className="grid gap-12 md:gap-16 md:grid-cols-2 items-center">
          <div className="relative h-72 md:h-96 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-100 via-sky-100 to-emerald-100 dark:from-emerald-900/20 dark:via-sky-900/20 dark:to-emerald-900/20 border border-emerald-200/50 dark:border-emerald-700/30 animate-zoom-in">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-sky-500/10 to-emerald-500/10 dark:from-emerald-400/5 dark:via-sky-400/5 dark:to-emerald-400/5" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-2">
                <AcademicCapIcon className="w-16 h-16 text-emerald-600 dark:text-emerald-400 mx-auto" />
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  Santri Belajar
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-6 animate-fade-up">
            <h2 className="heading-sm md:heading-md text-[hsl(var(--foreground))]">
              Tentang Kami
            </h2>
            <p className="text-soft leading-relaxed text-base md:text-lg">
              Pesantren Modern didirikan pada tahun 2010 dengan komitmen
              mencetak generasi Qur&apos;ani yang berakhlak mulia, cerdas, dan
              siap bersaing di era global. Kami mengintegrasikan kurikulum
              diniyah, akademik modern, dan pengembangan karakter secara
              seimbang.
            </p>
            <p className="text-soft leading-relaxed text-base md:text-lg">
              Dengan pendekatan holistik, santri dibimbing untuk menguasai
              hafalan Al-Qur&apos;an, bahasa internasional, teknologi, serta
              soft skill kepemimpinan dan kewirausahaan.
            </p>
            <div className="surface-card rounded-lg p-5 grid gap-2 text-sm">
              <p>
                <span className="font-semibold">Didirikan:</span> 2010
              </p>
              <p>
                <span className="font-semibold">Moto:</span> Berilmu, Berakhlak,
                Berkhidmah
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Visi & Misi */}
      <Section variant="alt">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="group surface-card elevated hoverable p-8 rounded-xl relative overflow-hidden animate-fade-up">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg bg-sky-600/10 dark:bg-sky-400/10 flex items-center justify-center text-sky-600 dark:text-sky-400">
                <AcademicCapIcon className="h-7 w-7" />
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-lg tracking-tight">Visi</h3>
                <p className="text-soft text-sm leading-relaxed max-w-md">
                  Menjadi pesantren unggulan yang melahirkan generasi
                  berkarakter Qur&apos;ani, berilmu luas, dan berkontribusi bagi
                  peradaban.
                </p>
              </div>
            </div>
          </div>
          <div className="group surface-card elevated hoverable p-8 rounded-xl relative overflow-hidden animate-fade-up animation-delay-100">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg bg-sky-600/10 dark:bg-sky-400/10 flex items-center justify-center text-sky-600 dark:text-sky-400">
                <SparklesIcon className="h-7 w-7" />
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-lg tracking-tight">Misi</h3>
                <p className="text-soft text-sm leading-relaxed max-w-md">
                  1) Menanamkan kecintaan Al-Qur&apos;an. 2) Mengembangkan
                  kompetensi akademik & teknologi. 3) Membentuk kepemimpinan dan
                  kemandirian. 4) Menguatkan karakter akhlakul karimah.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Teachers */}
      <Section variant="base">
        <div className="mb-14 text-center md:text-left">
          <h2 className="heading-sm md:heading-md mb-3">Tenaga Pengajar</h2>
          <p className="text-soft max-w-2xl md:text-base mx-auto md:mx-0">
            Para pembina dan pengajar berdedikasi tinggi dalam mendampingi
            proses tumbuh kembang santri.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {teachers.map((t, i) => (
            <div
              key={t.id}
              className={`surface-card elevated hoverable rounded-xl transition-all p-5 flex flex-col items-center text-center animate-fade-up ${
                i % 4 === 1
                  ? "animation-delay-100"
                  : i % 4 === 2
                  ? "animation-delay-200"
                  : i % 4 === 3
                  ? "animation-delay-200"
                  : "animation-delay-0"
              }`}
            >
              <div className="relative h-24 w-24 rounded-full overflow-hidden shadow ring-4 ring-sky-100 dark:ring-sky-900/40 mb-4 bg-gradient-to-br from-emerald-100 via-sky-100 to-emerald-100 dark:from-emerald-900/20 dark:via-sky-900/20 dark:to-emerald-900/20 flex items-center justify-center">
                <AcademicCapIcon className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-semibold text-sm tracking-tight text-[hsl(var(--foreground))]">
                {t.name}
              </h3>
              <p className="text-xs text-soft mt-1 font-medium">{t.role}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Facilities */}
      <Section variant="muted">
        <div className="mb-14 text-center md:text-left">
          <h2 className="heading-sm md:heading-md mb-3">Fasilitas</h2>
          <p className="text-soft max-w-2xl md:text-base mx-auto md:mx-0">
            Sarana pendukung pembelajaran dan pengembangan karakter santri.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {facilities.map((f, i) => (
            <div
              key={f.id}
              className={`surface-card elevated hoverable rounded-xl overflow-hidden transition-all animate-zoom-in ${
                i % 4 === 1
                  ? "animation-delay-100"
                  : i % 4 === 2
                  ? "animation-delay-200"
                  : i % 4 === 3
                  ? "animation-delay-200"
                  : "animation-delay-0"
              }`}
            >
              <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-emerald-100 via-sky-100 to-emerald-100 dark:from-emerald-900/20 dark:via-sky-900/20 dark:to-emerald-900/20 flex items-center justify-center">
                <SparklesIcon className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="p-5 space-y-2">
                <h3 className="font-semibold text-sm tracking-wide text-[hsl(var(--foreground))]">
                  {f.title}
                </h3>
                <p className="text-xs text-soft leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </main>
  );
}
