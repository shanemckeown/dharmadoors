/**
 * Moon phase calculations based on Jean Meeus's "Astronomical Algorithms"
 * Simplified version using the synodic month cycle and known new moon epoch.
 *
 * Accuracy: within ~1 day for new/full moon dates, which is sufficient
 * for Buddhist observance day calendars.
 */

// Average synodic month (new moon to new moon) in days
const SYNODIC_MONTH = 29.53058868;

// Known new moon epoch: January 6, 2000 at 18:14 UTC (Julian Day 2451550.1)
const NEW_MOON_EPOCH = new Date(Date.UTC(2000, 0, 6, 18, 14, 0));
const EPOCH_MS = NEW_MOON_EPOCH.getTime();
const SYNODIC_MS = SYNODIC_MONTH * 24 * 60 * 60 * 1000;

export type MoonPhaseName =
  | "new_moon"
  | "waxing_crescent"
  | "first_quarter"
  | "waxing_gibbous"
  | "full_moon"
  | "waning_gibbous"
  | "last_quarter"
  | "waning_crescent";

export interface MoonPhaseInfo {
  phase: number;
  name: MoonPhaseName;
  label: string;
  symbol: string;
  illumination: number;
}

export interface MoonEvent {
  date: Date;
  type: "new_moon" | "full_moon";
  label: string;
  symbol: string;
}

export interface UposathaDay {
  date: Date;
  type: "new_moon" | "full_moon";
  label: string;
}

function getMoonPhasePosition(date: Date): number {
  const diff = date.getTime() - EPOCH_MS;
  const cycles = diff / SYNODIC_MS;
  const phase = cycles - Math.floor(cycles);
  return phase < 0 ? phase + 1 : phase;
}

export function getMoonPhase(date: Date): MoonPhaseInfo {
  const phase = getMoonPhasePosition(date);
  const illumination = Math.round(
    ((1 - Math.cos(phase * 2 * Math.PI)) / 2) * 100
  );

  let name: MoonPhaseName;
  let label: string;
  let symbol: string;

  if (phase < 0.0625 || phase >= 0.9375) {
    name = "new_moon"; label = "New Moon"; symbol = "\u25CF";
  } else if (phase < 0.1875) {
    name = "waxing_crescent"; label = "Waxing Crescent"; symbol = "\uD83C\uDF12";
  } else if (phase < 0.3125) {
    name = "first_quarter"; label = "First Quarter"; symbol = "\uD83C\uDF13";
  } else if (phase < 0.4375) {
    name = "waxing_gibbous"; label = "Waxing Gibbous"; symbol = "\uD83C\uDF14";
  } else if (phase < 0.5625) {
    name = "full_moon"; label = "Full Moon"; symbol = "\u25CB";
  } else if (phase < 0.6875) {
    name = "waning_gibbous"; label = "Waning Gibbous"; symbol = "\uD83C\uDF16";
  } else if (phase < 0.8125) {
    name = "last_quarter"; label = "Last Quarter"; symbol = "\uD83C\uDF17";
  } else {
    name = "waning_crescent"; label = "Waning Crescent"; symbol = "\uD83C\uDF18";
  }

  return { phase, name, label, symbol, illumination };
}

function findNearestPhase(nearDate: Date, phaseTarget: number): Date {
  const diff = nearDate.getTime() - EPOCH_MS;
  const cycles = diff / SYNODIC_MS;
  const baseCycle = Math.floor(cycles);

  let closest: Date | null = null;
  let closestDiff = Infinity;

  for (let offset = -1; offset <= 1; offset++) {
    const cycleStart = EPOCH_MS + (baseCycle + offset) * SYNODIC_MS;
    const phaseDate = new Date(cycleStart + phaseTarget * SYNODIC_MS);
    const d = Math.abs(phaseDate.getTime() - nearDate.getTime());
    if (d < closestDiff) {
      closestDiff = d;
      closest = phaseDate;
    }
  }

  return closest!;
}

export function getNewMoons(year: number): Date[] {
  const moons: Date[] = [];
  const startOfYear = new Date(Date.UTC(year, 0, 1));
  const endOfYear = new Date(Date.UTC(year, 11, 31, 23, 59, 59));

  let current = findNearestPhase(startOfYear, 0);
  if (current.getTime() < startOfYear.getTime() - 12 * 60 * 60 * 1000) {
    current = new Date(current.getTime() + SYNODIC_MS);
    current = findNearestPhase(current, 0);
  }

  while (current.getTime() <= endOfYear.getTime() + 12 * 60 * 60 * 1000) {
    if (current.getUTCFullYear() === year) {
      moons.push(current);
    }
    current = new Date(current.getTime() + SYNODIC_MS);
    current = findNearestPhase(current, 0);
  }

  return moons;
}

export function getFullMoons(year: number): Date[] {
  const moons: Date[] = [];
  const startOfYear = new Date(Date.UTC(year, 0, 1));
  const endOfYear = new Date(Date.UTC(year, 11, 31, 23, 59, 59));

  let current = findNearestPhase(startOfYear, 0.5);
  if (current.getTime() < startOfYear.getTime() - 12 * 60 * 60 * 1000) {
    current = new Date(current.getTime() + SYNODIC_MS);
    current = findNearestPhase(current, 0.5);
  }

  while (current.getTime() <= endOfYear.getTime() + 12 * 60 * 60 * 1000) {
    if (current.getUTCFullYear() === year) {
      moons.push(current);
    }
    current = new Date(current.getTime() + SYNODIC_MS);
    current = findNearestPhase(current, 0.5);
  }

  return moons;
}

export function getUposathaDays(year: number): UposathaDay[] {
  const newMoons = getNewMoons(year).map((date) => ({
    date,
    type: "new_moon" as const,
    label: "Uposatha (New Moon)",
  }));

  const fullMoons = getFullMoons(year).map((date) => ({
    date,
    type: "full_moon" as const,
    label: "Uposatha (Full Moon)",
  }));

  return [...newMoons, ...fullMoons].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );
}

export function getMoonEvents(year: number): MoonEvent[] {
  const newMoons = getNewMoons(year).map((date) => ({
    date,
    type: "new_moon" as const,
    label: "New Moon",
    symbol: "\u25CF",
  }));

  const fullMoons = getFullMoons(year).map((date) => ({
    date,
    type: "full_moon" as const,
    label: "Full Moon",
    symbol: "\u25CB",
  }));

  return [...newMoons, ...fullMoons].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

export function toUTCMidnight(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
}
