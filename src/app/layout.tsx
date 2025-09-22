import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ToastProvider";
// Global root layout now minimal; page-level chrome (navbar/footer) moved into (content)/layout.tsx

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Pesantren Modern",
    template: "%s | Pesantren Modern",
  },
  description:
    "Website resmi Pesantren Modern: profil, berita, kegiatan, galeri, dan informasi donasi.",
  metadataBase: new URL("https://www.pesantren-example.com"),
  openGraph: {
    title: "Pesantren Modern",
    description: "Mencetak generasi Qur'ani berakhlak mulia dan berilmu.",
    url: "https://www.pesantren-example.com",
    siteName: "Pesantren Modern",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@pesantren",
    creator: "@pesantren",
  },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'light') {
                    document.documentElement.classList.add('light');
                  } else {
                    document.documentElement.classList.remove('light');
                    if (!theme) {
                      localStorage.setItem('theme', 'dark');
                    }
                  }
                } catch (e) {
                  console.error('Theme init error:', e);
                  document.documentElement.classList.remove('light');
                }
              })()
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col`}
      >
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
