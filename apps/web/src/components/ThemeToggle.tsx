"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check localStorage or system preference
    const stored = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = stored || (prefersDark ? "dark" : "light");
    setTheme(initialTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);

    // Add transition class for smooth theme change
    document.documentElement.classList.add("theme-transition");
    document.documentElement.classList.toggle("dark", newTheme === "dark");

    // Remove transition class after animation
    setTimeout(() => {
      document.documentElement.classList.remove("theme-transition");
    }, 300);
  };

  // Avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <div className="w-12 h-12 rounded-full bg-[var(--card-bg)] shadow-lg" />
      </div>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-6 right-6 z-50 p-3 rounded-full
        bg-[var(--card-bg)] border border-[var(--card-border)]
        shadow-lg hover:shadow-xl
        transition-all duration-200
        hover:scale-105 active:scale-95
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E97116]"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <Moon className="w-6 h-6 text-[#6B6358]" />
      ) : (
        <Sun className="w-6 h-6 text-[#E97116]" />
      )}
    </button>
  );
}
