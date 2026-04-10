const STORAGE_KEY = "dharmadoors-streak";

interface StreakData {
  currentStreak: number;
  lastPracticeDate: string; // YYYY-MM-DD in UTC
  longestStreak: number;
  totalSessions: number;
}

function todayUTC(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

function yesterdayUTC(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

function loadStreak(): StreakData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* private browsing or SSR */ }
  return {
    currentStreak: 0,
    lastPracticeDate: "",
    longestStreak: 0,
    totalSessions: 0,
  };
}

function saveStreak(data: StreakData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { /* private browsing */ }
}

/**
 * Get the current streak data.
 * If the last practice was before yesterday, the streak has been broken.
 */
export function getStreak(): StreakData {
  const data = loadStreak();
  const today = todayUTC();
  const yesterday = yesterdayUTC();

  // Streak is still alive if last practice was today or yesterday
  if (data.lastPracticeDate !== today && data.lastPracticeDate !== yesterday) {
    data.currentStreak = 0;
  }

  return data;
}

/**
 * Record a practice session for today.
 * Increments streak if this is the first session of the day.
 * Returns the updated streak data.
 */
export function recordSession(): StreakData {
  const data = loadStreak();
  const today = todayUTC();
  const yesterday = yesterdayUTC();

  data.totalSessions += 1;

  if (data.lastPracticeDate === today) {
    // Already practiced today, just increment session count
    saveStreak(data);
    return data;
  }

  if (data.lastPracticeDate === yesterday) {
    // Continuing the streak
    data.currentStreak += 1;
  } else {
    // Starting fresh
    data.currentStreak = 1;
  }

  data.lastPracticeDate = today;
  data.longestStreak = Math.max(data.longestStreak, data.currentStreak);
  saveStreak(data);
  return data;
}
