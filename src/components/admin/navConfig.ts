export interface AdminNavItem {
  label: string;
  href: string;
  icon?: string; // symbolic key for future icon mapping
}

export const adminNavItems: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "dashboard" },
  { label: "News", href: "/admin/news", icon: "news" },
  { label: "Gallery", href: "/admin/gallery", icon: "gallery" },
  { label: "Events", href: "/admin/events", icon: "events" },
  { label: "Testimonials", href: "/admin/testimonials", icon: "testimonials" },
  { label: "Donasi", href: "/admin/donations", icon: "donations" },
  { label: "Campaigns", href: "/admin/campaigns", icon: "campaigns" },
  { label: "Blog", href: "/admin/blog", icon: "blog" },
  { label: "Profile Settings", href: "/admin/profile", icon: "profile" },
];
