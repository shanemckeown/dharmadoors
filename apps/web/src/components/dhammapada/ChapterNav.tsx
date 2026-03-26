"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ChapterNavProps {
  currentChapter: number;
  totalChapters: number;
  currentTitle?: string;
}

export function ChapterNav({
  currentChapter,
  totalChapters,
  currentTitle,
}: ChapterNavProps) {
  const hasPrev = currentChapter > 1;
  const hasNext = currentChapter < totalChapters;

  return (
    <nav
      className="flex items-center justify-between py-6 border-t border-[var(--card-border)]"
      aria-label="Chapter navigation"
    >
      {/* Previous chapter */}
      {hasPrev ? (
        <Link
          href={`/dhammapada/${currentChapter - 1}`}
          className="flex items-center gap-2 px-4 py-2 rounded-lg
            text-[var(--color-warm-gray)] hover:text-[var(--foreground)]
            hover:bg-[var(--color-mist)] dark:hover:bg-[var(--card-bg)]
            transition-colors duration-200"
          aria-label={`Previous chapter: Chapter ${currentChapter - 1}`}
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Previous</span>
        </Link>
      ) : (
        <div className="w-24" />
      )}

      {/* Current position */}
      <div className="text-center">
        <span className="text-sm text-[var(--color-warm-gray)]">
          Chapter {currentChapter} of {totalChapters}
        </span>
        {currentTitle && (
          <p className="text-xs text-[var(--color-dharma-tan)] mt-0.5 hidden sm:block">
            {currentTitle}
          </p>
        )}
      </div>

      {/* Next chapter */}
      {hasNext ? (
        <Link
          href={`/dhammapada/${currentChapter + 1}`}
          className="flex items-center gap-2 px-4 py-2 rounded-lg
            text-[var(--color-warm-gray)] hover:text-[var(--foreground)]
            hover:bg-[var(--color-mist)] dark:hover:bg-[var(--card-bg)]
            transition-colors duration-200"
          aria-label={`Next chapter: Chapter ${currentChapter + 1}`}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-5 h-5" />
        </Link>
      ) : (
        <div className="w-24" />
      )}
    </nav>
  );
}
