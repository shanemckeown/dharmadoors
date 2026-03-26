"use client";

import { useState, useEffect } from "react";
import { Type, Contrast, ALargeSmall } from "lucide-react";

type FontSize = "sm" | "md" | "lg" | "xl";
type FontFamily = "sans" | "serif";

const FONT_SIZES: Record<FontSize, string> = {
  sm: "16px",
  md: "18px",
  lg: "20px",
  xl: "24px",
};

const FONT_SIZE_LABELS: Record<FontSize, string> = {
  sm: "S",
  md: "M",
  lg: "L",
  xl: "XL",
};

interface AccessibilitySettings {
  fontSize: FontSize;
  fontFamily: FontFamily;
  highContrast: boolean;
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  fontSize: "md",
  fontFamily: "serif",
  highContrast: false,
};

export function AccessibilityControls() {
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS);
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("dhammapada-accessibility");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as AccessibilitySettings;
        setSettings(parsed);
        applySettings(parsed);
      } catch {
        applySettings(DEFAULT_SETTINGS);
      }
    } else {
      applySettings(DEFAULT_SETTINGS);
    }
  }, []);

  // Apply settings to document
  const applySettings = (s: AccessibilitySettings) => {
    document.documentElement.style.setProperty("--reading-font-size", FONT_SIZES[s.fontSize]);
    document.documentElement.classList.toggle("high-contrast", s.highContrast);
    document.documentElement.classList.toggle("reading-serif", s.fontFamily === "serif");
    document.documentElement.classList.toggle("reading-sans", s.fontFamily === "sans");
  };

  // Update and persist settings
  const updateSettings = (updates: Partial<AccessibilitySettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    applySettings(newSettings);
    localStorage.setItem("dhammapada-accessibility", JSON.stringify(newSettings));
  };

  // Cycle through font sizes
  const cycleFontSize = () => {
    const sizes: FontSize[] = ["sm", "md", "lg", "xl"];
    const currentIndex = sizes.indexOf(settings.fontSize);
    const nextIndex = (currentIndex + 1) % sizes.length;
    updateSettings({ fontSize: sizes[nextIndex] });
  };

  // Toggle font family
  const toggleFontFamily = () => {
    updateSettings({ fontFamily: settings.fontFamily === "serif" ? "sans" : "serif" });
  };

  // Toggle high contrast
  const toggleHighContrast = () => {
    updateSettings({ highContrast: !settings.highContrast });
  };

  // Avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="flex items-center gap-1">
        <div className="w-10 h-10 rounded-lg bg-[var(--card-bg)]" />
        <div className="w-10 h-10 rounded-lg bg-[var(--card-bg)]" />
        <div className="w-10 h-10 rounded-lg bg-[var(--card-bg)]" />
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Toggle button for mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 rounded-lg
          bg-[var(--card-bg)] border border-[var(--card-border)]
          hover:border-[var(--color-saffron)]/40
          transition-colors duration-200"
        aria-label="Accessibility settings"
        aria-expanded={isOpen}
      >
        <ALargeSmall className="w-5 h-5 text-[var(--color-warm-gray)]" />
      </button>

      {/* Controls - always visible on desktop, toggle on mobile */}
      <div
        className={`
          ${isOpen ? "flex" : "hidden"} md:flex
          absolute md:relative right-0 top-12 md:top-0
          flex-col md:flex-row items-stretch md:items-center gap-1
          p-2 md:p-0
          bg-[var(--card-bg)] md:bg-transparent
          border border-[var(--card-border)] md:border-none
          rounded-lg md:rounded-none
          shadow-lg md:shadow-none
          z-50
        `}
      >
        {/* Font Size Control */}
        <button
          onClick={cycleFontSize}
          className="flex items-center gap-2 px-3 py-2 rounded-lg
            bg-[var(--card-bg)] border border-[var(--card-border)]
            hover:border-[var(--color-saffron)]/40
            transition-colors duration-200
            text-sm font-medium"
          aria-label={`Font size: ${FONT_SIZE_LABELS[settings.fontSize]}. Click to change.`}
          title="Change font size"
        >
          <Type className="w-4 h-4 text-[var(--color-warm-gray)]" />
          <span className="text-[var(--foreground)] min-w-[24px]">
            {FONT_SIZE_LABELS[settings.fontSize]}
          </span>
        </button>

        {/* Font Family Toggle */}
        <button
          onClick={toggleFontFamily}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg
            border transition-colors duration-200
            text-sm font-medium
            ${
              settings.fontFamily === "serif"
                ? "bg-[var(--color-saffron)]/10 border-[var(--color-saffron)]/40 text-[var(--color-saffron)]"
                : "bg-[var(--card-bg)] border-[var(--card-border)] hover:border-[var(--color-saffron)]/40"
            }`}
          aria-label={`Font: ${settings.fontFamily === "serif" ? "Serif" : "Sans-serif"}. Click to toggle.`}
          title="Toggle serif/sans-serif font"
        >
          <span
            className={`text-base ${settings.fontFamily === "serif" ? "font-serif" : "font-sans"}`}
          >
            Aa
          </span>
        </button>

        {/* High Contrast Toggle */}
        <button
          onClick={toggleHighContrast}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg
            border transition-colors duration-200
            text-sm font-medium
            ${
              settings.highContrast
                ? "bg-[var(--color-saffron)]/10 border-[var(--color-saffron)]/40 text-[var(--color-saffron)]"
                : "bg-[var(--card-bg)] border-[var(--card-border)] hover:border-[var(--color-saffron)]/40"
            }`}
          aria-label={`High contrast: ${settings.highContrast ? "On" : "Off"}. Click to toggle.`}
          title="Toggle high contrast mode"
        >
          <Contrast className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
