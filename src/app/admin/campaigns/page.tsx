"use client";
import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useToast } from "@/components/admin/ToastProvider";
import { AdminApi } from "@/lib/api";
import { Modal } from "@/components/admin/Modal";

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

export default function CampaignsListPage() {
  return <CampaignsListClient />;
}

function CampaignsListClient() {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );
  const [bulkSelected, setBulkSelected] = useState<string[]>([]);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { push } = useToast();

  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await AdminApi.getCampaigns();

      if (response.success && response.data) {
        const responseData = response.data as
          | { campaigns?: Campaign[]; data?: Campaign[] }
          | Campaign[];
        const campaignsData = Array.isArray(responseData)
          ? responseData
          : (responseData as { campaigns?: Campaign[]; data?: Campaign[] })
              .campaigns ||
            (responseData as { campaigns?: Campaign[]; data?: Campaign[] })
              .data ||
            [];
        setCampaigns(campaignsData);
      } else {
        setCampaigns([]);
        if (
          response.error &&
          !response.error.includes("not found") &&
          !response.error.includes("No campaigns")
        ) {
          setError(response.error);
        }
      }
    } catch (err) {
      setCampaigns([]);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch campaigns";

      if (
        !errorMessage.includes("not found") &&
        !errorMessage.includes("No campaigns") &&
        !errorMessage.includes("404")
      ) {
        setError(errorMessage);
        push(errorMessage, "error");
      }
    } finally {
      setLoading(false);
    }
  }, [push]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleDelete = async () => {
    if (!selectedCampaign) return;

    try {
      const response = await AdminApi.deleteCampaign(selectedCampaign._id);

      if (response.success) {
        push("Campaign deleted successfully", "success");
        setDeleteOpen(false);
        setSelectedCampaign(null);
        setBulkSelected([]);
        fetchCampaigns();
      } else {
        throw new Error(response.error || "Failed to delete campaign");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete campaign";
      push(errorMessage, "error");
    }
  };

  const handleBulkDelete = async () => {
    if (bulkSelected.length === 0) return;

    try {
      const deletePromises = bulkSelected.map((id) =>
        AdminApi.deleteCampaign(id)
      );
      await Promise.all(deletePromises);

      push(`${bulkSelected.length} campaigns deleted successfully`, "success");
      setBulkSelected([]);
      fetchCampaigns();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete campaigns";
      push(errorMessage, "error");
    }
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesFilter = filter === "all" || campaign.status === filter;
    const matchesSearch =
      searchQuery === "" ||
      campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
    }).format(amount);
  };

  const calculateProgress = (collected: number, goal: number) => {
    return goal > 0 ? (collected / goal) * 100 : 0;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      draft: "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300",
      active:
        "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
      completed:
        "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
      cancelled: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          statusClasses[status as keyof typeof statusClasses]
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Campaign Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Create and manage donation campaigns for your pesantren
            </p>
          </div>
          <Link
            href="/admin/campaigns/new"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Campaign
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white/60 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {["all", "draft", "active", "completed", "cancelled"].map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filter === status
                      ? "bg-green-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              )
            )}
          </div>

          <div className="flex gap-3 items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <svg
                className="w-5 h-5 text-slate-400 absolute left-3 top-2.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {bulkSelected.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Delete Selected ({bulkSelected.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white/60 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-3 text-slate-600 dark:text-slate-400">
              Loading campaigns...
            </span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-red-500 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-red-700 dark:text-red-300">{error}</span>
          </div>
        </div>
      )}

      {/* Campaigns Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => (
            <div
              key={campaign._id}
              className="bg-white/60 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-all duration-200"
            >
              {/* Campaign Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={bulkSelected.includes(campaign._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setBulkSelected([...bulkSelected, campaign._id]);
                      } else {
                        setBulkSelected(
                          bulkSelected.filter((id) => id !== campaign._id)
                        );
                      }
                    }}
                    className="w-4 h-4 text-green-600 bg-slate-100 border-slate-300 rounded focus:ring-green-500"
                    aria-label={`Select campaign ${campaign.title}`}
                  />
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">
                    {campaign.title}
                  </h3>
                </div>
                {campaign.featured && (
                  <span className="text-yellow-500 text-sm">⭐</span>
                )}
              </div>

              {/* Status and Category */}
              <div className="flex items-center gap-2 mb-3">
                {getStatusBadge(campaign.status)}
                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-xs">
                  {campaign.category}
                </span>
              </div>

              {/* Description */}
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">
                {campaign.description}
              </p>

              {/* Progress */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">
                    Progress
                  </span>
                  <span className="font-medium">
                    {calculateProgress(
                      campaign.collected,
                      campaign.goal
                    ).toFixed(1)}
                    %
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all progress-bar"
                    style={
                      {
                        width: `${Math.min(
                          calculateProgress(campaign.collected, campaign.goal),
                          100
                        )}%`,
                      } as React.CSSProperties
                    }
                  ></div>
                </div>
              </div>

              {/* Financial Info */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">
                    Collected
                  </span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(campaign.collected, campaign.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">
                    Goal
                  </span>
                  <span className="font-medium">
                    {formatCurrency(campaign.goal, campaign.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">
                    Donors
                  </span>
                  <span className="font-medium">{campaign.donorCount}</span>
                </div>
              </div>

              {/* Dates */}
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-500 mb-4">
                <span>Start: {formatDate(campaign.startDate)}</span>
                {campaign.endDate && (
                  <span>End: {formatDate(campaign.endDate)}</span>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link
                  href={`/admin/campaigns/${campaign._id}/edit`}
                  className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg text-center transition-colors"
                >
                  Edit
                </Link>
                <button
                  onClick={() => {
                    setSelectedCampaign(campaign);
                    setDeleteOpen(true);
                  }}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredCampaigns.length === 0 && (
        <div className="bg-white/60 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
          <div className="text-6xl mb-4">📢</div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
            No campaigns found
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {searchQuery || filter !== "all"
              ? "Try adjusting your search or filters"
              : "Create your first campaign to start raising funds"}
          </p>
          <Link
            href="/admin/campaigns/new"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create Campaign
          </Link>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteOpen}
        onCloseAction={() => setDeleteOpen(false)}
        title="Delete Campaign"
        footer={
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteOpen(false)}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Delete
            </button>
          </div>
        }
      >
        <p className="text-slate-600 dark:text-slate-400">
          Are you sure you want to delete &ldquo;{selectedCampaign?.title}
          &rdquo;? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
