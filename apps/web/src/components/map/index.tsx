"use client";

import dynamic from "next/dynamic";
import type { SanghaMapProps } from "./SanghaMap";

// Dynamic import to avoid SSR issues with Leaflet
export const SanghaMapDynamic = dynamic<SanghaMapProps>(
  () => import("./SanghaMap"),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-[#F5F3EF] dark:bg-[#1A1714] animate-pulse flex items-center justify-center">
        <span className="text-[#6B6358]">Loading map...</span>
      </div>
    ),
  }
);
