import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";
import CalendarView from "@/components/calendar/CalendarView";

export const metadata = {
  title: "Buddhist Calendar - DharmaDoors",
  description:
    "Buddhist observance calendar with Uposatha days, moon phases, and holy days across Theravada, Mahayana, Vajrayana, and Zen traditions.",
};

export default function CalendarPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[var(--background)]/95 backdrop-blur-sm border-b border-[var(--card-border)]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-[var(--color-warm-gray)] hover:text-[var(--foreground)] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">DharmaDoors</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Hero */}
        <div className="text-center mb-10 md:mb-14">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--color-saffron)]/10 mb-6">
            <Calendar className="w-8 h-8 text-[var(--color-saffron)]" />
          </div>

          <h1
            className="text-3xl md:text-4xl lg:text-5xl font-light text-[var(--foreground)] mb-4"
            style={{ fontFamily: "var(--font-serif), serif" }}
          >
            Buddhist Calendar
          </h1>

          <p className="text-lg md:text-xl text-[var(--color-dharma-tan-dark)] dark:text-[var(--color-dharma-tan)] mb-2">
            Uposatha days, moon phases, and holy days
          </p>

          <p className="text-base text-[var(--color-warm-gray)] max-w-lg mx-auto">
            Track observance days across Theravada, Mahayana, Vajrayana, and Zen
            traditions. Moon phases calculated astronomically.
          </p>
        </div>

        {/* Calendar */}
        <div className="max-w-5xl mx-auto">
          <CalendarView />
        </div>

        {/* Attribution */}
        <footer className="mt-16 text-center text-sm text-[var(--color-warm-gray)]">
          <p>
            Moon phases computed using the synodic month algorithm.
            Holy day dates are approximate and may vary by local tradition.
          </p>
        </footer>
      </main>
    </div>
  );
}
