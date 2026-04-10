import Link from "next/link";
import { MapPin, BookOpen, Calendar } from "lucide-react";
import { DharmaDoorsLogo, BuddhaSilhouette } from "@/components/DharmaDoorsLogo";
import { MoonPhaseSvg } from "@/components/MoonPhaseSvg";
import { StreakAndSit, ShareVerseButton } from "@/components/PracticeDashboard";
import { getDailyVerse } from "@/lib/dailyVerse";
import { getMoonPhase, getUposathaDays, isSameDay } from "@/lib/moonPhase";
import { getHolyDayForDate, getHolyDaysForYear } from "@/data/buddhistHolyDays";
import { ArrowRight } from "lucide-react";

// Force dynamic so the verse updates daily
export const dynamic = "force-dynamic";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function Home() {
  const now = new Date();
  const verse = getDailyVerse(now);
  const moon = getMoonPhase(now);

  // Check for uposatha or holy day
  const year = now.getUTCFullYear();
  const uposathaDays = getUposathaDays(year);
  const holyDays = getHolyDaysForYear(year);
  const todayUTC = new Date(Date.UTC(year, now.getUTCMonth(), now.getUTCDate()));
  const isUposatha = uposathaDays.some((u) => isSameDay(u.date, todayUTC));
  const holyDay = getHolyDayForDate(todayUTC, holyDays);

  const dayName = WEEKDAYS[now.getUTCDay()];
  const monthName = MONTHS[now.getUTCMonth()];
  const dayNum = now.getUTCDate();

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <main className="flex-1 flex flex-col items-center px-6 py-10 md:py-16">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-2">
          <DharmaDoorsLogo size={28} className="text-[var(--color-dharma-tan)]" />
          <h1
            className="text-3xl md:text-4xl font-light tracking-tight text-[var(--foreground)]"
            style={{ fontFamily: "var(--font-serif), serif" }}
          >
            DharmaDoors
          </h1>
        </div>

        <p className="text-sm text-[var(--color-dharma-tan-dark)] dark:text-[var(--color-dharma-tan)] mb-8 tracking-wide">
          Find sangha. Read the teachings. Practice together.
        </p>

        {/* Omni-search */}
        <form action="/sanghamap" className="w-full max-w-lg mb-8">
          <div className="relative">
            <input
              type="text"
              name="q"
              placeholder="Search for a temple, city, or tradition..."
              className="w-full px-5 py-3.5 pr-12 rounded-full
                bg-[var(--card-bg)] text-[var(--foreground)]
                border border-[var(--card-border)]
                shadow-sm text-sm
                placeholder:text-[var(--color-dharma-tan-light)]
                focus:outline-none focus:border-[var(--color-saffron)] focus:shadow-md
                transition-all duration-200"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2
                w-9 h-9 rounded-full
                bg-[var(--color-saffron)] text-white
                flex items-center justify-center
                hover:bg-[var(--color-saffron-dark)]
                transition-colors duration-200"
              aria-label="Search"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Today Banner */}
        <div className="w-full max-w-lg bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl px-5 py-4 mb-6 flex items-center gap-4">
          <MoonPhaseSvg phase={moon.name} size={48} />
          <div className="flex-1 min-w-0">
            <p
              className="text-lg text-[var(--foreground)] font-medium"
              style={{ fontFamily: "var(--font-serif), serif" }}
            >
              {dayName}, {monthName} {dayNum}
            </p>
            <p className="text-xs text-[var(--color-warm-gray)]">
              {moon.label} · {moon.illumination}% illuminated
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            {isUposatha && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-saffron)]/10 text-[var(--color-saffron)] font-medium">
                Uposatha
              </span>
            )}
            {holyDay && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-wisdom-blue)]/10 text-[var(--color-wisdom-blue)] font-medium truncate max-w-[140px]">
                {holyDay.name.split("(")[0].trim()}
              </span>
            )}
          </div>
        </div>

        {/* Daily Verse */}
        <div className="verse-entrance w-full max-w-lg bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 md:p-8 mb-6 relative overflow-hidden">
          {/* Buddha watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <BuddhaSilhouette
              size={160}
              className="text-[var(--color-dharma-tan)] opacity-[0.07] dark:opacity-[0.12]"
            />
          </div>

          {/* Saffron top accent */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-[var(--color-saffron)]" />

          <p className="text-xs text-[var(--color-warm-gray)] uppercase tracking-wider mb-4 relative">
            Dhammapada {verse.chapterNumber}:{verse.verseNumber}
          </p>

          <blockquote
            className="text-xl md:text-2xl text-center text-[var(--foreground)] leading-relaxed mb-6 relative"
            style={{ fontFamily: "var(--font-serif), serif", lineHeight: 1.8 }}
          >
            {verse.text}
          </blockquote>

          <div className="flex items-center justify-between relative">
            <p className="text-xs text-[var(--color-dharma-tan)] italic">
              {verse.chapterTitle}
            </p>
            <ShareVerseButton verseNumber={verse.verseNumber} />
          </div>
        </div>

        {/* Streak + Sit Now */}
        <div className="mb-10 w-full flex justify-center">
          <StreakAndSit />
        </div>

        {/* Entry Points */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-lg mb-12">
          <Link
            href="/sanghamap"
            className="entry-card bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5 text-center group"
          >
            <div className="w-10 h-10 rounded-full bg-[var(--color-saffron)]/10 flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-5 h-5 text-[var(--color-saffron)]" />
            </div>
            <p className="text-sm font-semibold text-[var(--foreground)] group-hover:text-[var(--color-saffron)] transition-colors">
              69,000+
            </p>
            <p className="text-xs text-[var(--color-warm-gray)]">Buddhist centers</p>
          </Link>

          <Link
            href="/dhammapada"
            className="entry-card bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5 text-center group"
          >
            <div className="w-10 h-10 rounded-full bg-[var(--color-wisdom-blue)]/10 flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-5 h-5 text-[var(--color-wisdom-blue)]" />
            </div>
            <p className="text-sm font-semibold text-[var(--foreground)] group-hover:text-[var(--color-wisdom-blue)] transition-colors">
              423
            </p>
            <p className="text-xs text-[var(--color-warm-gray)]">Dhammapada verses</p>
          </Link>

          <Link
            href="/calendar"
            className="entry-card bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5 text-center group"
          >
            <div className="w-10 h-10 rounded-full bg-[var(--color-saffron)]/10 flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-5 h-5 text-[var(--color-saffron)]" />
            </div>
            <p className="text-sm font-semibold text-[var(--foreground)] group-hover:text-[var(--color-saffron)] transition-colors">
              Buddhist
            </p>
            <p className="text-xs text-[var(--color-warm-gray)]">Calendar & holy days</p>
          </Link>
        </div>

        {/* Dedication of Merit */}
        <div className="max-w-sm text-center mb-8">
          <p className="text-sm text-[var(--color-dharma-tan)] dark:text-[var(--color-dharma-tan-light)] italic leading-loose">
            May the merit of this action benefit all sentient beings.
            <br />
            May all beings be free from suffering and the causes of suffering.
            <br />
            May all beings find happiness and the causes of happiness.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 text-center">
        <p className="text-sm text-[var(--color-dharma-tan)] mb-4">
          Free for everyone. Built with dana.
        </p>
        <div className="flex items-center justify-center gap-6">
          <a
            href="https://github.com/shanemckeown/dharmadoors"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5
              text-sm text-[var(--color-warm-gray)]
              hover:text-[var(--foreground)]
              transition-colors duration-200"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
