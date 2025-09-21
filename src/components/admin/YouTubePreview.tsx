"use client";
import { useState, useEffect } from "react";

interface YouTubePreviewProps {
  url: string;
  className?: string;
}

export function YouTubePreview({ url, className = "" }: YouTubePreviewProps) {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setVideoId(null);
      setError(null);
      return;
    }

    // Extract YouTube video ID from various YouTube URL formats
    const extractVideoId = (url: string) => {
      const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/v\/([^&\n?#]+)/,
        /youtube\.com\/shorts\/([^&\n?#]+)/,
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
          return match[1];
        }
      }
      return null;
    };

    const id = extractVideoId(url);
    if (id) {
      setVideoId(id);
      setError(null);
    } else {
      setVideoId(null);
      setError("Invalid YouTube URL format");
    }
  }, [url]);

  if (!url) {
    return (
      <div
        className={`bg-slate-100 dark:bg-slate-800 rounded-lg p-4 text-center ${className}`}
      >
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          No YouTube URL provided
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center ${className}`}
      >
        <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  if (!videoId) {
    return (
      <div
        className={`bg-slate-100 dark:bg-slate-800 rounded-lg p-4 text-center ${className}`}
      >
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-600 mx-auto"></div>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
          Loading preview...
        </p>
      </div>
    );
  }

  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden ${className}`}
    >
      <div className="aspect-video">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video preview"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full"
        ></iframe>
      </div>
      <div className="p-3 bg-slate-50 dark:bg-slate-800">
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
          {url}
        </p>
      </div>
    </div>
  );
}

interface YouTubeInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  showPreview?: boolean;
}

export function YouTubeInput({
  value,
  onChange,
  onBlur,
  placeholder = "Enter YouTube URL (e.g., https://youtube.com/watch?v=...)",
  className = "",
  showPreview = true,
}: YouTubeInputProps) {
  return (
    <div className="space-y-3">
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent ${className}`}
      />
      {showPreview && value && (
        <YouTubePreview url={value} className="max-w-md" />
      )}
    </div>
  );
}
