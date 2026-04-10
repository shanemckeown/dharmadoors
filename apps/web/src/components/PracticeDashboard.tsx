"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getStreak } from "@/lib/streak";

export function StreakAndSit() {
  const [streak, setStreak] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const data = getStreak();
    setStreak(data.currentStreak);
  }, []);

  if (!mounted) {
    return (
      <div className="flex gap-4 w-full max-w-lg">
        <div className="flex-[3] bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-5 h-24" />
        <div className="flex-[2] bg-[var(--color-saffron)] rounded-2xl h-24" />
      </div>
    );
  }

  return (
    <div className="flex gap-4 w-full max-w-lg">
      {/* Streak counter */}
      <div className="flex-[3] bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-5 flex flex-col justify-center">
        <p
          className="text-3xl font-light text-[var(--color-saffron)] streak-roll"
          style={{ fontFamily: "var(--font-serif), serif" }}
        >
          {streak > 0 ? `Day ${streak}` : "Begin today"}
        </p>
        <p className="text-xs text-[var(--color-warm-gray)] mt-1">
          {streak > 0 ? "Current streak" : "Start your practice"}
        </p>
      </div>

      {/* Sit Now button */}
      <Link
        href="/sit"
        className="flex-[2] bg-[var(--color-saffron)] hover:bg-[var(--color-saffron-dark)]
          rounded-2xl flex flex-col items-center justify-center
          transition-all duration-200
          hover:scale-[1.02] active:scale-[0.98]
          shadow-sm cursor-pointer"
      >
        <svg
          width="28"
          height="34"
          viewBox="0 0 200 240"
          fill="white"
          className="mb-1 opacity-90"
          aria-hidden="true"
        >
          {/* Simplified arch icon */}
          <path
            d="M10,240 L10,110 Q10,10 100,10 Q190,10 190,110 L190,240 Z
               M35,240 L35,115 Q35,35 100,35 Q165,35 165,115 L165,240 Z"
            fillRule="evenodd"
          />
        </svg>
        <span
          className="text-white text-lg font-light"
          style={{ fontFamily: "var(--font-serif), serif" }}
        >
          Sit
        </span>
      </Link>
    </div>
  );
}

export function ShareVerseButton({ verseNumber }: { verseNumber: number }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = `${window.location.origin}/dhammapada/1#verse-${verseNumber}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Dhammapada verse ${verseNumber}`,
          url,
        });
        return;
      } catch { /* user cancelled */ }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ok */ }
  }

  return (
    <button
      onClick={handleShare}
      className="text-xs text-[var(--color-warm-gray)] hover:text-[var(--color-saffron)]
        transition-colors inline-flex items-center gap-1"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
        <polyline points="16 6 12 2 8 6" />
        <line x1="12" y1="2" x2="12" y2="15" />
      </svg>
      {copied ? "Copied!" : "Share verse"}
    </button>
  );
}
