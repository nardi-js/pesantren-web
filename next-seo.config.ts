import { DefaultSeoProps } from "next-seo";

const config: DefaultSeoProps = {
  titleTemplate: "%s | Pesantren Modern",
  defaultTitle: "Pesantren Modern",
  description:
    "Website resmi Pesantren Modern: profil, berita, kegiatan, galeri, dan informasi donasi.",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://www.pesantren-example.com",
    siteName: "Pesantren Modern",
  },
  twitter: {
    handle: "@pesantren",
    site: "@pesantren",
    cardType: "summary_large_image",
  },
  additionalMetaTags: [{ name: "theme-color", content: "#10b981" }],
};

export default config;
