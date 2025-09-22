"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { extractYouTubeVideoId, getYouTubeThumbnail } from "@/lib/youtube";

interface VideoEmbedProps {
  value?: string;
  onChange?: (url: string) => void;
}

export function VideoEmbed({ value = "", onChange }: VideoEmbedProps) {
  const [url, setUrl] = useState(value);

  // Sync with parent value
  useEffect(() => {
    setUrl(value);
  }, [value]);

  const handleChange = (newUrl: string) => {
    setUrl(newUrl);
    onChange?.(newUrl);
  };

  const videoId = extractYouTubeVideoId(url);
  const thumbnailUrl = videoId ? getYouTubeThumbnail(videoId, "medium") : null;

  return (
    <div className="space-y-3">
      <input
        value={url}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="YouTube URL (https://www.youtube.com/watch?v=...)"
        aria-label="YouTube video URL"
        className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
      />

      {videoId && thumbnailUrl ? (
        <div className="aspect-video w-full rounded-md overflow-hidden bg-slate-100 dark:bg-slate-800">
          <div className="relative w-full h-full">
            <Image
              src={thumbnailUrl}
              alt="YouTube Video Preview"
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white ml-0.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.68L9.54 5.98C8.87 5.55 8 6.03 8 6.82z" />
                </svg>
              </div>
            </div>
            <div className="absolute bottom-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs">
              YouTube
            </div>
          </div>
        </div>
      ) : (
        <div className="aspect-video w-full rounded-md overflow-hidden bg-slate-200/60 dark:bg-slate-700/40 flex items-center justify-center text-slate-500 text-xs p-4">
          <div className="text-center">
            {url ? (
              <div className="space-y-2">
                <div className="text-red-500">❌ URL YouTube tidak valid</div>
                <div className="text-[10px] text-slate-400">
                  Pastikan URL berformat: https://www.youtube.com/watch?v=...
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div>📹 Paste YouTube URL</div>
                <div className="text-[10px]">Preview akan muncul di sini</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
