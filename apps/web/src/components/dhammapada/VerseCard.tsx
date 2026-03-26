interface VerseCardProps {
  number: number;
  text: string;
  chapterNumber?: number;
}

export function VerseCard({ number, text, chapterNumber }: VerseCardProps) {
  return (
    <article
      className="py-6 border-b border-[var(--card-border)] last:border-b-0"
      aria-label={`Verse ${chapterNumber ? `${chapterNumber}.` : ""}${number}`}
    >
      {/* Verse number */}
      <div className="flex items-start gap-4">
        <span
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center
            rounded-full bg-[var(--color-saffron)]/10
            text-[var(--color-saffron)] font-semibold text-sm"
          aria-hidden="true"
        >
          {number}
        </span>

        {/* Verse text */}
        <p className="verse-text text-[var(--foreground)] flex-1 pt-1.5">
          {text}
        </p>
      </div>
    </article>
  );
}
