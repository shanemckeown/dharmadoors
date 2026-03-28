"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  getMoonPhase,
  getUposathaDays,
  isSameDay,
  type UposathaDay,
} from "@/lib/moonPhase";
import {
  getHolyDaysForYear,
  getHolyDayForDate,
  type ResolvedHolyDay,
} from "@/data/buddhistHolyDays";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

interface CalendarDay {
  date: Date;
  inMonth: boolean;
  isToday: boolean;
  uposatha: UposathaDay | undefined;
  holyDay: ResolvedHolyDay | undefined;
  moonSymbol: string;
  moonLabel: string;
}

function buildCalendarDays(
  year: number,
  month: number,
  uposathaDays: UposathaDay[],
  holyDays: ResolvedHolyDay[],
  today: Date
): CalendarDay[] {
  const firstOfMonth = new Date(Date.UTC(year, month, 1));
  const startDay = firstOfMonth.getUTCDay(); // 0 = Sunday
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

  // Previous month padding
  const prevMonthDays = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const days: CalendarDay[] = [];

  for (let i = startDay - 1; i >= 0; i--) {
    const date = new Date(Date.UTC(year, month - 1, prevMonthDays - i));
    const moon = getMoonPhase(date);
    days.push({
      date,
      inMonth: false,
      isToday: isSameDay(date, today),
      uposatha: uposathaDays.find((u) => isSameDay(u.date, date)),
      holyDay: getHolyDayForDate(date, holyDays),
      moonSymbol: moon.symbol,
      moonLabel: moon.label,
    });
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(Date.UTC(year, month, d));
    const moon = getMoonPhase(date);
    days.push({
      date,
      inMonth: true,
      isToday: isSameDay(date, today),
      uposatha: uposathaDays.find((u) => isSameDay(u.date, date)),
      holyDay: getHolyDayForDate(date, holyDays),
      moonSymbol: moon.symbol,
      moonLabel: moon.label,
    });
  }

  // Next month padding (fill to complete the grid)
  const remaining = 7 - (days.length % 7);
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(Date.UTC(year, month + 1, i));
      const moon = getMoonPhase(date);
      days.push({
        date,
        inMonth: false,
        isToday: isSameDay(date, today),
        uposatha: uposathaDays.find((u) => isSameDay(u.date, date)),
        holyDay: getHolyDayForDate(date, holyDays),
        moonSymbol: moon.symbol,
        moonLabel: moon.label,
      });
    }
  }

  return days;
}

export default function CalendarView() {
  const now = new Date();
  const [year, setYear] = useState(now.getUTCFullYear());
  const [month, setMonth] = useState(now.getUTCMonth());
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

  const today = useMemo(
    () =>
      new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const uposathaDays = useMemo(() => getUposathaDays(year), [year]);
  const holyDays = useMemo(() => getHolyDaysForYear(year), [year]);

  const days = useMemo(
    () => buildCalendarDays(year, month, uposathaDays, holyDays, today),
    [year, month, uposathaDays, holyDays, today]
  );

  // Events for the current month (for the sidebar list)
  const monthEvents = useMemo(() => {
    const events: { date: Date; label: string; type: string }[] = [];

    for (const u of uposathaDays) {
      if (u.date.getUTCMonth() === month) {
        events.push({ date: u.date, label: u.label, type: "uposatha" });
      }
    }
    for (const h of holyDays) {
      if (h.date.getUTCMonth() === month) {
        events.push({ date: h.date, label: h.name, type: "holy" });
      }
    }

    // Deduplicate by date+label
    const seen = new Set<string>();
    return events
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .filter((e) => {
        const key = `${e.date.toISOString().slice(0, 10)}|${e.label}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }, [uposathaDays, holyDays, month]);

  function prevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
    setSelectedDay(null);
  }

  function nextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
    setSelectedDay(null);
  }

  function goToday() {
    setYear(now.getUTCFullYear());
    setMonth(now.getUTCMonth());
    setSelectedDay(null);
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
      {/* Calendar grid */}
      <div className="flex-1">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg hover:bg-[var(--color-mist)] dark:hover:bg-[var(--card-border)] transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5 text-[var(--foreground)]" />
          </button>

          <div className="text-center">
            <h2
              className="text-xl md:text-2xl font-semibold text-[var(--foreground)]"
              style={{ fontFamily: "var(--font-serif), serif" }}
            >
              {MONTH_NAMES[month]} {year}
            </h2>
            <button
              onClick={goToday}
              className="text-xs text-[var(--color-saffron)] hover:text-[var(--color-saffron-dark)] transition-colors mt-1"
            >
              Today
            </button>
          </div>

          <button
            onClick={nextMonth}
            className="p-2 rounded-lg hover:bg-[var(--color-mist)] dark:hover:bg-[var(--card-border)] transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5 text-[var(--foreground)]" />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-2">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-[var(--color-warm-gray)] uppercase tracking-wider py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-px bg-[var(--card-border)] rounded-xl overflow-hidden">
          {days.map((day, i) => {
            const isUposatha = !!day.uposatha;
            const isHolyDay = !!day.holyDay;
            const isSelected =
              selectedDay && isSameDay(day.date, selectedDay.date);

            return (
              <button
                key={i}
                onClick={() => setSelectedDay(day)}
                className={[
                  "relative p-2 md:p-3 min-h-[60px] md:min-h-[80px]",
                  "text-left transition-colors",
                  day.inMonth
                    ? "bg-[var(--card-bg)]"
                    : "bg-[var(--color-mist)]/50 dark:bg-[var(--card-border)]/30",
                  isSelected
                    ? "ring-2 ring-[var(--color-saffron)] ring-inset"
                    : "",
                  "hover:bg-[var(--color-saffron)]/5",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-label={[
                  `${day.date.getUTCDate()} ${MONTH_NAMES[day.date.getUTCMonth()]} ${day.date.getUTCFullYear()}`,
                  isUposatha ? "Uposatha day" : "",
                  isHolyDay ? day.holyDay!.name : "",
                ]
                  .filter(Boolean)
                  .join(", ")}
              >
                {/* Date number */}
                <span
                  className={[
                    "text-sm font-medium",
                    !day.inMonth
                      ? "text-[var(--color-dharma-tan-light)]"
                      : "text-[var(--foreground)]",
                    day.isToday
                      ? "bg-[var(--color-saffron)] text-white rounded-full w-7 h-7 flex items-center justify-center"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {day.date.getUTCDate()}
                </span>

                {/* Moon symbol for uposatha days */}
                {isUposatha && (
                  <span
                    className="absolute top-2 right-2 text-xs md:text-sm"
                    title={day.moonLabel}
                  >
                    {day.uposatha!.type === "full_moon" ? "\u25CB" : "\u25CF"}
                  </span>
                )}

                {/* Holy day dot */}
                {isHolyDay && (
                  <div className="mt-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--color-saffron)]" />
                    <span className="hidden md:inline text-[10px] text-[var(--color-saffron)] ml-1 leading-tight">
                      {day.holyDay!.name.split("(")[0].trim()}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-[var(--color-warm-gray)]">
          <span className="flex items-center gap-1.5">
            <span className="w-7 h-7 rounded-full bg-[var(--color-saffron)] text-white flex items-center justify-center text-xs font-medium">
              {now.getUTCDate()}
            </span>
            Today
          </span>
          <span className="flex items-center gap-1.5">
            <span>{"\u25CB"}</span> Full Moon (Uposatha)
          </span>
          <span className="flex items-center gap-1.5">
            <span>{"\u25CF"}</span> New Moon (Uposatha)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--color-saffron)]" />
            Holy Day
          </span>
        </div>
      </div>

      {/* Side panel: events list + selected day detail */}
      <aside className="lg:w-80 shrink-0">
        {/* Selected day detail */}
        {selectedDay && (
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5 mb-6">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-1">
              {selectedDay.date.getUTCDate()}{" "}
              {MONTH_NAMES[selectedDay.date.getUTCMonth()]}{" "}
              {selectedDay.date.getUTCFullYear()}
            </h3>
            <p className="text-sm text-[var(--color-warm-gray)] mb-3">
              {selectedDay.moonLabel} {selectedDay.moonSymbol}
            </p>

            {selectedDay.uposatha && (
              <div className="bg-[var(--color-saffron)]/10 rounded-lg p-3 mb-3">
                <p className="text-sm font-medium text-[var(--color-saffron)]">
                  {selectedDay.uposatha.label}
                </p>
                <p className="text-xs text-[var(--color-warm-gray)] mt-1">
                  Observance day for meditation, precepts, and generosity.
                </p>
              </div>
            )}

            {selectedDay.holyDay && (
              <div className="bg-[var(--color-wisdom-blue)]/10 rounded-lg p-3">
                <p className="text-sm font-medium text-[var(--color-wisdom-blue)]">
                  {selectedDay.holyDay.name}
                </p>
                <p className="text-xs text-[var(--color-warm-gray)] mt-1">
                  {selectedDay.holyDay.description}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {selectedDay.holyDay.traditions.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-mist)] dark:bg-[var(--card-border)] text-[var(--color-warm-gray)] capitalize"
                    >
                      {t === "all" ? "All traditions" : t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {!selectedDay.uposatha && !selectedDay.holyDay && (
              <p className="text-sm text-[var(--color-dharma-tan)]">
                No observance days on this date.
              </p>
            )}
          </div>
        )}

        {/* Monthly events list */}
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5">
          <h3
            className="text-base font-semibold text-[var(--foreground)] mb-4"
            style={{ fontFamily: "var(--font-serif), serif" }}
          >
            {MONTH_NAMES[month]} Observances
          </h3>

          {monthEvents.length === 0 ? (
            <p className="text-sm text-[var(--color-dharma-tan)]">
              No observances this month.
            </p>
          ) : (
            <ul className="space-y-3">
              {monthEvents.map((event, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="text-right shrink-0 w-8">
                    <span className="text-sm font-semibold text-[var(--foreground)]">
                      {event.date.getUTCDate()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--foreground)]">
                      {event.label}
                    </p>
                    <p className="text-xs text-[var(--color-warm-gray)]">
                      {event.type === "uposatha"
                        ? "Observance day"
                        : "Holy day"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* iCal feed link */}
        <div className="mt-4 text-center">
          <a
            href="/calendar/feed"
            className="text-xs text-[var(--color-saffron)] hover:text-[var(--color-saffron-dark)] transition-colors underline underline-offset-2"
          >
            Subscribe to iCal feed
          </a>
        </div>
      </aside>
    </div>
  );
}
