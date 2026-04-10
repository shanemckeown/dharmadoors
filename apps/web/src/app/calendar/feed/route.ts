import { NextResponse } from "next/server";
import { getUposathaDays } from "@/lib/moonPhase";
import { getHolyDaysForYear } from "@/data/buddhistHolyDays";

function formatICalDate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function generateUID(name: string, date: Date): string {
  const dateStr = formatICalDate(date);
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return `${dateStr}-${slug}@dharmadoors.org`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const yearParam = url.searchParams.get("year");
  const now = new Date();
  const currentYear = now.getUTCFullYear();

  const years = yearParam
    ? [parseInt(yearParam, 10)]
    : [currentYear, currentYear + 1];

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//DharmaDoors//Buddhist Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Buddhist Calendar (DharmaDoors)",
    "X-WR-TIMEZONE:UTC",
  ];

  for (const year of years) {
    const uposathaDays = getUposathaDays(year);
    for (const u of uposathaDays) {
      const dateStr = formatICalDate(u.date);
      const nextDay = new Date(u.date.getTime() + 24 * 60 * 60 * 1000);
      const endStr = formatICalDate(nextDay);

      lines.push("BEGIN:VEVENT");
      lines.push(`UID:${generateUID(u.label, u.date)}`);
      lines.push(`DTSTART;VALUE=DATE:${dateStr}`);
      lines.push(`DTEND;VALUE=DATE:${endStr}`);
      lines.push(`SUMMARY:${escapeICalText(u.label)}`);
      lines.push(
        `DESCRIPTION:${escapeICalText(
          (u.type === "full_moon" ? "Full Moon" : "New Moon") +
            " observance day. A time for meditation, keeping precepts, and generosity."
        )}`
      );
      lines.push("CATEGORIES:Uposatha");
      lines.push("TRANSP:TRANSPARENT");
      lines.push("END:VEVENT");
    }

    const holyDays = getHolyDaysForYear(year);
    for (const h of holyDays) {
      const dateStr = formatICalDate(h.date);
      const nextDay = new Date(h.date.getTime() + 24 * 60 * 60 * 1000);
      const endStr = formatICalDate(nextDay);

      lines.push("BEGIN:VEVENT");
      lines.push(`UID:${generateUID(h.name, h.date)}`);
      lines.push(`DTSTART;VALUE=DATE:${dateStr}`);
      lines.push(`DTEND;VALUE=DATE:${endStr}`);
      lines.push(`SUMMARY:${escapeICalText(h.name)}`);
      lines.push(`DESCRIPTION:${escapeICalText(h.description)}`);
      lines.push(
        `CATEGORIES:${h.traditions
          .map((t) =>
            t === "all"
              ? "Buddhist"
              : t.charAt(0).toUpperCase() + t.slice(1)
          )
          .join(",")}`
      );
      lines.push("TRANSP:TRANSPARENT");
      lines.push("END:VEVENT");
    }
  }

  lines.push("END:VCALENDAR");

  const ical = lines.join("\r\n");

  return new NextResponse(ical, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="buddhist-calendar.ics"',
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
