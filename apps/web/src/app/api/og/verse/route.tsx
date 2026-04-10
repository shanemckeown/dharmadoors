import { ImageResponse } from "next/og";
import { getVerseByNumber, getDailyVerse } from "@/lib/dailyVerse";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const numParam = searchParams.get("v");
  const verse = numParam
    ? getVerseByNumber(parseInt(numParam, 10))
    : getDailyVerse();

  if (!verse) {
    return new Response("Verse not found", { status: 404 });
  }

  // Truncate long verses for OG card
  const maxLen = 280;
  const text =
    verse.text.length > maxLen
      ? verse.text.slice(0, maxLen).replace(/\s+\S*$/, "") + "..."
      : verse.text;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F5F3EF",
          padding: "60px 80px",
          position: "relative",
        }}
      >
        {/* Left accent bar */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: "6px",
            backgroundColor: "#E97116",
          }}
        />

        {/* Logo top-right */}
        <div
          style={{
            position: "absolute",
            top: 40,
            right: 60,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span
            style={{
              fontSize: 20,
              color: "#A09078",
              fontWeight: 400,
            }}
          >
            DharmaDoors
          </span>
        </div>

        {/* Verse text */}
        <p
          style={{
            fontSize: 36,
            color: "#3D3629",
            textAlign: "center",
            lineHeight: 1.6,
            maxWidth: "900px",
            fontStyle: "italic",
          }}
        >
          &ldquo;{text}&rdquo;
        </p>

        {/* Bottom info */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            left: 80,
            right: 80,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: 16,
              color: "#A09078",
            }}
          >
            Dhammapada {verse.chapterNumber}:{verse.verseNumber} &middot;{" "}
            {verse.chapterTitle}
          </span>
          <span
            style={{
              fontSize: 14,
              color: "#B8A896",
            }}
          >
            dharmadoors.org
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
