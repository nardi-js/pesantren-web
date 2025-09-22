"use client";
import { useState } from "react";

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface SubmitResponse {
  success: boolean;
  error?: string;
  data?: {
    message: string;
  };
}

const initial: FormState = { name: "", email: "", subject: "", message: "" };

export default function ContactForm() {
  const [values, setValues] = useState<FormState>(initial);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string>("");

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!values.name || !values.email || !values.subject || !values.message) {
      setError("Semua field wajib diisi");
      return;
    }

    setSending(true);
    setError("");

    try {
      const response = await fetch("/api/contact/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const result: SubmitResponse = await response.json();

      if (result.success) {
        setSent(true);
        setValues(initial);
        setTimeout(() => setSent(false), 5000);
      } else {
        setError(result.error || "Gagal mengirim pesan");
      }
    } catch (err) {
      console.error("Submit error:", err);
      setError("Gagal mengirim pesan. Silakan coba lagi.");
    } finally {
      setSending(false);
    }
  };

  const disabled = sending || !values.name || !values.email || !values.message;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-6">
        <Field
          label="Nama"
          name="name"
          value={values.name}
          onChange={onChange}
          placeholder="Nama lengkap"
          required
        />
        <Field
          label="Email"
          name="email"
          type="email"
          value={values.email}
          onChange={onChange}
          placeholder="email@domain.com"
          required
        />
      </div>
      <Field
        label="Subjek"
        name="subject"
        value={values.subject}
        onChange={onChange}
        placeholder="Judul pesan"
      />
      <FieldArea
        label="Pesan"
        name="message"
        value={values.message}
        onChange={onChange}
        placeholder="Tulis pesan Anda..."
        required
        rows={6}
      />
      <div className="flex items-center gap-4">
        <button
          disabled={disabled}
          className="btn-primary px-8 py-3 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? "Mengirim..." : "Kirim Pesan"}
        </button>
        {sent && (
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 animate-fade-up">
            Pesan berhasil dikirim!
          </span>
        )}
        {error && (
          <span className="text-xs font-medium text-red-600 dark:text-red-400">
            {error}
          </span>
        )}
      </div>
    </form>
  );
}

import type { ChangeEvent } from "react";
interface BaseFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
}
function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  required,
  type = "text",
}: BaseFieldProps) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium">
      <span className="text-[11px] uppercase tracking-wide font-bold text-[hsl(var(--foreground-muted))]">
        {label}
        {required && <sup className="text-rose-500">*</sup>}
      </span>
      <input
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
        required={required}
        className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50"
      />
    </label>
  );
}

interface AreaProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  rows?: number;
}
function FieldArea({
  label,
  name,
  value,
  onChange,
  placeholder,
  required,
  rows = 5,
}: AreaProps) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium">
      <span className="text-[11px] uppercase tracking-wide font-bold text-[hsl(var(--foreground-muted))]">
        {label}
        {required && <sup className="text-rose-500">*</sup>}
      </span>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-3 text-sm resize-y min-h-[140px] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50"
      />
    </label>
  );
}
