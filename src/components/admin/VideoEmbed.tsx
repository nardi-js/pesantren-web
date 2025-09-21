"use client";
import { useState } from "react";

export function VideoEmbed() {
  const [url, setUrl] = useState("");
  return (
    <div className="space-y-2">
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="YouTube URL"
        aria-label="YouTube video URL"
        className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
      />
      <div className="aspect-video w-full rounded-md overflow-hidden bg-slate-200/60 dark:bg-slate-700/40 flex items-center justify-center text-slate-500 text-xs p-4">
        <div className="text-center">
          {url ? (
            <>
              <div>Preview (UI only)</div>
              <div className="text-[10px] mt-1 text-slate-400 break-all">
                {url.length > 40 ? `${url.slice(0, 40)}...` : url}
              </div>
            </>
          ) : (
            "Paste YouTube URL"
          )}
        </div>
      </div>
    </div>
  );
}
