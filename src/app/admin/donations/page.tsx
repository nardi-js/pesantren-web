"use client";
import { Modal } from "@/components/admin/Modal";
import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useToast } from "@/components/admin/ToastProvider";
import { AdminApi } from "@/lib/api";

interface Donation {
  _id: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  currency: string;
  campaign: string;
  method: string;
  status: "pending" | "completed" | "failed" | "refunded";
  anonymous: boolean;
  message?: string;
  donatedAt: string;
  receiptNumber: string;
}

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

export default function DonationsListPage() {
  return <DonationsListClient />;
}

function DonationsListClient() {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(
    null
  );
  const [bulkSelected, setBulkSelected] = useState<string[]>([]);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"donations" | "campaigns">(
    "donations"
  );
  const [donations, setDonations] = useState<Donation[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingComplete, setMarkingComplete] = useState<string[]>([]);
  const [bulkMarkingComplete, setBulkMarkingComplete] = useState(false);
  const { push } = useToast();

  const fetchCampaigns = useCallback(async () => {
    try {
      const response = await AdminApi.getCampaigns();
      if (response.success && response.data) {
        const campaignsData = Array.isArray(response.data) ? response.data : [];
        setCampaigns(campaignsData);
      }
    } catch (err) {
      console.error("Failed to fetch campaigns:", err);
    }
  }, []);

  const fetchDonations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await AdminApi.getDonations();

      if (response.success && response.data) {
        // Handle different possible response structures
        const responseData = response.data as
          | { donations?: Donation[]; data?: Donation[] }
          | Donation[];
        const donationsData = Array.isArray(responseData)
          ? responseData
          : (responseData as { donations?: Donation[]; data?: Donation[] })
              .donations ||
            (responseData as { donations?: Donation[]; data?: Donation[] })
              .data ||
            [];
        setDonations(donationsData);
      } else {
        // If no data or error, just set empty array (could be empty database)
        setDonations([]);
        if (
          response.error &&
          !response.error.includes("not found") &&
          !response.error.includes("No donations")
        ) {
          setError(response.error);
        }
      }
    } catch (err) {
      // Don't show error for empty database scenarios
      setDonations([]);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch donations";

      // Only show error if it's not a "no data" scenario
      if (
        !errorMessage.includes("not found") &&
        !errorMessage.includes("No donations") &&
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
    fetchDonations();
    fetchCampaigns();
  }, [fetchDonations, fetchCampaigns]);

  const handleDelete = async () => {
    if (!selectedDonation) return;

    try {
      const response = await AdminApi.deleteDonation(selectedDonation._id);

      if (response.success) {
        push("Donation deleted successfully", "success");
        setDeleteOpen(false);
        setSelectedDonation(null);
        setBulkSelected([]);
        fetchDonations(); // Reload the list
      } else {
        throw new Error(response.error || "Failed to delete donation");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete donation";
      push(errorMessage, "error");
    }
  };

  const handleMarkComplete = async (donationId: string) => {
    try {
      setMarkingComplete((prev) => [...prev, donationId]);
      const response = await AdminApi.updateDonation(donationId, {
        paymentStatus: "completed",
        paymentDate: new Date().toISOString(),
      });

      if (response.success) {
        push("Donation marked as completed", "success");
        fetchDonations(); // Reload the list
      } else {
        throw new Error(
          response.error || "Failed to mark donation as completed"
        );
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to mark donation as completed";
      push(errorMessage, "error");
    } finally {
      setMarkingComplete((prev) => prev.filter((id) => id !== donationId));
    }
  };

  const handleBulkMarkComplete = async () => {
    if (bulkSelected.length === 0) return;

    try {
      setBulkMarkingComplete(true);
      // Update all selected donations
      const updatePromises = bulkSelected.map((id) =>
        AdminApi.updateDonation(id, {
          paymentStatus: "completed",
          paymentDate: new Date().toISOString(),
        })
      );

      const results = await Promise.allSettled(updatePromises);
      const failures = results.filter((result) => result.status === "rejected");

      if (failures.length === 0) {
        push(
          `${bulkSelected.length} donation${
            bulkSelected.length !== 1 ? "s" : ""
          } marked as completed`,
          "success"
        );
      } else {
        push(
          `${bulkSelected.length - failures.length} donation${
            bulkSelected.length - failures.length !== 1 ? "s" : ""
          } marked as completed, ${failures.length} failed`,
          "error"
        );
      }

      setBulkSelected([]);
      fetchDonations(); // Reload the list
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to mark donations as completed";
      push(errorMessage, "error");
    } finally {
      setBulkMarkingComplete(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
          <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  const filteredDonations = donations.filter((donation) => {
    const matchesFilter = filter === "all" || donation.status === filter;
    const matchesSearch =
      donation.donorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donation.campaign.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donation.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleBulkSelect = (id: string) => {
    setBulkSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setBulkSelected(
      bulkSelected.length === filteredDonations.length
        ? []
        : filteredDonations.map((d) => d._id)
    );
  };

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === "IDR") {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(amount);
    }
    return `${currency} ${amount.toLocaleString()}`;
  };

  const calculateProgress = (collected: number, target: number) => {
    return Math.min((collected / target) * 100, 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-wide">
            Donations Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track donations, manage campaigns, and analyze donor contributions
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex border border-slate-300 dark:border-slate-600 rounded-md">
            <button
              onClick={() => setViewMode("donations")}
              className={`px-3 py-2 text-xs ${
                viewMode === "donations"
                  ? "bg-sky-600 text-white"
                  : "bg-white dark:bg-slate-800"
              }`}
            >
              Donations
            </button>
            <button
              onClick={() => setViewMode("campaigns")}
              className={`px-3 py-2 text-xs ${
                viewMode === "campaigns"
                  ? "bg-sky-600 text-white"
                  : "bg-white dark:bg-slate-800"
              }`}
            >
              Campaigns
            </button>
          </div>
          <input
            placeholder="Search donations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Filter by status"
            className="rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          <Link
            href="/admin/donations/new"
            className="rounded-md bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            Add Donation
          </Link>
        </div>
      </div>

      {/* View: Donations */}
      {viewMode === "donations" && (
        <>
          {/* Bulk Actions */}
          {bulkSelected.length > 0 && (
            <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-sm font-medium text-sky-800 dark:text-sky-200">
                {bulkSelected.length} donation
                {bulkSelected.length !== 1 ? "s" : ""} selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleBulkMarkComplete}
                  disabled={bulkMarkingComplete}
                  className="px-3 py-1.5 text-xs rounded-md bg-green-600 hover:bg-green-500 disabled:bg-green-300 disabled:cursor-not-allowed text-white"
                >
                  {bulkMarkingComplete ? "Marking..." : "Mark Complete"}
                </button>
                <button className="px-3 py-1.5 text-xs rounded-md bg-blue-600 hover:bg-blue-500 text-white">
                  Send Receipt
                </button>
                <button
                  onClick={() => setDeleteOpen(true)}
                  className="px-3 py-1.5 text-xs rounded-md bg-red-600 hover:bg-red-500 text-white"
                >
                  Delete
                </button>
              </div>
            </div>
          )}

          {/* Donations List */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/50 shadow">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300">
                  <th className="text-left px-4 py-3 font-semibold">
                    <input
                      type="checkbox"
                      checked={
                        bulkSelected.length === filteredDonations.length &&
                        filteredDonations.length > 0
                      }
                      onChange={handleSelectAll}
                      className="rounded border-slate-300 dark:border-slate-600"
                      aria-label="Select all donations"
                    />
                  </th>
                  <th scope="col" className="text-left px-4 py-3 font-semibold">
                    Donor
                  </th>
                  <th scope="col" className="text-left px-4 py-3 font-semibold">
                    Amount
                  </th>
                  <th scope="col" className="text-left px-4 py-3 font-semibold">
                    Campaign
                  </th>
                  <th scope="col" className="text-left px-4 py-3 font-semibold">
                    Method
                  </th>
                  <th scope="col" className="text-left px-4 py-3 font-semibold">
                    Status
                  </th>
                  <th scope="col" className="text-left px-4 py-3 font-semibold">
                    Date
                  </th>
                  <th scope="col" className="text-left px-4 py-3 font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredDonations.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                          <span className="text-2xl">💰</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                            No donations yet
                          </h3>
                          <p className="text-slate-500 dark:text-slate-400 mt-1">
                            Get started by adding your first donation record.
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            (window.location.href = "/admin/donations/new")
                          }
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors"
                        >
                          Add First Donation
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredDonations.map((donation) => (
                    <tr
                      key={donation._id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition"
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={bulkSelected.includes(donation._id)}
                          onChange={() => handleBulkSelect(donation._id)}
                          className="rounded border-slate-300 dark:border-slate-600"
                          aria-label={`Select donation ${donation.receiptNumber}`}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-slate-900 dark:text-slate-100">
                            {donation.anonymous
                              ? "Anonymous Donor"
                              : donation.donorName}
                          </div>
                          <div className="text-slate-500 dark:text-slate-400 text-xs">
                            {donation.receiptNumber}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-green-600">
                          {formatCurrency(donation.amount, donation.currency)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300">
                          {donation.campaign}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {donation.method}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            donation.status === "completed"
                              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                              : donation.status === "pending"
                              ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
                              : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                          }`}
                        >
                          {donation.status === "completed"
                            ? "Completed"
                            : donation.status === "pending"
                            ? "Pending"
                            : "Failed"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {donation.donatedAt}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedDonation(donation);
                              setDetailsOpen(true);
                            }}
                            className="text-sky-600 hover:text-sky-500 text-xs font-medium"
                          >
                            Details
                          </button>
                          <Link
                            href={`/admin/donations/${donation._id}/edit`}
                            className="text-blue-600 hover:text-blue-500 text-xs font-medium"
                          >
                            Edit
                          </Link>
                          {donation.status === "pending" && (
                            <button
                              onClick={() => handleMarkComplete(donation._id)}
                              disabled={markingComplete.includes(donation._id)}
                              className="text-green-600 hover:text-green-500 disabled:text-green-300 disabled:cursor-not-allowed text-xs font-medium"
                            >
                              {markingComplete.includes(donation._id)
                                ? "Completing..."
                                : "Complete"}
                            </button>
                          )}
                          <button
                            onClick={() =>
                              push("Receipt sent to donor", "success")
                            }
                            className="text-green-600 hover:text-green-500 text-xs font-medium"
                          >
                            Receipt
                          </button>
                          <button
                            onClick={() => {
                              setSelectedDonation(donation);
                              setDeleteOpen(true);
                            }}
                            className="text-red-600 hover:text-red-500 text-xs font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* View: Campaigns */}
      {viewMode === "campaigns" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <div
              key={campaign._id}
              className="bg-white/60 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  {campaign.title}
                </h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    campaign.status === "active"
                      ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                      : "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300"
                  }`}
                >
                  {campaign.status === "active" ? "Active" : "Completed"}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
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
                            calculateProgress(
                              campaign.collected,
                              campaign.goal
                            ),
                            100
                          )}%`,
                        } as React.CSSProperties
                      }
                    ></div>
                  </div>
                </div>

                <div className="flex justify-between text-sm">
                  <div>
                    <div className="text-slate-600 dark:text-slate-400">
                      Collected
                    </div>
                    <div className="font-semibold text-green-600">
                      {formatCurrency(campaign.collected, campaign.currency)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-600 dark:text-slate-400">
                      Target
                    </div>
                    <div className="font-semibold">
                      {formatCurrency(campaign.goal, campaign.currency)}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Link
                    href={`/admin/campaigns/${campaign._id}/edit`}
                    className="flex-1 text-center px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() =>
                      push("Campaign analytics generated", "success")
                    }
                    className="flex-1 px-3 py-2 text-xs rounded-md bg-sky-600 hover:bg-sky-500 text-white"
                  >
                    Analytics
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white/60 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(
              donations
                .filter((d) => d.status === "completed")
                .reduce((sum, d) => sum + d.amount, 0),
              "IDR"
            )}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Total Received
          </div>
        </div>
        <div className="bg-white/60 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
          <div className="text-2xl font-bold text-blue-600">
            {donations.filter((d) => d.status === "completed").length}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Completed
          </div>
        </div>
        <div className="bg-white/60 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {donations.filter((d) => d.status === "pending").length}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Pending
          </div>
        </div>
        <div className="bg-white/60 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
          <div className="text-2xl font-bold text-indigo-600">
            {campaigns.filter((c) => c.status === "active").length}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Active Campaigns
          </div>
        </div>
      </div>

      {/* Details Modal */}
      <Modal
        open={detailsOpen}
        onCloseAction={() => {
          setDetailsOpen(false);
          setSelectedDonation(null);
        }}
        title="Donation Details"
        footer={
          <button
            onClick={() => {
              setDetailsOpen(false);
              setSelectedDonation(null);
            }}
            className="px-3 py-1.5 text-xs rounded-md border border-slate-300 dark:border-slate-600"
          >
            Close
          </button>
        }
      >
        {selectedDonation && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Receipt Number:</span>
                <div>{selectedDonation.receiptNumber}</div>
              </div>
              <div>
                <span className="font-medium">Amount:</span>
                <div className="text-green-600 font-semibold">
                  {formatCurrency(
                    selectedDonation.amount,
                    selectedDonation.currency
                  )}
                </div>
              </div>
              <div>
                <span className="font-medium">Donor:</span>
                <div>
                  {selectedDonation.anonymous
                    ? "Anonymous"
                    : selectedDonation.donorName}
                </div>
              </div>
              <div>
                <span className="font-medium">Email:</span>
                <div>
                  {selectedDonation.anonymous
                    ? "Hidden"
                    : selectedDonation.donorEmail}
                </div>
              </div>
              <div>
                <span className="font-medium">Campaign:</span>
                <div>{selectedDonation.campaign}</div>
              </div>
              <div>
                <span className="font-medium">Method:</span>
                <div>{selectedDonation.method}</div>
              </div>
              <div>
                <span className="font-medium">Status:</span>
                <div>{selectedDonation.status}</div>
              </div>
              <div>
                <span className="font-medium">Date:</span>
                <div>{selectedDonation.donatedAt}</div>
              </div>
            </div>
            {selectedDonation.message && (
              <div>
                <span className="font-medium">Message:</span>
                <div className="mt-1 p-3 bg-slate-50 dark:bg-slate-800 rounded text-sm">
                  {selectedDonation.message}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={deleteOpen}
        onCloseAction={() => {
          setDeleteOpen(false);
          setSelectedDonation(null);
        }}
        title={
          bulkSelected.length > 0
            ? "Delete Selected Donations"
            : "Delete Donation"
        }
        footer={
          <>
            <button
              onClick={() => {
                setDeleteOpen(false);
                setSelectedDonation(null);
              }}
              className="px-3 py-1.5 text-xs rounded-md border border-slate-300 dark:border-slate-600"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 text-xs rounded-md bg-red-600 hover:bg-red-500 text-white"
            >
              Delete
            </button>
          </>
        }
      >
        <p className="text-sm">
          {bulkSelected.length > 0
            ? `Are you sure you want to delete ${bulkSelected.length} selected donations? This action cannot be undone.`
            : `Are you sure you want to delete donation "${selectedDonation?.receiptNumber}"? This action cannot be undone.`}
        </p>
      </Modal>
    </div>
  );
}
