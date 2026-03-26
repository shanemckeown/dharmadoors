import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  AccessibilityControls,
  VerseCard,
  ChapterNav,
} from "@/components/dhammapada";
import dhammapada from "@/data/dhammapada.json";

interface PageProps {
  params: Promise<{ chapter: string }>;
}

// Generate static params for all chapters
export function generateStaticParams() {
  return dhammapada.chapters.map((chapter) => ({
    chapter: chapter.number.toString(),
  }));
}

// Generate metadata for each chapter
export async function generateMetadata({ params }: PageProps) {
  const { chapter: chapterParam } = await params;
  const chapterNum = parseInt(chapterParam, 10);
  const chapter = dhammapada.chapters.find((c) => c.number === chapterNum);

  if (!chapter) {
    return {
      title: "Chapter Not Found - Dhammapada",
    };
  }

  return {
    title: `${chapter.title} - Dhammapada Chapter ${chapter.number} - DharmaDoors`,
    description: `Read Chapter ${chapter.number}: ${chapter.title} (${chapter.paliTitle}) - ${chapter.verses.length} verses from the Dhammapada.`,
  };
}

export default async function ChapterPage({ params }: PageProps) {
  const { chapter: chapterParam } = await params;
  const chapterNum = parseInt(chapterParam, 10);
  const chapter = dhammapada.chapters.find((c) => c.number === chapterNum);

  if (!chapter) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[var(--background)]/95 backdrop-blur-sm border-b border-[var(--card-border)]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Back link */}
            <Link
              href="/dhammapada"
              className="flex items-center gap-2 text-[var(--color-warm-gray)] hover:text-[var(--foreground)] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">All Chapters</span>
            </Link>

            {/* Accessibility controls */}
            <AccessibilityControls />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12 max-w-3xl">
        {/* Chapter header */}
        <header className="mb-8 md:mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span
              className="px-3 py-1 rounded-full text-sm font-medium
                bg-[var(--color-wisdom-blue)]/10 text-[var(--color-wisdom-blue)]"
            >
              Chapter {chapter.number}
            </span>
            <span className="text-sm text-[var(--color-warm-gray)]">
              {chapter.verses.length} verses
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-[var(--foreground)] mb-2">
            {chapter.title}
          </h1>

          <p className="text-lg text-[var(--color-dharma-tan)] italic">
            {chapter.paliTitle}
          </p>
        </header>

        {/* Verses */}
        <section aria-label="Verses">
          {chapter.verses.map((verse) => (
            <VerseCard
              key={verse.number}
              number={verse.number}
              text={verse.text}
              chapterNumber={chapter.number}
            />
          ))}
        </section>

        {/* Chapter navigation */}
        <ChapterNav
          currentChapter={chapter.number}
          totalChapters={dhammapada.chapters.length}
          currentTitle={chapter.title}
        />

        {/* Back to all chapters link */}
        <div className="text-center mt-8">
          <Link
            href="/dhammapada"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg
              bg-[var(--card-bg)] border border-[var(--card-border)]
              hover:border-[var(--color-wisdom-blue)]/40
              text-[var(--foreground)] transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            View All Chapters
          </Link>
        </div>
      </main>
    </div>
  );
}
