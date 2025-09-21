import Hero from "../components/Hero";
import { NewsHighlight } from "../components/NewsHighlight";
import GalleryPreview from "../components/GalleryPreview";
import TestimonialsCarousel from "../components/TestimonialsCarousel";
import SiteLayout from "@/components/SiteLayout";
import Providers from "@/components/Providers";

export default function Home() {
  return (
    <Providers>
      <SiteLayout>
        <main className="flex flex-col islamic-pattern">
          <Hero
            videoUrl={
              "https://media.istockphoto.com/id/1492119155/video/aerial-view-of-the-olympos-beach-in-antalya-aerial-view-of-the-cirali-beach-at-mediterranean.mp4?s=mp4-640x640-is&k=20&c=P1tab7dvkVpi060Ll7JdgmzA1sE225xZej0g-IyCWF8="
            }
          />
          <NewsHighlight />
          <GalleryPreview />
          <TestimonialsCarousel />
        </main>
      </SiteLayout>
    </Providers>
  );
}
