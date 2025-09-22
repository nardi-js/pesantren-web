"use client";
import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/admin/ToastProvider";
import { AdminApi } from "@/lib/api";

interface CampaignFormData {
  title: string;
  description: string;
  goal: number;
  currency: string;
  startDate: string;
  endDate: string;
  status: "draft" | "active" | "completed" | "cancelled";
  featured: boolean;
  category: string;
  image: string;
}

interface CampaignResponse {
  _id: string;
  title: string;
  description: string;
  goal: number;
  currency: string;
  startDate: string;
  endDate?: string;
  status: "draft" | "active" | "completed" | "cancelled";
  featured: boolean;
  category: string;
  image?: string;
  collected: number;
  progress: number;
  donorCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Params {
  id: string;
}

interface CampaignEditPageProps {
  params: Promise<Params>;
}

export default function EditCampaignPage({ params }: CampaignEditPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { push } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [formData, setFormData] = useState<CampaignFormData>({
    title: "",
    description: "",
    goal: 0,
    currency: "IDR",
    startDate: "",
    endDate: "",
    status: "draft",
    featured: false,
    category: "General",
    image: "",
  });

  const categories = [
    "Education",
    "Infrastructure",
    "Emergency",
    "General",
    "Events",
  ];

  const currencies = ["IDR", "USD", "EUR"];

  // Fetch campaign data on component mount
  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setFetchLoading(true);
        const response = await AdminApi.getCampaignById(resolvedParams.id);

        if (response.success && response.data) {
          const campaign = response.data as CampaignResponse;
          setFormData({
            title: campaign.title || "",
            description: campaign.description || "",
            goal: campaign.goal || 0,
            currency: campaign.currency || "IDR",
            startDate: campaign.startDate
              ? new Date(campaign.startDate).toISOString().split("T")[0]
              : "",
            endDate: campaign.endDate
              ? new Date(campaign.endDate).toISOString().split("T")[0]
              : "",
            status: campaign.status || "draft",
            featured: campaign.featured || false,
            category: campaign.category || "General",
            image: campaign.image || "",
          });
        } else {
          throw new Error(response.error || "Failed to fetch campaign");
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to fetch campaign";
        push(errorMessage, "error");
        router.push("/admin/campaigns");
      } finally {
        setFetchLoading(false);
      }
    };

    if (resolvedParams.id) {
      fetchCampaign();
    }
  }, [resolvedParams.id, push, router]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      push("Campaign title is required", "error");
      return;
    }

    if (!formData.description.trim()) {
      push("Campaign description is required", "error");
      return;
    }

    if (formData.goal <= 0) {
      push("Campaign goal must be greater than 0", "error");
      return;
    }

    if (!formData.startDate) {
      push("Start date is required", "error");
      return;
    }

    try {
      setLoading(true);

      const submitData = {
        ...formData,
        goal: Number(formData.goal),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate
          ? new Date(formData.endDate).toISOString()
          : undefined,
      };

      // Remove empty endDate
      if (!submitData.endDate) {
        delete submitData.endDate;
      }

      const response = await AdminApi.updateCampaign(
        resolvedParams.id,
        submitData
      );

      if (response.success) {
        push("Campaign updated successfully!", "success");
        router.push("/admin/campaigns");
      } else {
        throw new Error(response.error || "Failed to update campaign");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update campaign";
      push(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white/60 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-3 text-slate-600 dark:text-slate-400">
              Loading campaign...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/admin/campaigns"
            className="p-2 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Edit Campaign
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Update your campaign details and settings
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white/60 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Campaign Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter campaign title"
                  required
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your campaign goals and impact"
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Financial Goals */}
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Financial Goals
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="goal"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Fundraising Goal *
                </label>
                <input
                  type="number"
                  id="goal"
                  name="goal"
                  value={formData.goal}
                  onChange={handleInputChange}
                  placeholder="Enter target amount"
                  required
                  min="1"
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label
                  htmlFor="currency"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Currency
                </label>
                <select
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {currencies.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Campaign Timeline
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="startDate"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Start Date *
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label
                  htmlFor="endDate"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Additional Settings */}
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Additional Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="image"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Campaign Image URL (Optional)
                </label>
                <input
                  type="url"
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleCheckboxChange}
                  className="w-4 h-4 text-green-600 bg-slate-100 border-slate-300 rounded focus:ring-green-500"
                />
                <label
                  htmlFor="featured"
                  className="ml-2 text-sm text-slate-700 dark:text-slate-300"
                >
                  Feature this campaign (will be highlighted on the homepage)
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
            <Link
              href="/admin/campaigns"
              className="px-6 py-2 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {loading ? "Updating..." : "Update Campaign"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
