import type { Metadata } from "next";
import "../globals.css";
import { Providers } from "../../components/Providers";
import SiteLayout from "../../components/SiteLayout";

export const metadata: Metadata = {};

export default function ContentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <SiteLayout>{children}</SiteLayout>
    </Providers>
  );
}
