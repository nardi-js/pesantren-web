"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface Campaign {
  _id: string;
  title: string;
  slug: string;
  description: string;
  goal: number;
  collected: number;
  currency: string;
  startDate: string;
  endDate?: string;
  status: "draft" | "active" | "completed" | "cancelled";
  featured: boolean;
  image?: string;
  category: string;
  progress: number;
  donorCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function CampaignsList() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/campaigns");
      const data = await response.json();

      if (data.success) {
        setCampaigns(data.data);
      } else {
        setError(data.error || "Failed to fetch campaigns");
      }
    } catch (err) {
      setError("Failed to fetch campaigns");
      console.error("Error fetching campaigns:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const formatCurrency = (amount: number, currency: string = "IDR") => {
    if (currency === "IDR") {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(amount);
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const categories = ["all", ...new Set(campaigns.map((c) => c.category))];
  const filteredCampaigns =
    selectedCategory === "all"
      ? campaigns
      : campaigns.filter((c) => c.category === selectedCategory);

  const featuredCampaigns = campaigns.filter((c) => c.featured);

  if (loading) {
    return (
      <section className="section-base py-16">
        <div className="app-container">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sky-600 mx-auto"></div>
            <p className="mt-4 text-soft">Loading campaigns...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="section-base py-16">
        <div className="app-container">
          <div className="text-center">
            <div className="text-red-600 text-lg">{error}</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-base py-16">
      <div className="app-container space-y-16">
        {/* Featured Campaigns */}
        {featuredCampaigns.length > 0 && (
          <div className="animate-fade-up">
            <div className="text-center mb-12">
              <h2 className="heading-lg font-bold mb-4">Campaign Unggulan</h2>
              <p className="text-soft max-w-2xl mx-auto">
                Campaign prioritas yang membutuhkan dukungan segera untuk
                kemajuan pesantren
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCampaigns.slice(0, 3).map((campaign) => (
                <div
                  key={campaign._id}
                  className="surface-card elevated rounded-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300"
                >
                  {campaign.image && (
                    <div className="relative h-48 bg-surface-alt">
                      <Image
                        src={campaign.image}
                        alt={campaign.title}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 dark:from-amber-900/20 dark:to-orange-900/20 dark:text-amber-300">
                        ⭐ Unggulan
                      </span>
                      <span className="text-xs text-soft bg-surface-alt px-2 py-1 rounded-full">
                        {campaign.category}
                      </span>
                    </div>
                    <h3 className="heading-sm font-semibold mb-3">
                      {campaign.title}
                    </h3>
                    <p className="text-soft text-sm mb-4 line-clamp-2">
                      {campaign.description}
                    </p>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-soft mb-2">
                        <span>Progress</span>
                        <span className="font-medium">
                          {campaign.progress.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-surface-alt rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-sky-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(campaign.progress, 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Financial Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-soft">Terkumpul</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(
                            campaign.collected,
                            campaign.currency
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-soft">Target</span>
                        <span className="font-medium">
                          {formatCurrency(campaign.goal, campaign.currency)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-soft">
                        <span>Donatur</span>
                        <span>{campaign.donorCount} orang</span>
                      </div>
                    </div>

                    <Link
                      href={`/donate/${campaign.slug}`}
                      className="block w-full text-center bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-500 hover:to-emerald-500 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Donasi Sekarang
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Campaigns */}
        {campaigns.length > 0 && (
          <div className="animate-fade-up animation-delay-200">
            <div className="text-center mb-8">
              <h2 className="heading-lg font-bold mb-4">Semua Campaign</h2>
              <p className="text-soft max-w-2xl mx-auto">
                Pilih campaign yang ingin Anda dukung untuk kemajuan pesantren
              </p>
            </div>

            {/* Category Filter */}
            {categories.length > 1 && (
              <div className="flex flex-wrap gap-2 justify-center mb-8">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      selectedCategory === category
                        ? "bg-gradient-to-r from-sky-600 to-emerald-600 text-white shadow-lg"
                        : "bg-surface-alt hover:bg-surface-alt-hover text-foreground"
                    }`}
                  >
                    {category === "all" ? "Semua" : category}
                  </button>
                ))}
              </div>
            )}

            {filteredCampaigns.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-soft text-lg">
                  {selectedCategory === "all"
                    ? "Belum ada campaign yang tersedia."
                    : `Tidak ada campaign dalam kategori ${selectedCategory}.`}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCampaigns.map((campaign) => (
                  <div
                    key={campaign._id}
                    className="surface-card elevated rounded-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300"
                  >
                    {campaign.image && (
                      <div className="relative h-48 bg-surface-alt">
                        <Image
                          src={campaign.image}
                          alt={campaign.title}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                          }}
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-soft bg-surface-alt px-2 py-1 rounded-full">
                          {campaign.category}
                        </span>
                        <span className="text-xs text-soft">
                          {campaign.donorCount} donatur
                        </span>
                      </div>
                      <h3 className="heading-sm font-semibold mb-3">
                        {campaign.title}
                      </h3>
                      <p className="text-soft text-sm mb-4 line-clamp-3">
                        {campaign.description}
                      </p>

                      {/* Progress */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-soft mb-2">
                          <span>Progress</span>
                          <span className="font-medium">
                            {campaign.progress.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-surface-alt rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-sky-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(campaign.progress, 100)}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Financial Info */}
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-soft">Terkumpul</span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(
                              campaign.collected,
                              campaign.currency
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-soft">Target</span>
                          <span className="font-medium">
                            {formatCurrency(campaign.goal, campaign.currency)}
                          </span>
                        </div>
                      </div>

                      <Link
                        href={`/donate/${campaign.slug}`}
                        className="block w-full text-center bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-500 hover:to-emerald-500 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        Donasi Sekarang
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {campaigns.length === 0 && (
          <div className="text-center py-16 animate-fade-up">
            <div className="text-6xl mb-4">🤲</div>
            <h3 className="heading-sm font-semibold mb-2">
              Belum Ada Campaign
            </h3>
            <p className="text-soft mb-6">
              Saat ini belum ada campaign donation yang aktif. Silakan periksa
              kembali nanti.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
