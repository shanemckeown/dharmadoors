import { getFullMoons, getNewMoons, isSameDay } from "@/lib/moonPhase";

export type HolyDayTradition =
  | "all"
  | "theravada"
  | "mahayana"
  | "vajrayana"
  | "zen";

export interface BuddhistHolyDay {
  /** Display name of the holy day */
  name: string;
  /** Brief description */
  description: string;
  /** Which traditions observe this day */
  traditions: HolyDayTradition[];
  /**
   * Returns the date(s) this holy day falls on for the given year.
   * Most holy days are tied to full moon dates; some are fixed.
   */
  getDates: (year: number) => Date[];
}

/**
 * Vesak / Buddha Day -- full moon of May (or nearest).
 * Celebrates the birth, enlightenment, and parinibbana of the Buddha.
 */
function getVesakDate(year: number): Date[] {
  const fullMoons = getFullMoons(year);
  const mayMoon = fullMoons.find((d) => d.getUTCMonth() === 4);
  if (mayMoon) return [mayMoon];
  const target = new Date(Date.UTC(year, 4, 15));
  const sorted = [...fullMoons].sort(
    (a, b) =>
      Math.abs(a.getTime() - target.getTime()) -
      Math.abs(b.getTime() - target.getTime())
  );
  return sorted.length > 0 ? [sorted[0]] : [];
}

/**
 * Asalha Puja -- full moon of July.
 * Marks the Buddha's first sermon. Primarily Theravada.
 */
function getAsalhaPujaDate(year: number): Date[] {
  const fullMoons = getFullMoons(year);
  const julyMoon = fullMoons.find((d) => d.getUTCMonth() === 6);
  if (julyMoon) return [julyMoon];
  const target = new Date(Date.UTC(year, 6, 15));
  const sorted = [...fullMoons].sort(
    (a, b) =>
      Math.abs(a.getTime() - target.getTime()) -
      Math.abs(b.getTime() - target.getTime())
  );
  return sorted.length > 0 ? [sorted[0]] : [];
}

/**
 * Magha Puja -- full moon of February (or March).
 * Commemorates the gathering of 1,250 arahants. Theravada.
 */
function getMaghaPujaDate(year: number): Date[] {
  const fullMoons = getFullMoons(year);
  const febMoon = fullMoons.find((d) => d.getUTCMonth() === 1);
  const marMoon = fullMoons.find((d) => d.getUTCMonth() === 2);
  if (febMoon) return [febMoon];
  if (marMoon) return [marMoon];
  return [];
}

/** Vassa start -- the day after Asalha Puja. Theravada. */
function getVassaStartDate(year: number): Date[] {
  const asalha = getAsalhaPujaDate(year);
  if (asalha.length === 0) return [];
  const nextDay = new Date(asalha[0].getTime() + 24 * 60 * 60 * 1000);
  return [nextDay];
}

/** Pavarana / End of Vassa -- full moon of October. Theravada. */
function getPavaranaDate(year: number): Date[] {
  const fullMoons = getFullMoons(year);
  const octMoon = fullMoons.find((d) => d.getUTCMonth() === 9);
  if (octMoon) return [octMoon];
  return [];
}

/** Kathina -- full moon of November. Theravada. */
function getKathinaDate(year: number): Date[] {
  const fullMoons = getFullMoons(year);
  const novMoon = fullMoons.find((d) => d.getUTCMonth() === 10);
  if (novMoon) return [novMoon];
  return [];
}

/** Bodhi Day -- December 8 (fixed). Mahayana / Zen. */
function getBodhiDayDate(year: number): Date[] {
  return [new Date(Date.UTC(year, 11, 8))];
}

/** Parinirvana Day -- February 15 (fixed). Mahayana. */
function getParinirvanaDate(year: number): Date[] {
  return [new Date(Date.UTC(year, 1, 15))];
}

/** Losar -- first new moon on or after Feb 1. Vajrayana. */
function getLosarDate(year: number): Date[] {
  const newMoons = getNewMoons(year);
  const feb1 = new Date(Date.UTC(year, 1, 1));
  const candidate = newMoons.find((d) => d.getTime() >= feb1.getTime());
  if (candidate) return [candidate];
  return [];
}

/** Master list of Buddhist holy days */
export const buddhistHolyDays: BuddhistHolyDay[] = [
  {
    name: "Vesak (Buddha Day)",
    description:
      "Celebrates the birth, enlightenment, and parinibbana of the Buddha. The most widely observed Buddhist holy day.",
    traditions: ["all"],
    getDates: getVesakDate,
  },
  {
    name: "Magha Puja",
    description:
      "Commemorates the spontaneous gathering of 1,250 arahants before the Buddha at Veluvana monastery.",
    traditions: ["theravada"],
    getDates: getMaghaPujaDate,
  },
  {
    name: "Asalha Puja (Dharma Day)",
    description:
      "Marks the Buddha's first sermon at Deer Park in Sarnath.",
    traditions: ["theravada"],
    getDates: getAsalhaPujaDate,
  },
  {
    name: "Vassa (Rains Retreat begins)",
    description:
      "The three-month monastic rains retreat. Lay practitioners often undertake extra precepts during this period.",
    traditions: ["theravada"],
    getDates: getVassaStartDate,
  },
  {
    name: "Pavarana (End of Vassa)",
    description:
      "End of the rains retreat. Monastics invite admonishment from their peers.",
    traditions: ["theravada"],
    getDates: getPavaranaDate,
  },
  {
    name: "Kathina",
    description:
      "Robe-offering ceremony held in the month after Vassa. Lay supporters offer cloth to the monastic community.",
    traditions: ["theravada"],
    getDates: getKathinaDate,
  },
  {
    name: "Bodhi Day",
    description:
      "Celebrates Siddhartha Gautama's enlightenment under the Bodhi tree. Observed on December 8.",
    traditions: ["mahayana", "zen"],
    getDates: getBodhiDayDate,
  },
  {
    name: "Parinirvana Day",
    description:
      "Commemorates the death and final nirvana of the Buddha. Observed on February 15.",
    traditions: ["mahayana"],
    getDates: getParinirvanaDate,
  },
  {
    name: "Losar (Tibetan New Year)",
    description:
      "Tibetan Buddhist New Year celebration with prayers, rituals, and community gatherings.",
    traditions: ["vajrayana"],
    getDates: getLosarDate,
  },
];

export interface ResolvedHolyDay {
  name: string;
  description: string;
  traditions: HolyDayTradition[];
  date: Date;
}

export function getHolyDaysForYear(year: number): ResolvedHolyDay[] {
  const results: ResolvedHolyDay[] = [];

  for (const holy of buddhistHolyDays) {
    const dates = holy.getDates(year);
    for (const date of dates) {
      results.push({
        name: holy.name,
        description: holy.description,
        traditions: holy.traditions,
        date,
      });
    }
  }

  return results.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function getHolyDayForDate(
  date: Date,
  holyDays: ResolvedHolyDay[]
): ResolvedHolyDay | undefined {
  return holyDays.find((h) => isSameDay(h.date, date));
}
