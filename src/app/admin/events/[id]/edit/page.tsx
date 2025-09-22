"use client";
import { FormField } from "@/components/admin/FormField";
import { ImageUploader, ImageData } from "@/components/admin/ImageUploader";
import { VideoEmbed } from "@/components/admin/VideoEmbed";
import { useToast } from "@/components/admin/ToastProvider";
import { AdminApi } from "@/lib/api";
import { uploadImageToCloudinary } from "@/lib/image-upload";
import Link from "next/link";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

interface EventEditPageProps {
  params: Promise<{ id: string }>;
}

export default function EventEditPage({ params }: EventEditPageProps) {
  const resolvedParams = use(params);
  const { push } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    content: "",
    location: "",
    date: "",
    time: "",
    category: "",
    tags: "",
    capacity: "",
    price: "",
    currency: "",
    featuredImage: "",
    youtubeUrl: "",
    registrationLink: "",
    registrationOpen: true,
    organizer: "",
    status: "draft",
  });

  // Load event data
  useEffect(() => {
    const loadEvent = async () => {
      try {
        setIsLoading(true);
        const response = await AdminApi.getEventById(resolvedParams.id);
          
        if (response.success && response.data) {
          const event = response.data as any;
          setFormData({
            title: event.title || "",
            slug: event.slug || "",
            description: event.description || "",
            content: event.content || "",
            location: event.location || "",
            date: event.date
              ? new Date(event.date).toISOString().split("T")[0]
              : "",
            time: event.time || "",
            category: event.category || "",
            tags: event.tags?.join(", ") || "",
            capacity: event.capacity?.toString() || "",
            price: event.price?.toString() || "",
            currency: event.currency || "",
            featuredImage: event.featuredImage || "",
            youtubeUrl: event.youtubeUrl || "",
            registrationLink: event.registrationLink || "",
            registrationOpen: event.registrationOpen ?? true,
            organizer: event.organizer?.name || "",
            status: event.status || "draft",
          });
        }
      } catch (error) {
        push("Gagal memuat data event", "error");
      } finally {
        setIsLoading(false);
      }
    };

    loadEvent();
  }, [resolvedParams.id, push]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.date) {
      push(
        "Silakan isi field yang wajib (Judul, Deskripsi, dan Tanggal)",
        "error"
      );
      return;
    }

    setIsSubmitting(true);
    try {
      let imageUrl =
        formData.featuredImage || "https://via.placeholder.com/800x400";

      // Upload image to Cloudinary if selected
      if (selectedImage && !selectedImage.isUploaded) {
        const uploadResult = await uploadImageToCloudinary(selectedImage);

        if (uploadResult.success && uploadResult.url) {
          imageUrl = uploadResult.url;
        } else {
          push(`Image upload failed: ${uploadResult.error}`, "error");
          setIsSubmitting(false);
          return;
        }
      }

      // Prepare data for submission
      const submitData = {
        title: formData.title,
        slug: formData.slug,
        description: formData.description,
        content: formData.content || formData.description,
        location: formData.location,
        date: new Date(formData.date),
        time: formData.time || "00:00",
        category: formData.category || "Religious",
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        price: formData.price ? parseFloat(formData.price) : undefined,
        currency: formData.currency || "IDR",
        featuredImage: imageUrl,
        youtubeUrl: formData.youtubeUrl || undefined,
        registrationLink: formData.registrationLink,
        registrationOpen: formData.registrationOpen,
        organizer: {
          name: formData.organizer || "Admin",
        },
        status: formData.status,
      };
      const response = await AdminApi.updateEvent(
        resolvedParams.id,
        submitData
      );
      if (response.success) {
        push("Event berhasil diperbarui!", "success");
        router.push("/admin/events");
      } else {
        throw new Error(response.error || "Failed to update event");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      push(`Gagal memperbarui event: ${errorMessage}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 max-w-4xl w-full">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-wide">Edit Event</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Perbarui informasi event
          </p>
        </div>
        <Link
          href="/admin/events"
          className="text-xs self-start sm:self-auto text-sky-600 dark:text-sky-400 hover:underline"
        >
          Kembali ke daftar
        </Link>
      </div>

      <form className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Judul" required>
            <input
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
              placeholder="Judul event"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
            />
          </FormField>

          <FormField label="Slug">
            <input
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
              placeholder="event-slug"
              value={formData.slug}
              onChange={(e) => handleInputChange("slug", e.target.value)}
            />
          </FormField>

          <FormField label="Lokasi" required>
            <input
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
              placeholder="Lokasi event"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
            />
          </FormField>

          <FormField label="Tanggal" required>
            <input
              type="date"
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
              value={formData.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
              aria-label="Pilih tanggal event"
            />
          </FormField>

          <FormField label="Waktu">
            <input
              type="time"
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
              value={formData.time}
              onChange={(e) => handleInputChange("time", e.target.value)}
              aria-label="Pilih waktu event"
            />
          </FormField>

          <FormField label="Kategori">
            <select
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
              value={formData.category}
              onChange={(e) => handleInputChange("category", e.target.value)}
              aria-label="Pilih kategori event"
            >
              <option value="">Pilih Kategori</option>
              <option value="Religious">Religious</option>
              <option value="Educational">Educational</option>
              <option value="Social">Social</option>
              <option value="Sports">Sports</option>
              <option value="Cultural">Cultural</option>
              <option value="Workshop">Workshop</option>
            </select>
          </FormField>

          <FormField label="Kapasitas">
            <input
              type="number"
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
              placeholder="Maksimal peserta (opsional)"
              value={formData.capacity}
              onChange={(e) => handleInputChange("capacity", e.target.value)}
            />
          </FormField>

          <FormField label="Harga">
            <input
              type="number"
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
              placeholder="Harga tiket (opsional)"
              value={formData.price}
              onChange={(e) => handleInputChange("price", e.target.value)}
            />
          </FormField>

          <FormField label="Link Pendaftaran">
            <input
              type="url"
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
              placeholder="https://..."
              value={formData.registrationLink}
              onChange={(e) =>
                handleInputChange("registrationLink", e.target.value)
              }
            />
          </FormField>

          <FormField label="Penyelenggara">
            <input
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
              placeholder="Nama penyelenggara"
              value={formData.organizer}
              onChange={(e) => handleInputChange("organizer", e.target.value)}
            />
          </FormField>

          <FormField label="Status">
            <select
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
              value={formData.status}
              onChange={(e) => handleInputChange("status", e.target.value)}
              aria-label="Pilih status event"
            >
              <option value="draft">Draft</option>
              <option value="published">Diterbitkan</option>
              <option value="cancelled">Dibatalkan</option>
              <option value="completed">Selesai</option>
            </select>
          </FormField>

          <FormField label="Pendaftaran Dibuka">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.registrationOpen}
                onChange={(e) =>
                  handleInputChange("registrationOpen", e.target.checked)
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm">Buka pendaftaran</span>
            </label>
          </FormField>
        </div>

        <FormField label="Tags">
          <input
            className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
            placeholder="Tags dipisahkan dengan koma"
            value={formData.tags}
            onChange={(e) => handleInputChange("tags", e.target.value)}
          />
        </FormField>

        <FormField label="Deskripsi" required>
          <textarea
            rows={4}
            className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
            placeholder="Deskripsi event"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
          />
        </FormField>

        <FormField label="Konten Detail">
          <textarea
            rows={6}
            className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
            placeholder="Informasi detail event (opsional)"
            value={formData.content}
            onChange={(e) => handleInputChange("content", e.target.value)}
          />
        </FormField>

        <FormField label="Featured Image URL">
          <input
            type="url"
            className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm"
            placeholder="https://..."
            value={formData.featuredImage}
            onChange={(e) => handleInputChange("featuredImage", e.target.value)}
          />
        </FormField>

        <FormField label="Cover Image" hint="Upload event cover image">
          <ImageUploader
            onImageSelect={(imageData) => {
              setSelectedImage(imageData);
              if (imageData) {
                handleInputChange("featuredImage", imageData.preview || "");
              }
            }}
            currentImage={selectedImage?.preview || formData.featuredImage}
          />
        </FormField>

        <FormField label="YouTube Video" hint="Optional embed">
          <VideoEmbed
            value={formData.youtubeUrl}
            onChange={(url) => handleInputChange("youtubeUrl", url)}
          />
        </FormField>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-md bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Menyimpan..." : "Perbarui Event"}
          </button>

          <Link
            href="/admin/events"
            className="px-4 py-2 rounded-md border border-slate-300 dark:border-slate-600 text-sm text-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Batal
          </Link>
        </div>
      </form>
    </div>
  );
}
