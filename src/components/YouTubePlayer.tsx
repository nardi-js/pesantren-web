"use client";
import { useState } from "react";
import Image from "next/image";
import { extractYouTubeVideoId, getYouTubeThumbnail } from "@/lib/youtube";

interface YouTubePlayerProps {
  url: string;
  title?: string;
  className?: string;
}

export default function YouTubePlayer({
  url,
  title = "Video",
  className = "",
}: YouTubePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoId = extractYouTubeVideoId(url);

  if (!videoId) {
    return null;
  }

  const thumbnailUrl = getYouTubeThumbnail(videoId, "maxres");
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;

  if (isPlaying) {
    return (
      <div
        className={`relative aspect-video w-full rounded-xl overflow-hidden ${className}`}
      >
        <iframe
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative aspect-video w-full rounded-xl overflow-hidden cursor-pointer group ${className}`}
    >
      <Image
        src={thumbnailUrl}
        alt={`Thumbnail untuk ${title}`}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        unoptimized
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />

      {/* Play Button */}
      <button
        onClick={() => setIsPlaying(true)}
        className="absolute inset-0 flex items-center justify-center"
        aria-label={`Play video: ${title}`}
      >
        <div className="w-16 h-16 md:w-20 md:h-20 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-110">
          <svg
            className="w-8 h-8 md:w-10 md:h-10 text-white ml-1"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.68L9.54 5.98C8.87 5.55 8 6.03 8 6.82z" />
          </svg>
        </div>
      </button>

      {/* YouTube branding */}
      <div className="absolute bottom-3 right-3">
        <div className="bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold">
          YouTube
        </div>
      </div>
    </div>
  );
}
