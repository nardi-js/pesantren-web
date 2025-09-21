"use client";
import { useRef, useState } from "react";

export interface ImageData {
  file: File;
  preview: string;
  isUploaded?: boolean;
  cloudinaryUrl?: string;
}

interface ImageUploaderProps {
  onImageSelect?: (imageData: ImageData | null) => void;
  onUpload?: (url: string) => void; // Keep for backward compatibility
  currentImage?: string;
  disabled?: boolean;
}

export function ImageUploader({
  onImageSelect,
  onUpload,
  currentImage,
  disabled,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    setError(null);

    try {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      // Create image data object
      const newImageData: ImageData = {
        file,
        preview: previewUrl,
        isUploaded: false,
      };

      // Call the new callback with image data
      onImageSelect?.(newImageData);

      // Keep backward compatibility
      onUpload?.(previewUrl);

      console.log("📷 Image selected and stored in memory:", {
        name: file.name,
        size: file.size,
        type: file.type,
      });
    } catch (err) {
      console.error("File selection error:", err);
      setError(err instanceof Error ? err.message : "Failed to select file");
      setPreview(currentImage || null);
      onImageSelect?.(null);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    onImageSelect?.(null);
    onUpload?.("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-4 flex flex-col items-center justify-center gap-3 bg-white/60 dark:bg-slate-900/40">
      <div className="w-full aspect-video rounded-md bg-slate-200/50 dark:bg-slate-700/40 flex items-center justify-center text-slate-500 dark:text-slate-400 overflow-hidden">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Image preview"
            className="object-cover w-full h-full"
          />
        ) : (
          <span className="text-xs">No image selected</span>
        )}
      </div>

      {error && <div className="text-red-500 text-xs text-center">{error}</div>}

      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="px-3 py-1.5 text-xs font-medium rounded-md bg-sky-600 hover:bg-sky-500 text-white transition focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Select image file"
        >
          Select Image
        </button>
        {preview && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled}
            className="px-3 py-1.5 text-xs font-medium rounded-md border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
            aria-label="Remove selected image"
          >
            Remove
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-label="Image file input"
        onChange={handleFileSelect}
        disabled={disabled}
      />

      <p className="text-[10px] text-slate-500 dark:text-slate-400 text-center">
        Image will be uploaded when you publish the post (max 5MB)
      </p>

      <div aria-live="polite" className="sr-only">
        {preview ? "Image selected successfully" : ""}
      </div>
    </div>
  );
}
