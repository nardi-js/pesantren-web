"use client";

interface ShareButtonProps {
  title: string;
  description: string;
}

export default function ShareButton({ title, description }: ShareButtonProps) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      const url = window.location.href;
      navigator.clipboard.writeText(url);
      alert("Link berhasil disalin ke clipboard!");
    }
  };

  return (
    <button onClick={handleShare} className="w-full btn-outline">
      Bagikan Event
    </button>
  );
}
