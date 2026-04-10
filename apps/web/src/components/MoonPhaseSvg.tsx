import type { MoonPhaseName } from "@/lib/moonPhase";

interface MoonPhaseSvgProps {
  phase: MoonPhaseName;
  size?: number;
  className?: string;
}

/**
 * Soft, woodblock-print style moon phase illustration.
 * Full moon gets a subtle peaceful face (closed eyes + gentle smile).
 * Uses brand colors: cream for illuminated side, dharma-tan for shadow.
 */
export function MoonPhaseSvg({ phase, size = 32, className = "" }: MoonPhaseSvgProps) {
  const r = 44; // moon radius within 100x100 viewBox
  const cx = 50;
  const cy = 50;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`moon-phase-svg ${className}`}
      aria-label={LABELS[phase]}
      role="img"
    >
      <defs>
        <clipPath id={`moon-clip-${phase}-${size}`}>
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
      </defs>

      {/* Base: full circle outline */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="var(--moon-bg, #F5F3EF)"
        stroke="var(--color-dharma-tan-light, #B8A896)"
        strokeWidth="1.5"
      />

      {/* Shadow overlay based on phase */}
      <g clipPath={`url(#moon-clip-${phase}-${size})`}>
        {getShadowPath(phase, cx, cy, r)}
      </g>

      {/* Full moon face: only when full */}
      {phase === "full_moon" && (
        <g className="moon-face" opacity="0.35">
          {/* Left eye (closed, gentle curve) */}
          <path
            d="M36,44 Q39,41 42,44"
            fill="none"
            stroke="var(--color-dharma-tan, #A09078)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Right eye */}
          <path
            d="M58,44 Q61,41 64,44"
            fill="none"
            stroke="var(--color-dharma-tan, #A09078)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Gentle smile */}
          <path
            d="M43,56 Q50,61 57,56"
            fill="none"
            stroke="var(--color-dharma-tan, #A09078)"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </g>
      )}

      {/* Subtle inner glow for new moon */}
      {phase === "new_moon" && (
        <circle
          cx={cx}
          cy={cy}
          r={r - 8}
          fill="var(--color-dharma-tan-light, #B8A896)"
          opacity="0.08"
        />
      )}
    </svg>
  );
}

const LABELS: Record<MoonPhaseName, string> = {
  new_moon: "New Moon",
  waxing_crescent: "Waxing Crescent",
  first_quarter: "First Quarter",
  waxing_gibbous: "Waxing Gibbous",
  full_moon: "Full Moon",
  waning_gibbous: "Waning Gibbous",
  last_quarter: "Last Quarter",
  waning_crescent: "Waning Crescent",
};

/**
 * Generates the shadow overlay path for each moon phase.
 * Uses an ellipse-based approach: the terminator (light/dark boundary)
 * is modeled as a vertical ellipse whose x-radius varies with phase.
 */
function getShadowPath(
  phase: MoonPhaseName,
  cx: number,
  cy: number,
  r: number,
) {
  const shadowColor = "var(--color-dharma-tan, #A09078)";
  const shadowOpacity = 0.3;

  switch (phase) {
    case "new_moon":
      // Fully dark
      return (
        <circle cx={cx} cy={cy} r={r} fill={shadowColor} opacity={shadowOpacity} />
      );

    case "full_moon":
      // No shadow
      return null;

    case "waxing_crescent": {
      // Shadow covers most, small crescent of light on right
      // Shadow from left edge, terminator curves right of center
      const tx = r * 0.6; // terminator x-radius
      return (
        <path
          d={`M${cx},${cy - r} A${r},${r} 0 1,0 ${cx},${cy + r} A${tx},${r} 0 0,1 ${cx},${cy - r}`}
          fill={shadowColor}
          opacity={shadowOpacity}
        />
      );
    }

    case "first_quarter": {
      // Left half dark
      return (
        <path
          d={`M${cx},${cy - r} A${r},${r} 0 1,0 ${cx},${cy + r} L${cx},${cy - r}`}
          fill={shadowColor}
          opacity={shadowOpacity}
        />
      );
    }

    case "waxing_gibbous": {
      // Small shadow on left
      const tx = r * 0.6;
      return (
        <path
          d={`M${cx},${cy - r} A${r},${r} 0 1,0 ${cx},${cy + r} A${tx},${r} 0 0,0 ${cx},${cy - r}`}
          fill={shadowColor}
          opacity={shadowOpacity}
        />
      );
    }

    case "waning_gibbous": {
      // Small shadow on right
      const tx = r * 0.6;
      return (
        <path
          d={`M${cx},${cy - r} A${r},${r} 0 1,1 ${cx},${cy + r} A${tx},${r} 0 0,1 ${cx},${cy - r}`}
          fill={shadowColor}
          opacity={shadowOpacity}
        />
      );
    }

    case "last_quarter": {
      // Right half dark
      return (
        <path
          d={`M${cx},${cy - r} A${r},${r} 0 1,1 ${cx},${cy + r} L${cx},${cy - r}`}
          fill={shadowColor}
          opacity={shadowOpacity}
        />
      );
    }

    case "waning_crescent": {
      // Shadow covers most, small crescent of light on left
      const tx = r * 0.6;
      return (
        <path
          d={`M${cx},${cy - r} A${r},${r} 0 1,1 ${cx},${cy + r} A${tx},${r} 0 0,0 ${cx},${cy - r}`}
          fill={shadowColor}
          opacity={shadowOpacity}
        />
      );
    }
  }
}
