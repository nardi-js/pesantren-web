"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Container from "@/components/Container";

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

interface DonationFormData {
  donorName: string;
  donorEmail?: string;
  donorPhone?: string;
  amount: number;
  isAnonymous: boolean;
  message?: string;
  paymentMethod: string;
}

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<DonationFormData>({
    donorName: "",
    donorEmail: "",
    donorPhone: "",
    amount: 0,
    isAnonymous: false,
    message: "",
    paymentMethod: "bank_transfer",
  });

  const fetchCampaign = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/campaigns/${slug}`);
      const data = await response.json();

      if (data.success) {
        setCampaign(data.data);
        setError(null);
      } else {
        setError(data.error || "Campaign not found");
      }
    } catch (err) {
      setError("Failed to fetch campaign");
      console.error("Error fetching campaign:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaign();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

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

  const handleDonationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign) return;

    // Basic validation
    if (!formData.donorName.trim()) {
      alert("Please enter your name");
      return;
    }

    if (formData.amount <= 0) {
      alert("Please enter a valid donation amount");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/donations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          campaign: campaign.slug,
          currency: campaign.currency,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`Thank you for your donation! Receipt number: ${data.data.receiptNumber}`);
        setShowDonationForm(false);
        // Reset form
        setFormData({
          donorName: "",
          donorEmail: "",
          donorPhone: "",
          amount: 0,
          isAnonymous: false,
          message: "",
          paymentMethod: "bank_transfer",
        });
        // Refresh campaign data to show updated progress
        fetchCampaign();
      } else {
        alert(`Error: ${data.error || "An error occurred while processing your donation"}`);
      }
    } catch (err) {
      alert("Failed to connect to server. Please try again.");
      console.error("Error processing donation:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const predefinedAmounts = [50000, 100000, 250000, 500000, 1000000];

  if (loading) {
    return (
      <Container>
        <div className="py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading campaign...</p>
          </div>
        </div>
      </Container>
    );
  }

  if (error || !campaign) {
    return (
      <Container>
        <div className="py-16">
          <div className="text-center">
            <div className="text-red-600 text-lg">
              {error || "Campaign not found"}
            </div>
            <button
              onClick={() => router.back()}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
          >
            ← Back to Campaigns
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Campaign Info */}
            <div className="lg:col-span-2">
              {campaign.image && (
                <div className="relative h-64 md:h-80 bg-gray-200 rounded-xl overflow-hidden mb-6">
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

              <div className="flex items-center gap-2 mb-4">
                <span className="bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full">
                  {campaign.category}
                </span>
                {campaign.featured && (
                  <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded-full">
                    ⭐ Featured
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {campaign.title}
              </h1>

              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                {campaign.description}
              </p>

              {/* Campaign Details */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Campaign Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600">Start Date:</span>
                    <div className="font-medium">
                      {new Date(campaign.startDate).toLocaleDateString()}
                    </div>
                  </div>
                  {campaign.endDate && (
                    <div>
                      <span className="text-gray-600">End Date:</span>
                      <div className="font-medium">
                        {new Date(campaign.endDate).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">Total Donors:</span>
                    <div className="font-medium">
                      {campaign.donorCount} people
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <div
                      className={`font-medium ${
                        campaign.status === "active"
                          ? "text-green-600"
                          : campaign.status === "completed"
                          ? "text-blue-600"
                          : "text-gray-600"
                      }`}
                    >
                      {campaign.status.charAt(0).toUpperCase() +
                        campaign.status.slice(1)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Donation Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg border p-6 sticky top-8">
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>{campaign.progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                    <div
                      className="bg-green-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(campaign.progress, 100)}%` }}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Collected</span>
                      <span className="font-bold text-green-600 text-lg">
                        {formatCurrency(campaign.collected, campaign.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Goal</span>
                      <span className="font-semibold text-lg">
                        {formatCurrency(campaign.goal, campaign.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Remaining</span>
                      <span className="font-medium">
                        {formatCurrency(
                          campaign.goal - campaign.collected,
                          campaign.currency
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {campaign.status === "active" && (
                  <button
                    onClick={() => setShowDonationForm(!showDonationForm)}
                    className="w-full bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg"
                  >
                    {showDonationForm ? "Hide Donation Form" : "Donate Now"}
                  </button>
                )}

                {campaign.status === "completed" && (
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-blue-800 font-semibold">
                      Campaign Completed!
                    </div>
                    <div className="text-blue-600 text-sm">
                      Thank you for all donations
                    </div>
                  </div>
                )}
              </div>

              {/* Donation Form */}
              {showDonationForm && campaign.status === "active" && (
                <div className="bg-white rounded-xl shadow-lg border p-6 mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Make a Donation
                  </h3>

                  <form onSubmit={handleDonationSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Amount ({campaign.currency})
                      </label>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        {predefinedAmounts.map((amount) => (
                          <button
                            key={amount}
                            type="button"
                            onClick={() => setFormData({ ...formData, amount })}
                            className={`p-2 text-sm rounded border ${
                              formData.amount === amount
                                ? "bg-green-600 text-white border-green-600"
                                : "bg-gray-50 hover:bg-gray-100 border-gray-300"
                            }`}
                          >
                            {formatCurrency(amount, campaign.currency)}
                          </button>
                        ))}
                      </div>
                      <input
                        type="number"
                        min="1"
                        value={formData.amount}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            amount: Number(e.target.value),
                          })
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter custom amount"
                        title="Donation amount"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Your Name
                      </label>
                      <input
                        type="text"
                        value={formData.donorName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            donorName: e.target.value,
                          })
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        title="Your full name"
                        placeholder="Enter your name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email (Optional)
                      </label>
                      <input
                        type="email"
                        value={formData.donorEmail}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            donorEmail: e.target.value,
                          })
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        title="Your email address"
                        placeholder="Enter your email"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone (Optional)
                      </label>
                      <input
                        type="tel"
                        value={formData.donorPhone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            donorPhone: e.target.value,
                          })
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        title="Your phone number"
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Method
                      </label>
                      <select
                        value={formData.paymentMethod}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            paymentMethod: e.target.value,
                          })
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        title="Select payment method"
                        required
                      >
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="e_wallet">E-Wallet</option>
                        <option value="credit_card">Credit Card</option>
                        <option value="cash">Cash</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Message (Optional)
                      </label>
                      <textarea
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        rows={3}
                        placeholder="Leave a message..."
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="anonymous"
                        checked={formData.isAnonymous}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isAnonymous: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                      />
                      <label
                        htmlFor="anonymous"
                        className="ml-2 text-sm text-gray-700"
                      >
                        Donate anonymously
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                    >
                      {submitting ? "Processing..." : "Donate Now"}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
