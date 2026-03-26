import Link from "next/link";
import { BookOpen, ArrowLeft } from "lucide-react";
import { AccessibilityControls } from "@/components/dhammapada";
import dhammapada from "@/data/dhammapada.json";

export const metadata = {
  title: "The Dhammapada - DharmaDoors",
  description:
    "Read the Dhammapada online - 423 verses of Buddhist wisdom across 26 chapters. Accessible reader with adjustable fonts and high contrast mode.",
};

export default function DhammapadaPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[var(--background)]/95 backdrop-blur-sm border-b border-[var(--card-border)]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Back link */}
            <Link
              href="/"
              className="flex items-center gap-2 text-[var(--color-warm-gray)] hover:text-[var(--foreground)] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">DharmaDoors</span>
            </Link>

            {/* Accessibility controls */}
            <AccessibilityControls />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Hero section */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--color-wisdom-blue)]/10 mb-6">
            <BookOpen className="w-8 h-8 text-[var(--color-wisdom-blue)]" />
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-[var(--foreground)] mb-4">
            {dhammapada.title}
          </h1>

          <p className="text-lg md:text-xl text-[var(--color-dharma-tan-dark)] dark:text-[var(--color-dharma-tan)] mb-2">
            {dhammapada.subtitle}
          </p>

          <p className="text-base text-[var(--color-warm-gray)] max-w-md mx-auto">
            {dhammapada.totalVerses} verses of Buddhist wisdom across{" "}
            {dhammapada.chapters.length} chapters
          </p>

          <p className="text-sm text-[var(--color-dharma-tan)] mt-4">
            Translation by {dhammapada.translator} ({dhammapada.translationYear})
          </p>
        </div>

        {/* Chapters grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto">
          {dhammapada.chapters.map((chapter) => (
            <Link
              key={chapter.number}
              href={`/dhammapada/${chapter.number}`}
              className="chapter-card group relative bg-[var(--card-bg)] rounded-xl p-6
                border border-[var(--card-border)] hover:border-[var(--color-wisdom-blue)]/40
                overflow-hidden"
            >
              {/* Chapter number badge */}
              <div
                className="absolute top-4 right-4 w-8 h-8 rounded-full
                  bg-[var(--color-wisdom-blue)]/10 flex items-center justify-center
                  text-sm font-semibold text-[var(--color-wisdom-blue)]"
              >
                {chapter.number}
              </div>

              {/* Chapter title */}
              <h2 className="text-lg font-semibold text-[var(--foreground)] mb-1 pr-10 group-hover:text-[var(--color-wisdom-blue)] transition-colors">
                {chapter.title}
              </h2>

              {/* Pali title */}
              <p className="text-sm text-[var(--color-dharma-tan)] italic mb-3">
                {chapter.paliTitle}
              </p>

              {/* Verse count */}
              <p className="text-sm text-[var(--color-warm-gray)]">
                {chapter.verses.length} verses
              </p>

              {/* Accent line */}
              <div
                className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--color-wisdom-blue)]
                  transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
              />
            </Link>
          ))}
        </div>

        {/* Attribution */}
        <footer className="mt-16 text-center text-sm text-[var(--color-warm-gray)]">
          <p>
            Text from{" "}
            <a
              href={dhammapada.source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-[var(--color-wisdom-blue)]"
            >
              Project Gutenberg
            </a>{" "}
            (eBook #{dhammapada.source.ebookNumber})
          </p>
          <p className="mt-1">
            {dhammapada.source.license} &middot; Originally published in{" "}
            {dhammapada.originalWork.title} ({dhammapada.originalWork.year})
          </p>
        </footer>
      </main>
    </div>
  );
}
