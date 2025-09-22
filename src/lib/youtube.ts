// Utility function to extract YouTube video ID from various YouTube URL formats
export function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;

  const patterns = [
    // Regular YouTube URLs
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    // YouTube shortened URLs
    /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
    // YouTube embed URLs
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    // YouTube playlist URLs
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?.*list=.*&v=([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

// Generate YouTube thumbnail URL with fallback
export function getYouTubeThumbnail(
  videoId: string,
  quality: "default" | "medium" | "high" | "standard" | "maxres" = "medium"
): string {
  // Map quality to correct YouTube thumbnail names
  const qualityMap = {
    default: "default", // 120x90
    medium: "mqdefault", // 320x180
    high: "hqdefault", // 480x360
    standard: "sddefault", // 640x480
    maxres: "maxresdefault", // 1280x720
  };

  const thumbnailQuality = qualityMap[quality];
  return `https://img.youtube.com/vi/${videoId}/${thumbnailQuality}.jpg`;
}

// Generate YouTube embed URL
export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}
