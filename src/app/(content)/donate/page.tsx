import type { Metadata } from "next";
import CampaignsList from "./CampaignsList";

export const metadata: Metadata = {
  title: "Donasi & Dukungan",
  description:
    "Salurkan donasi untuk mendukung operasional dan program pendidikan pesantren.",
};

export default function DonatePage() {
  return (
    <div className="flex flex-col islamic-pattern">
      <Hero />
      <CampaignsList />
      <DonationContent />
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
          Donasi & Dukungan
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto font-medium animate-fade-up animation-delay-100 leading-relaxed">
          Setiap kontribusi Anda membantu menjaga keberlangsungan pembinaan,
          pendidikan, dan dakwah pesantren
        </p>
        <div className="animate-fade-up animation-delay-200">
          <a
            href="#donasi"
            className="inline-flex items-center rounded-full bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-500 hover:to-emerald-500 text-white font-semibold text-sm px-8 py-3 shadow-lg hover:shadow-xl transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60"
          >
            Donasi Sekarang
          </a>
        </div>
      </div>
    </section>
  );
}

function DonationContent() {
  return (
    <section id="donasi" className="section-base py-16">
      <div className="app-container space-y-20">
        <DonationMethods />
        <ProgressSection />
      </div>
    </section>
  );
}

function DonationMethods() {
  return (
    <div className="grid lg:grid-cols-3 gap-10 animate-fade-up">
      <div className="rounded-2xl surface-card elevated p-7 flex flex-col gap-5">
        <h2 className="heading-xs font-semibold">Rekening Bank</h2>
        <ul className="text-sm space-y-3">
          <li>
            <strong>BANK SYARIAH A:</strong>
            <br /> 1234 5678 901 a.n. Yayasan Pesantren
          </li>
          <li>
            <strong>BANK SYARIAH B:</strong>
            <br /> 9876 5432 109 a.n. Yayasan Pesantren
          </li>
          <li>
            <strong>BMT / Koperasi:</strong>
            <br /> 5566 7788 990 a.n. Yayasan Pesantren
          </li>
        </ul>
        <p className="text-[11px] text-[hsl(var(--foreground-muted))]">
          Harap sertakan berita transfer:{" "}
          <code className="px-1 rounded bg-[hsl(var(--surface-alt))]">
            infaq pendidikan
          </code>
        </p>
      </div>
      <div className="rounded-2xl surface-card elevated p-7 flex flex-col gap-5">
        <h2 className="heading-xs font-semibold">QR Code / E-Wallet</h2>
        <div className="flex items-center justify-center">
          <div className="h-40 w-40 rounded-xl bg-[hsl(var(--surface-alt))] ring-1 ring-[hsl(var(--border))] flex items-center justify-center text-[10px] text-[hsl(var(--foreground-muted))]">
            QR Placeholder
          </div>
        </div>
        <ul className="text-sm space-y-2">
          <li>OVO / GoPay / Dana (Hubungi admin)</li>
          <li>Syariah e-wallet coming soon</li>
        </ul>
        <a
          href="#konfirmasi"
          className="text-xs font-semibold text-sky-600 dark:text-sky-300 hover:underline self-start"
        >
          Cara konfirmasi
        </a>
      </div>
      <div className="rounded-2xl surface-card elevated p-7 flex flex-col gap-6">
        <h2 className="heading-xs font-semibold">Program Utama</h2>
        <div className="space-y-4 text-sm">
          <ProgramItem
            title="Beasiswa Santri"
            desc="Dukung santri kurang mampu untuk terus belajar."
            progress={65}
          />
          <ProgramItem
            title="Pembangunan Asrama"
            desc="Renovasi & perluasan kapasitas tempat tinggal."
            progress={42}
          />
          <ProgramItem
            title="Perpustakaan"
            desc="Pengadaan buku & digitalisasi koleksi."
            progress={78}
          />
        </div>
      </div>
    </div>
  );
}

interface ProgramItemProps {
  title: string;
  desc: string;
  progress: number;
}
function ProgramItem({ title, desc, progress }: ProgramItemProps) {
  // Map allowed progress values to width classes to avoid inline style usage
  const WIDTH_CLASS: Record<number, string> = {
    0: "w-[0%]",
    42: "w-[42%]",
    65: "w-[65%]",
    78: "w-[78%]",
  };
  const widthClass = WIDTH_CLASS[progress] ?? "w-[0%]";
  return (
    <div className="p-4 rounded-xl bg-[hsl(var(--surface-alt))] ring-1 ring-[hsl(var(--border))] space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-sm">{title}</h3>
          <p className="text-[12px] text-[hsl(var(--foreground-soft))] leading-relaxed">
            {desc}
          </p>
        </div>
        <span className="text-[11px] font-semibold text-sky-600 dark:text-sky-300">
          {progress}%
        </span>
      </div>
      <div className="h-2 rounded-full bg-[hsl(var(--surface))] overflow-hidden ring-1 ring-[hsl(var(--border))]">
        <div
          className={`h-full bg-gradient-to-r from-sky-500 to-emerald-500 ${widthClass}`}
        />
      </div>
    </div>
  );
}

function ProgressSection() {
  // Static donor data (avoid runtime randomness for deterministic build & allow utility classes)
  const donors = [
    { name: "Donatur 1", amount: 750_000, ts: Date.now() - 0 * 86400000 },
    { name: "Donatur 2", amount: 500_000, ts: Date.now() - 1 * 86400000 },
    { name: "Donatur 3", amount: 1_000_000, ts: Date.now() - 2 * 86400000 },
    { name: "Donatur 4", amount: 600_000, ts: Date.now() - 3 * 86400000 },
    { name: "Donatur 5", amount: 450_000, ts: Date.now() - 4 * 86400000 },
    { name: "Donatur 6", amount: 300_000, ts: Date.now() - 5 * 86400000 },
    { name: "Donatur 7", amount: 200_000, ts: Date.now() - 6 * 86400000 },
  ];
  const total = donors.reduce((a, b) => a + b.amount, 0);
  const goal = 10_000_000; // Example goal
  const percent = Math.min(100, Math.round((total / goal) * 100));
  const PERCENT_WIDTH_CLASS: Record<number, string> = {
    0: "w-[0%]",
    1: "w-[1%]",
    2: "w-[2%]",
    3: "w-[3%]",
    4: "w-[4%]",
    5: "w-[5%]",
    6: "w-[6%]",
    7: "w-[7%]",
    8: "w-[8%]",
    9: "w-[9%]",
    10: "w-[10%]",
    11: "w-[11%]",
    12: "w-[12%]",
    13: "w-[13%]",
    14: "w-[14%]",
    15: "w-[15%]",
    16: "w-[16%]",
    17: "w-[17%]",
    18: "w-[18%]",
    19: "w-[19%]",
    20: "w-[20%]",
    21: "w-[21%]",
    22: "w-[22%]",
    23: "w-[23%]",
    24: "w-[24%]",
    25: "w-[25%]",
    26: "w-[26%]",
    27: "w-[27%]",
    28: "w-[28%]",
    29: "w-[29%]",
    30: "w-[30%]",
    31: "w-[31%]",
    32: "w-[32%]",
    33: "w-[33%]",
    34: "w-[34%]",
    35: "w-[35%]",
    36: "w-[36%]",
    37: "w-[37%]",
    38: "w-[38%]",
    39: "w-[39%]",
    40: "w-[40%]",
    41: "w-[41%]",
    42: "w-[42%]",
    43: "w-[43%]",
    44: "w-[44%]",
    45: "w-[45%]",
    46: "w-[46%]",
    47: "w-[47%]",
    48: "w-[48%]",
    49: "w-[49%]",
    50: "w-[50%]",
    51: "w-[51%]",
    52: "w-[52%]",
    53: "w-[53%]",
    54: "w-[54%]",
    55: "w-[55%]",
    56: "w-[56%]",
    57: "w-[57%]",
    58: "w-[58%]",
    59: "w-[59%]",
    60: "w-[60%]",
    61: "w-[61%]",
    62: "w-[62%]",
    63: "w-[63%]",
    64: "w-[64%]",
    65: "w-[65%]",
    66: "w-[66%]",
    67: "w-[67%]",
    68: "w-[68%]",
    69: "w-[69%]",
    70: "w-[70%]",
    71: "w-[71%]",
    72: "w-[72%]",
    73: "w-[73%]",
    74: "w-[74%]",
    75: "w-[75%]",
    76: "w-[76%]",
    77: "w-[77%]",
    78: "w-[78%]",
    79: "w-[79%]",
    80: "w-[80%]",
    81: "w-[81%]",
    82: "w-[82%]",
    83: "w-[83%]",
    84: "w-[84%]",
    85: "w-[85%]",
    86: "w-[86%]",
    87: "w-[87%]",
    88: "w-[88%]",
    89: "w-[89%]",
    90: "w-[90%]",
    91: "w-[91%]",
    92: "w-[92%]",
    93: "w-[93%]",
    94: "w-[94%]",
    95: "w-[95%]",
    96: "w-[96%]",
    97: "w-[97%]",
    98: "w-[98%]",
    99: "w-[99%]",
    100: "w-[100%]",
  };
  const widthClass = PERCENT_WIDTH_CLASS[percent] ?? "w-[0%]";
  const delayClasses = [
    "animation-delay-0",
    "animation-delay-60",
    "animation-delay-120",
    "animation-delay-180",
    "animation-delay-240",
    "animation-delay-300",
    "animation-delay-360",
  ];
  return (
    <div className="space-y-10 animate-fade-up">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
        <div className="space-y-4 max-w-xl">
          <h2 className="heading-sm md:heading-md">Perkembangan Donasi</h2>
          <p className="text-soft text-sm leading-relaxed">
            Ringkasan kontribusi terbaru dan target penggalangan dana saat ini.
          </p>
        </div>
        <div className="rounded-2xl surface-card elevated p-6 flex flex-col gap-4 w-full md:w-80">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span>Terkumpul</span>
              <span className="text-sky-600 dark:text-sky-300 font-semibold">
                Rp {total.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="h-3 rounded-full bg-[hsl(var(--surface-alt))] overflow-hidden ring-1 ring-[hsl(var(--border))]">
              <div
                className={`h-full bg-gradient-to-r from-sky-500 via-sky-400 to-emerald-500 ${widthClass}`}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] font-semibold text-[hsl(var(--foreground-muted))]">
              <span>0</span>
              <span>Target: Rp {goal.toLocaleString("id-ID")}</span>
            </div>
          </div>
          <a href="#donasi" className="btn-primary text-xs justify-center">
            Dukung Sekarang
          </a>
        </div>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {donors.map((d, i) => (
          <div
            key={i}
            className={`rounded-xl surface-card elevated p-4 flex flex-col gap-2 text-sm animate-fade-up ${
              delayClasses[i] ?? ""
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{d.name}</span>
              <span className="text-[11px] text-[hsl(var(--foreground-soft))]">
                {new Date(d.ts).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "short",
                })}
              </span>
            </div>
            <span className="text-sky-600 dark:text-sky-300 font-semibold text-sm">
              Rp {d.amount.toLocaleString("id-ID")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
