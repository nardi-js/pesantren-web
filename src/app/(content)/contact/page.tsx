import type { Metadata } from "next";
import ContactForm from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Hubungi Kami",
  description: "Formulir kontak, lokasi, dan informasi komunikasi pesantren.",
};

export default function ContactPage() {
  return (
    <div className="flex flex-col islamic-pattern">
      <Hero />
      <ContactSection />
      <WhatsAppFloating />
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
          Hubungi Kami
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto font-medium animate-fade-up animation-delay-100 leading-relaxed">
          Kami siap membantu, silakan kirim pesan atau hubungi kontak resmi di
          bawah
        </p>
      </div>
    </section>
  );
}

function ContactSection() {
  return (
    <section className="section-base py-20 -mt-8">
      <div className="app-container grid lg:grid-cols-[1fr_420px] gap-14 items-start">
        <div className="space-y-10 animate-fade-up">
          <div className="space-y-6">
            <h2 className="heading-sm md:heading-md">Form Kontak</h2>
            <p className="text-soft max-w-prose">
              Silakan isi formulir berikut untuk pertanyaan, saran, kolaborasi,
              atau informasi pendaftaran. Kami akan membalas secepatnya.
            </p>
          </div>
          <ContactForm />
        </div>

        <aside className="space-y-10 animate-fade-up animation-delay-100">
          {/* Lokasi */}
          <div className="rounded-2xl surface-card elevated p-6 space-y-5">
            <h3 className="text-sm font-semibold tracking-wide uppercase text-[hsl(var(--foreground-muted))]">
              Lokasi
            </h3>
            <div className="overflow-hidden rounded-xl aspect-video ring-1 ring-[hsl(var(--border))]">
              <iframe
                title="Lokasi Pesantren"
                className="w-full h-full"
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1982.4517268207744!2d107.3853!3d-6.6412!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMzgnMjguMyJTIDEwN8KwMjMnMDcuMSJF!5e0!3m2!1sen!2sid!4v0000000000000"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>

          {/* Kontak */}
          <div className="rounded-2xl surface-card elevated p-6 space-y-4">
            <h3 className="text-sm font-semibold tracking-wide uppercase text-[hsl(var(--foreground-muted))]">
              Kontak
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <strong>Email:</strong>{" "}
                <a
                  href="mailto:iebs.gcni@gmail.com"
                  className="text-sky-600 dark:text-sky-400 hover:underline"
                >
                  iebs.gcni@gmail.com
                </a>
              </li>
              <li>
                <strong>Instagram:</strong>{" "}
                <a
                  href="https://instagram.com/pm.gcni_iebs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-600 dark:text-pink-400 hover:underline"
                >
                  @pm.gcni_iebs
                </a>
              </li>
              <li>
                <strong>YouTube:</strong>{" "}
                <a
                  href="https://youtube.com/@GCNI_TV"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-600 dark:text-red-400 hover:underline"
                >
                  GCNI_TV
                </a>
              </li>
              <li>
                <strong>TikTok:</strong>{" "}
                <a
                  href="https://www.tiktok.com/@gcni_tv"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black dark:text-white hover:underline"
                >
                  @gcni_tv
                </a>
              </li>
              <li>
                <strong>Alamat:</strong> Kampung Tegalsapi, Neglasari, Kec.
                Darangdan, Kabupaten Purwakarta, Jawa Barat 41163, Indonesia
              </li>
              <li>
                <strong>Jam Layanan:</strong> 08:00 - 16:00 WIB
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}

function WhatsAppFloating() {
  return (
    <a
      href="https://wa.me/6281234567890?text=Assalamu'alaikum%2C%20saya%20ingin%20bertanya%20mengenai%20pesantren"
      target="_blank"
      rel="noopener"
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full px-5 py-3 bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-green-300"
      aria-label="Chat WhatsApp"
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.04 2c-5.52 0-10 4.46-10 9.98 0 1.76.46 3.46 1.34 4.98L2 22l5.25-1.36c1.46.8 3.1 1.22 4.78 1.22h.01c5.52 0 10-4.46 10-9.98 0-2.67-1.05-5.18-2.96-7.07A9.93 9.93 0 0 0 12.04 2Zm5.72 14.48c-.24.68-1.36 1.3-1.88 1.38-.48.07-1.08.1-1.74-.11-.4-.13-.92-.3-1.59-.59-2.8-1.22-4.62-4.07-4.76-4.26-.14-.19-1.14-1.52-1.14-2.9 0-1.38.72-2.05.98-2.33.26-.28.58-.35.78-.35.2 0 .39.01.56.01.18.01.42-.07.66.5.24.58.82 2 .89 2.15.07.15.12.32.02.51-.1.19-.15.31-.3.48-.15.17-.31.38-.44.51-.15.15-.3.32-.13.63.18.31.78 1.29 1.67 2.08 1.15 1.02 2.1 1.34 2.41 1.49.31.15.49.13.67-.08.18-.2.77-.9.97-1.21.2-.31.41-.26.69-.16.28.1 1.79.84 2.09.99.3.15.5.23.57.36.07.13.07.75-.17 1.43Z" />
      </svg>
      <span className="font-semibold text-sm">WhatsApp</span>
    </a>
  );
}
