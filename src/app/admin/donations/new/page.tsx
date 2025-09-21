"use client";
import { FormField } from "@/components/admin/FormField";
import { useToast } from "@/components/admin/ToastProvider";
import { AdminApi } from "@/lib/api";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewDonationPage() {
  const { push } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    donorName: "",
    donorEmail: "",
    donorPhone: "",
    amount: "",
    currency: "IDR",
    campaign: "",
    paymentMethod: "bank_transfer",
    paymentStatus: "pending",
    isAnonymous: false,
    message: "",
    notes: "",
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.donorName || !formData.amount) {
      push("Please fill in required fields (Donor Name and Amount)", "error");
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      push("Please enter a valid amount", "error");
      return;
    }

    setIsSubmitting(true);
    console.log("🚀 Submitting donation data:", formData);

    try {
      // Prepare data for submission
      const submitData = {
        donorName: formData.donorName,
        donorEmail: formData.donorEmail || undefined,
        donorPhone: formData.donorPhone || undefined,
        amount: amount,
        currency: formData.currency,
        campaign: formData.campaign || undefined,
        paymentMethod: formData.paymentMethod,
        paymentStatus: formData.paymentStatus,
        isAnonymous: formData.isAnonymous,
        message: formData.message || undefined,
        notes: formData.notes || undefined,
      };

      console.log("📤 Sending to API:", submitData);

      const response = await AdminApi.createDonation(submitData);
      console.log("📥 API Response:", response);

      if (response.success) {
        push("Donation record created successfully!", "success");
        router.push("/admin/donations");
      } else {
        throw new Error(response.error || "Failed to create donation");
      }
    } catch (error) {
      console.error("❌ Donation submission error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      push(`Failed to create donation: ${errorMessage}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-wide">
            New Donation Record
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            UI only form template.
          </p>
        </div>
        <Link
          href="/admin/donations"
          className="text-xs text-sky-600 dark:text-sky-400 hover:underline"
        >
          Back to list
        </Link>
      </div>
      <form className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <FormField label="Donor Name" required>
            <input
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
              placeholder="Donor Name"
              value={formData.donorName}
              onChange={(e) => handleInputChange("donorName", e.target.value)}
            />
          </FormField>
          <FormField label="Amount" required>
            <input
              type="number"
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
              placeholder="0"
              value={formData.amount}
              onChange={(e) => handleInputChange("amount", e.target.value)}
            />
          </FormField>
          <FormField label="Email">
            <input
              type="email"
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
              placeholder="donor@example.com"
              value={formData.donorEmail}
              onChange={(e) => handleInputChange("donorEmail", e.target.value)}
            />
          </FormField>
          <FormField label="Phone">
            <input
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
              placeholder="+62 xxx xxxx xxxx"
              value={formData.donorPhone}
              onChange={(e) => handleInputChange("donorPhone", e.target.value)}
            />
          </FormField>
          <FormField label="Payment Method">
            <select
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
              value={formData.paymentMethod}
              onChange={(e) =>
                handleInputChange("paymentMethod", e.target.value)
              }
              aria-label="Select payment method"
            >
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cash">Cash</option>
              <option value="credit_card">Credit Card</option>
              <option value="e_wallet">E-Wallet</option>
              <option value="other">Other</option>
            </select>
          </FormField>
          <FormField label="Campaign">
            <input
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
              placeholder="Campaign name (optional)"
              value={formData.campaign}
              onChange={(e) => handleInputChange("campaign", e.target.value)}
            />
          </FormField>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="anonymous"
            checked={formData.isAnonymous}
            onChange={(e) => handleInputChange("isAnonymous", e.target.checked)}
            className="rounded border-slate-300 dark:border-slate-600"
          />
          <label
            htmlFor="anonymous"
            className="text-sm text-slate-700 dark:text-slate-300"
          >
            Anonymous donation
          </label>
        </div>

        <FormField label="Message">
          <textarea
            rows={3}
            className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
            placeholder="Optional message from donor"
            value={formData.message}
            onChange={(e) => handleInputChange("message", e.target.value)}
          />
        </FormField>

        <FormField label="Internal Notes">
          <textarea
            rows={4}
            className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
            placeholder="Internal notes"
            value={formData.notes}
            onChange={(e) => handleInputChange("notes", e.target.value)}
          />
        </FormField>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-md bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Saving..." : "Save"}
          </button>
          <button
            type="reset"
            onClick={() =>
              setFormData({
                donorName: "",
                donorEmail: "",
                donorPhone: "",
                amount: "",
                currency: "IDR",
                campaign: "",
                paymentMethod: "bank_transfer",
                paymentStatus: "pending",
                isAnonymous: false,
                message: "",
                notes: "",
              })
            }
            disabled={isSubmitting}
            className="px-4 py-2 rounded-md border border-slate-300 dark:border-slate-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
