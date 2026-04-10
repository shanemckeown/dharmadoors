"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X } from "lucide-react";
import { MoonPhaseSvg } from "./MoonPhaseSvg";
import { getMoonPhase } from "@/lib/moonPhase";
import { recordSession } from "@/lib/streak";

const DURATIONS = [5, 10, 15, 20, 30, 45];
const BELLS = [
  { id: "bowl", label: "Singing Bowl" },
  { id: "bell", label: "Temple Bell" },
  { id: "silence", label: "Silence" },
] as const;

type BellId = (typeof BELLS)[number]["id"];
type TimerState = "setup" | "running" | "paused" | "complete";

interface MeditationTimerProps {
  onClose: () => void;
}

export function MeditationTimer({ onClose }: MeditationTimerProps) {
  const [duration, setDuration] = useState(() => {
    try {
      return parseInt(localStorage.getItem("dd-timer-duration") || "15", 10);
    } catch {
      return 15;
    }
  });
  const [bell, setBell] = useState<BellId>(() => {
    try {
      return (localStorage.getItem("dd-timer-bell") as BellId) || "bowl";
    } catch {
      return "bowl";
    }
  });
  const [state, setState] = useState<TimerState>("setup");
  const [remaining, setRemaining] = useState(0);
  const startTimeRef = useRef(0);
  const totalMsRef = useRef(0);
  const pausedElapsedRef = useRef(0);
  const frameRef = useRef<number>(0);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const moonPhase = getMoonPhase(new Date());

  // Save preferences
  useEffect(() => {
    try {
      localStorage.setItem("dd-timer-duration", String(duration));
      localStorage.setItem("dd-timer-bell", bell);
    } catch { /* ok */ }
  }, [duration, bell]);

  // Timer loop using timestamps (survives tab throttling)
  const tick = useCallback(() => {
    if (state !== "running") return;

    const elapsed = Date.now() - startTimeRef.current + pausedElapsedRef.current;
    const remain = Math.max(0, totalMsRef.current - elapsed);
    setRemaining(remain);

    if (remain <= 0) {
      setState("complete");
      recordSession();
      releaseWakeLock();
      // Bell sound would play here
      return;
    }

    frameRef.current = requestAnimationFrame(tick);
  }, [state]);

  useEffect(() => {
    if (state === "running") {
      frameRef.current = requestAnimationFrame(tick);
    }
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [state, tick]);

  async function acquireWakeLock() {
    try {
      if ("wakeLock" in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request("screen");
      }
    } catch { /* not supported or denied */ }
  }

  function releaseWakeLock() {
    wakeLockRef.current?.release();
    wakeLockRef.current = null;
  }

  function startTimer() {
    totalMsRef.current = duration * 60 * 1000;
    startTimeRef.current = Date.now();
    pausedElapsedRef.current = 0;
    setRemaining(totalMsRef.current);
    setState("running");
    acquireWakeLock();
  }

  function pauseTimer() {
    const elapsed = Date.now() - startTimeRef.current + pausedElapsedRef.current;
    pausedElapsedRef.current = elapsed;
    setState("paused");
    releaseWakeLock();
  }

  function resumeTimer() {
    startTimeRef.current = Date.now();
    setState("running");
    acquireWakeLock();
  }

  function handleScreenTap() {
    if (state === "running") pauseTimer();
    else if (state === "paused") resumeTimer();
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => releaseWakeLock();
  }, []);

  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  return (
    <div className="fixed inset-0 z-50 bg-[var(--background)] flex flex-col">
      {/* Close button */}
      <button
        onClick={() => {
          releaseWakeLock();
          onClose();
        }}
        className="absolute top-4 left-4 p-3 rounded-full
          text-[var(--color-warm-gray)] opacity-50 hover:opacity-100
          transition-opacity z-10"
        aria-label="Close timer"
      >
        <X className="w-6 h-6" />
      </button>

      {state === "setup" && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 max-w-md mx-auto w-full">
          {/* Moon */}
          <div className="mb-8 opacity-40">
            <MoonPhaseSvg phase={moonPhase.name} size={64} />
          </div>

          <h2
            className="text-2xl font-light text-[var(--foreground)] mb-8"
            style={{ fontFamily: "var(--font-serif), serif" }}
          >
            Sit
          </h2>

          {/* Duration selector */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {DURATIONS.map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className="px-5 py-2.5 rounded-full text-sm font-medium transition-colors min-h-[44px]"
                style={
                  d === duration
                    ? { backgroundColor: "var(--color-saffron)", color: "white" }
                    : {
                        border: "1.5px solid var(--color-dharma-tan-light)",
                        color: "var(--color-dharma-tan-dark)",
                        backgroundColor: "transparent",
                      }
                }
              >
                {d} min
              </button>
            ))}
          </div>

          {/* Bell selector */}
          <div className="flex gap-2 mb-10">
            {BELLS.map((b) => (
              <button
                key={b.id}
                onClick={() => setBell(b.id)}
                className="px-4 py-2 rounded-lg text-xs font-medium transition-colors min-h-[40px]"
                style={
                  b.id === bell
                    ? {
                        backgroundColor: "var(--color-saffron)",
                        color: "white",
                        opacity: 0.9,
                      }
                    : {
                        color: "var(--color-warm-gray)",
                        backgroundColor: "var(--color-mist)",
                      }
                }
              >
                {b.label}
              </button>
            ))}
          </div>

          {/* Start button */}
          <button
            onClick={startTimer}
            className="w-20 h-20 rounded-full bg-[var(--color-saffron)]
              hover:bg-[var(--color-saffron-dark)]
              text-white flex items-center justify-center
              transition-all duration-200
              hover:scale-105 active:scale-95
              shadow-lg"
            aria-label="Start meditation"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="8,5 19,12 8,19" />
            </svg>
          </button>
        </div>
      )}

      {(state === "running" || state === "paused") && (
        <div
          className="flex-1 flex flex-col items-center justify-center cursor-pointer select-none"
          onClick={handleScreenTap}
          role="button"
          aria-label={state === "running" ? "Tap to pause" : "Tap to resume"}
        >
          {/* Ambient moon */}
          <div className="mb-12 opacity-15">
            <MoonPhaseSvg phase={moonPhase.name} size={64} />
          </div>

          {/* Time display */}
          <div className={state === "running" ? "timer-pulse" : ""}>
            <p
              className="text-6xl md:text-8xl font-light text-[var(--foreground)] tracking-wider tabular-nums"
              style={{ fontFamily: "var(--font-serif), serif" }}
            >
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </p>
          </div>

          <p className="mt-6 text-sm text-[var(--color-warm-gray)]">
            {state === "paused" ? "Paused — tap to resume" : `Sitting · ${duration} min`}
          </p>
        </div>
      )}

      {state === "complete" && (
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="mb-6 opacity-30">
            <MoonPhaseSvg phase={moonPhase.name} size={48} />
          </div>

          <h2
            className="text-3xl font-light text-[var(--foreground)] mb-2"
            style={{ fontFamily: "var(--font-serif), serif" }}
          >
            Session complete
          </h2>

          <p className="text-base text-[var(--color-warm-gray)] mb-10">
            {duration} minutes of practice
          </p>

          <button
            onClick={onClose}
            className="px-8 py-3 rounded-xl
              bg-[var(--color-saffron)] hover:bg-[var(--color-saffron-dark)]
              text-white font-medium text-base
              transition-colors"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
