import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { ToastProvider } from "@/components/admin/ToastProvider";

export const metadata: Metadata = { title: "Admin UI" };

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminShell>
      <ToastProvider>{children}</ToastProvider>
    </AdminShell>
  );
}
