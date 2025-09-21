"use client";
import { SummaryCard } from "@/components/admin/SummaryCard";
import { AnimatedSection } from "@/components/admin/AnimatedSection";
import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { AdminApi } from "@/lib/api";

// Define interfaces for our data
interface DashboardStats {
  content: {
    blog: { total: number; published: number; draft: number; views: number };
    news: { total: number; published: number; draft: number; views: number };
    events: {
      total: number;
      active: number;
      upcoming: number;
      past: number;
      registrations: number;
    };
    gallery: { total: number; albums: number; photos: number; views: number };
    testimonials: {
      total: number;
      approved: number;
      pending: number;
      featured: number;
    };
  };
  donations: {
    total: number;
    thisMonth: number;
    campaigns: number;
    activeCampaigns: number;
    donors: number;
    avgDonation: number;
  };
  users: {
    total: number;
    students: number;
    parents: number;
    staff: number;
    activeToday: number;
  };
  system: {
    storage: { used: number; total: number; unit: string };
    bandwidth: { used: number; total: number; unit: string };
    uptime: number;
  };
}

const recentActivities = [
  {
    type: "donation",
    message: "New donation received: Rp 500,000",
    time: "2 minutes ago",
    icon: "💰",
  },
  {
    type: "testimonial",
    message: "New testimonial pending approval",
    time: "15 minutes ago",
    icon: "💬",
  },
  {
    type: "event",
    message: "5 new registrations for Annual Conference",
    time: "1 hour ago",
    icon: "📅",
  },
  {
    type: "blog",
    message: "Blog post 'Islamic Education' published",
    time: "2 hours ago",
    icon: "📝",
  },
  {
    type: "user",
    message: "3 new parent accounts created",
    time: "4 hours ago",
    icon: "👥",
  },
];

const quickActions = [
  {
    label: "New Blog Post",
    href: "/admin/blog/new",
    icon: "📝",
    color: "bg-blue-600",
  },
  {
    label: "Create Event",
    href: "/admin/events/new",
    icon: "📅",
    color: "bg-green-600",
  },
  {
    label: "Add News",
    href: "/admin/news/new",
    icon: "📰",
    color: "bg-yellow-600",
  },
  {
    label: "New Gallery",
    href: "/admin/gallery/new",
    icon: "🖼️",
    color: "bg-purple-600",
  },
  {
    label: "View Donations",
    href: "/admin/donations",
    icon: "💰",
    color: "bg-emerald-600",
  },
  {
    label: "Manage Users",
    href: "/admin/users",
    icon: "👥",
    color: "bg-indigo-600",
  },
];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("7d");
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch data from all APIs in parallel
      const [eventsRes, galleryRes, testimonialsRes, donationsRes] =
        await Promise.all([
          AdminApi.getEvents(),
          AdminApi.getGallery(),
          AdminApi.getTestimonials(),
          AdminApi.getDonations(),
        ]);

      // Process events data
      const eventsData = eventsRes.success
        ? Array.isArray(eventsRes.data)
          ? eventsRes.data
          : (eventsRes.data as any)?.events ||
            (eventsRes.data as any)?.data ||
            []
        : [];
      const activeEvents = eventsData.filter(
        (e: any) => e.status === "active"
      ).length;
      const upcomingEvents = eventsData.filter(
        (e: any) => new Date(e.startDate) > new Date()
      ).length;
      const pastEvents = eventsData.filter(
        (e: any) => new Date(e.startDate) < new Date()
      ).length;
      const totalRegistrations = eventsData.reduce(
        (sum: number, e: any) => sum + (e.registered || 0),
        0
      );

      // Process gallery data
      const galleryData = galleryRes.success
        ? Array.isArray(galleryRes.data)
          ? galleryRes.data
          : (galleryRes.data as any)?.gallery ||
            (galleryRes.data as any)?.data ||
            []
        : [];
      const totalPhotos = galleryData.reduce(
        (sum: number, g: any) => sum + (g.imageCount || 0),
        0
      );

      // Process testimonials data
      const testimonialsData = testimonialsRes.success
        ? Array.isArray(testimonialsRes.data)
          ? testimonialsRes.data
          : (testimonialsRes.data as any)?.testimonials ||
            (testimonialsRes.data as any)?.data ||
            []
        : [];
      const approvedTestimonials = testimonialsData.filter(
        (t: any) => t.status === "approved"
      ).length;
      const pendingTestimonials = testimonialsData.filter(
        (t: any) => t.status === "pending"
      ).length;
      const featuredTestimonials = testimonialsData.filter(
        (t: any) => t.featured
      ).length;

      // Process donations data
      const donationsData = donationsRes.success
        ? Array.isArray(donationsRes.data)
          ? donationsRes.data
          : (donationsRes.data as any)?.donations ||
            (donationsRes.data as any)?.data ||
            []
        : [];
      const completedDonations = donationsData.filter(
        (d: any) => d.status === "completed"
      );
      const totalDonations = completedDonations.reduce(
        (sum: number, d: any) => sum + (d.amount || 0),
        0
      );
      const thisMonth = new Date();
      thisMonth.setDate(1);
      const monthlyDonations = completedDonations
        .filter((d: any) => new Date(d.donatedAt || d.createdAt) >= thisMonth)
        .reduce((sum: number, d: any) => sum + (d.amount || 0), 0);
      const avgDonation =
        completedDonations.length > 0
          ? totalDonations / completedDonations.length
          : 0;

      const dashboardStats: DashboardStats = {
        content: {
          blog: { total: 0, published: 0, draft: 0, views: 0 }, // Blog API not integrated yet
          news: { total: 0, published: 0, draft: 0, views: 0 }, // News API not integrated yet
          events: {
            total: eventsData.length,
            active: activeEvents,
            upcoming: upcomingEvents,
            past: pastEvents,
            registrations: totalRegistrations,
          },
          gallery: {
            total: galleryData.length,
            albums: galleryData.length,
            photos: totalPhotos,
            views: 0, // Views not tracked yet
          },
          testimonials: {
            total: testimonialsData.length,
            approved: approvedTestimonials,
            pending: pendingTestimonials,
            featured: featuredTestimonials,
          },
        },
        donations: {
          total: totalDonations,
          thisMonth: monthlyDonations,
          campaigns: 0, // Campaign API not integrated yet
          activeCampaigns: 0,
          donors: completedDonations.length,
          avgDonation: avgDonation,
        },
        users: {
          total: 0, // User API not integrated yet
          students: 0,
          parents: 0,
          staff: 0,
          activeToday: 0,
        },
        system: {
          storage: { used: 2.4, total: 10, unit: "GB" },
          bandwidth: { used: 45.2, total: 100, unit: "GB" },
          uptime: 99.8,
        },
      };

      setStats(dashboardStats);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch dashboard data";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Use stats if available, otherwise show loading
  const currentStats = stats || {
    content: {
      blog: { total: 0, published: 0, draft: 0, views: 0 },
      news: { total: 0, published: 0, draft: 0, views: 0 },
      events: { total: 0, active: 0, upcoming: 0, past: 0, registrations: 0 },
      gallery: { total: 0, albums: 0, photos: 0, views: 0 },
      testimonials: { total: 0, approved: 0, pending: 0, featured: 0 },
    },
    donations: {
      total: 0,
      thisMonth: 0,
      campaigns: 0,
      activeCampaigns: 0,
      donors: 0,
      avgDonation: 0,
    },
    users: { total: 0, students: 0, parents: 0, staff: 0, activeToday: 0 },
    system: {
      storage: { used: 0, total: 10, unit: "GB" },
      bandwidth: { used: 0, total: 100, unit: "GB" },
      uptime: 0,
    },
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculatePercentage = (used: number, total: number) => {
    return Math.round((used / total) * 100);
  };

  return (
    <AnimatedSection>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Dashboard Overview
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Monitor your pesantren&apos;s digital activities and performance
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
              aria-label="Time range"
            >
              <option value="1d">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 3 months</option>
            </select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            label="Total Content"
            value={
              currentStats.content.blog.total +
              currentStats.content.news.total +
              currentStats.content.events.total
            }
            loading={loading}
          />
          <SummaryCard
            label="Monthly Donations"
            value={formatCurrency(currentStats.donations.thisMonth)}
            loading={loading}
          />
          <SummaryCard
            label="Active Users"
            value={currentStats.users.activeToday}
            loading={loading}
          />
          <SummaryCard
            label="Total Views"
            value={(
              currentStats.content.blog.views +
              currentStats.content.news.views +
              currentStats.content.gallery.views
            ).toLocaleString()}
            loading={loading}
          />
        </div>

        {/* Content Overview */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="bg-white/60 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Content Overview
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-lg">📝</span>
                  <div>
                    <div className="font-medium">Blog Posts</div>
                    <div className="text-sm text-slate-500">
                      {currentStats.content.blog.published} published,{" "}
                      {currentStats.content.blog.draft} draft
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {currentStats.content.blog.total}
                  </div>
                  <div className="text-sm text-slate-500">
                    {currentStats.content.blog.views.toLocaleString()} views
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-lg">📰</span>
                  <div>
                    <div className="font-medium">News Articles</div>
                    <div className="text-sm text-slate-500">
                      {currentStats.content.news.published} published,{" "}
                      {currentStats.content.news.draft} draft
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {currentStats.content.news.total}
                  </div>
                  <div className="text-sm text-slate-500">
                    {currentStats.content.news.views.toLocaleString()} views
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-lg">📅</span>
                  <div>
                    <div className="font-medium">Events</div>
                    <div className="text-sm text-slate-500">
                      {currentStats.content.events.active} active,{" "}
                      {currentStats.content.events.upcoming} upcoming
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {currentStats.content.events.total}
                  </div>
                  <div className="text-sm text-slate-500">
                    {currentStats.content.events.registrations} registrations
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/60 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Donations & Campaigns
            </h2>
            <div className="space-y-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(currentStats.donations.total)}
                </div>
                <div className="text-sm text-green-700 dark:text-green-300">
                  Total Donations
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="font-semibold">
                    {currentStats.donations.campaigns}
                  </div>
                  <div className="text-xs text-slate-500">Total Campaigns</div>
                </div>
                <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="font-semibold">
                    {currentStats.donations.activeCampaigns}
                  </div>
                  <div className="text-xs text-slate-500">Active</div>
                </div>
                <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="font-semibold">
                    {currentStats.donations.donors}
                  </div>
                  <div className="text-xs text-slate-500">Donors</div>
                </div>
                <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="font-semibold">
                    {formatCurrency(currentStats.donations.avgDonation)}
                  </div>
                  <div className="text-xs text-slate-500">Avg Donation</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 bg-white/60 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Recent Activity
            </h2>
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <span className="text-lg">{activity.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-slate-900 dark:text-slate-100">
                      {activity.message}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {activity.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/60 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Quick Actions
            </h2>
            <div className="grid gap-3">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  href={action.href}
                  className={`flex items-center gap-3 p-3 ${action.color} hover:opacity-90 text-white rounded-lg transition-opacity`}
                >
                  <span className="text-lg">{action.icon}</span>
                  <span className="text-sm font-medium">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white/60 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            System Status
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Storage Usage</span>
                <span>
                  {currentStats.system.storage.used}/
                  {currentStats.system.storage.total}{" "}
                  {currentStats.system.storage.unit}
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all progress-bar ${
                    calculatePercentage(
                      currentStats.system.storage.used,
                      currentStats.system.storage.total
                    ) > 80
                      ? "bg-red-500"
                      : calculatePercentage(
                          currentStats.system.storage.used,
                          currentStats.system.storage.total
                        ) > 60
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                  style={
                    {
                      "--progress-width": `${calculatePercentage(
                        currentStats.system.storage.used,
                        currentStats.system.storage.total
                      )}%`,
                    } as React.CSSProperties
                  }
                ></div>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {calculatePercentage(
                  currentStats.system.storage.used,
                  currentStats.system.storage.total
                )}
                % used
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Bandwidth Usage</span>
                <span>
                  {currentStats.system.bandwidth.used}/
                  {currentStats.system.bandwidth.total}{" "}
                  {currentStats.system.bandwidth.unit}
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all progress-bar ${
                    calculatePercentage(
                      currentStats.system.bandwidth.used,
                      currentStats.system.bandwidth.total
                    ) > 80
                      ? "bg-red-500"
                      : calculatePercentage(
                          currentStats.system.bandwidth.used,
                          currentStats.system.bandwidth.total
                        ) > 60
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                  style={
                    {
                      "--progress-width": `${calculatePercentage(
                        currentStats.system.bandwidth.used,
                        currentStats.system.bandwidth.total
                      )}%`,
                    } as React.CSSProperties
                  }
                ></div>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {calculatePercentage(
                  currentStats.system.bandwidth.used,
                  currentStats.system.bandwidth.total
                )}
                % used
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>System Uptime</span>
                <span>{currentStats.system.uptime}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all progress-bar"
                  style={
                    {
                      "--progress-width": `${currentStats.system.uptime}%`,
                    } as React.CSSProperties
                  }
                ></div>
              </div>
              <div className="text-xs text-slate-500 mt-1">Excellent</div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
