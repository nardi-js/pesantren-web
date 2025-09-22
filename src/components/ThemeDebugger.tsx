"use client";
import { useEffect, useState } from "react";

export default function ThemeDebugger() {
  const [currentTheme, setCurrentTheme] = useState<string>("loading...");
  const [htmlClasses, setHtmlClasses] = useState<string>("loading...");
  const [bgColor, setBgColor] = useState<string>("loading...");

  useEffect(() => {
    // Check theme every 100ms
    const interval = setInterval(() => {
      const theme = localStorage.getItem("theme") || "not set";
      const classes = document.documentElement.className || "no classes";
      const computedBg = window.getComputedStyle(document.body).backgroundColor;
      setCurrentTheme(theme);
      setHtmlClasses(classes);
      setBgColor(computedBg);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const clearAndSetDark = () => {
    localStorage.clear();
    localStorage.setItem("theme", "dark");
    document.documentElement.classList.remove("light");
    location.reload();
  };

  const clearAndSetLight = () => {
    localStorage.clear();
    localStorage.setItem("theme", "light");
    document.documentElement.classList.add("light");
    location.reload();
  };

  return (
    <div className="fixed top-4 right-4 z-50 p-4 bg-red-500 text-white rounded-lg shadow-lg text-xs max-w-xs">
      <h3 className="font-bold">🔍 Theme Debug</h3>
      <p>
        <strong>LocalStorage:</strong> {currentTheme}
      </p>
      <p>
        <strong>HTML Classes:</strong> {htmlClasses}
      </p>
      <p>
        <strong>Body BG:</strong> {bgColor}
      </p>
      <div className="mt-2 space-y-1">
        <button
          onClick={clearAndSetDark}
          className="block w-full px-2 py-1 bg-gray-800 text-white rounded text-xs"
        >
          Force Dark & Reload
        </button>
        <button
          onClick={clearAndSetLight}
          className="block w-full px-2 py-1 bg-gray-200 text-black rounded text-xs"
        >
          Force Light & Reload
        </button>
      </div>
    </div>
  );
}
