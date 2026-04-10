import dhammapada from "@/data/dhammapada.json";

export interface DailyVerse {
  verseNumber: number;
  text: string;
  chapterNumber: number;
  chapterTitle: string;
  paliTitle: string;
}

// Flatten all verses with their chapter info for O(1) lookup
const ALL_VERSES: DailyVerse[] = dhammapada.chapters.flatMap((ch) =>
  ch.verses.map((v) => ({
    verseNumber: v.number,
    text: v.text,
    chapterNumber: ch.number,
    chapterTitle: ch.title,
    paliTitle: ch.paliTitle,
  }))
);

/**
 * Get the day of year (1-366) for a given UTC date.
 */
function dayOfYear(date: Date): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 1);
  const now = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  );
  return Math.floor((now - start) / (24 * 60 * 60 * 1000)) + 1;
}

/**
 * Get the daily verse for a given date.
 * Deterministic: same verse for every user on the same UTC date.
 * Cycles through all 423 verses using dayOfYear % totalVerses.
 */
export function getDailyVerse(date: Date = new Date()): DailyVerse {
  const day = dayOfYear(date);
  const index = (day - 1) % ALL_VERSES.length;
  return ALL_VERSES[index];
}

/**
 * Get verse by number (1-423).
 */
export function getVerseByNumber(num: number): DailyVerse | undefined {
  return ALL_VERSES.find((v) => v.verseNumber === num);
}
