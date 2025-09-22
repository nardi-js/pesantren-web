import Container from "./Container";
import Link from "next/link";
import { EnvelopeIcon } from "@heroicons/react/24/solid";
import { InstagramIcon, TiktokIcon, YoutubeIcon } from "./YourCustomIcon";


const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/profile", label: "Profile" },
  { href: "/gallery", label: "Gallery" },
  { href: "/news", label: "News" },
  { href: "/blog", label: "Blog" },
  { href: "/events", label: "Events" },
  { href: "/testimonials", label: "Testimonials" },
  { href: "/contact", label: "Contact" },
  { href: "/donate", label: "Donate" },
];

export function Footer() {
  return (
    <footer className="mt-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] dark:opacity-40 [background-size:48px_48px] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-sky-900 via-sky-950 to-black dark:from-slate-900 dark:via-slate-950 dark:to-black" />

      <Container className="relative py-20 grid gap-12 md:grid-cols-4 text-[hsl(var(--foreground-on-dark))]">
        {/* Logo + Deskripsi */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-400 via-sky-500 to-sky-600 flex items-center justify-center text-white font-bold text-xl shadow-lg ring-1 ring-sky-300/40">
              P
            </div>
            <h3 className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-sky-200 to-emerald-200">
              Pesantren Modern
            </h3>
          </div>
          <p className="text-white/70 leading-relaxed text-balance mb-6 max-w-sm">
            Mencetak generasi Qur&apos;ani yang berkarakter, berilmu, dan
            berakhlak mulia untuk masa depan yang cerah.
          </p>

          {/* Social Media */}
          <div className="flex gap-4">
            {/* Gmail */}
            <a
              href="mailto:iebs.gcni@gmail.com"
              className="w-10 h-10 flex items-center justify-center"
              aria-label="Email"
            >
              <EnvelopeIcon className="h-7 w-7 text-red-500" />
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com/pm.gcni_iebs"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-10 h-10 flex items-center justify-center"
            >
              <InstagramIcon className="h-7 w-7 text-pink-500" />
            </a>

            {/* YouTube */}
            <a
              href="https://youtube.com/@GCNI_TV"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="w-10 h-10 flex items-center justify-center"
            >
              <YoutubeIcon className="h-7 w-7 text-red-600" />
            </a>

            {/* TikTok */}
            <a
              href="https://www.tiktok.com/@gcni_tv"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="w-10 h-10 flex items-center justify-center"
            >
              <TiktokIcon className="h-7 w-7 text-black dark:text-white" />
            </a>
          </div>
        </div>

        {/* Menu Utama */}
        <div>
          <h4 className="font-bold mb-6 text-lg text-white/90">Menu Utama</h4>
          <ul className="space-y-3">
            {quickLinks.slice(0, 5).map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-white/70 hover:text-sky-300 transition-colors font-medium"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Informasi */}
        <div>
          <h4 className="font-bold mb-6 text-lg text-white/90">Informasi</h4>
          <ul className="space-y-3">
            {quickLinks.slice(5).map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-white/70 hover:text-sky-300 transition-colors font-medium"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Kontak Kami */}
        <div>
          <h4 className="font-bold mb-6 text-lg text-white/90">Kontak Kami</h4>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-gradient-to-br from-sky-500 to-sky-700 rounded flex-shrink-0 mt-0.5"></div>
              <p className="text-white/70 leading-relaxed">
                Kampung Tegalsapi, Neglasari, Kec. Darangdan, Kabupaten
                Purwakarta, Jawa Barat 41163, Indonesia
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded flex-shrink-0"></div>
              <a
                href="mailto:iebs.gcni@gmail.com"
                className="text-white/70 hover:text-sky-300 transition-colors"
              >
                iebs.gcni@gmail.com
              </a>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-gradient-to-br from-orange-400 to-orange-600 rounded flex-shrink-0"></div>
              <a
                href="tel:+62123456789"
                className="text-white/70 hover:text-sky-300 transition-colors"
              >
                +62 123 456 789
              </a>
            </div>
          </div>
        </div>
      </Container>

      {/* Bawah Footer */}
      <div className="relative border-t border-white/10">
        <Container className="py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-white/60">
          <p className="text-center md:text-left">
            &copy; {new Date().getFullYear()} Pesantren Modern. All rights
            reserved.
          </p>
          <div className="flex items-center gap-4 text-sm">
            <Link
              href="/privacy"
              className="hover:text-sky-300 transition-colors"
            >
              Privacy Policy
            </Link>
            <span>•</span>
            <Link
              href="/terms"
              className="hover:text-sky-300 transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </Container>
      </div>
    </footer>
  );
}

export default Footer;
