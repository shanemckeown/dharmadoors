"use client";

import { useState, useCallback } from "react";
import { SanghaMapDynamic } from "@/components/map";
import { traditionsData, TRADITION_KEYS } from "@/data/traditionsData";
import { MapPin, Search, X, SlidersHorizontal } from "lucide-react";

export interface MapViewProps {
  initialLocation?: [number, number];
  initialQuery?: string;
}

export default function MapView({ initialLocation, initialQuery }: MapViewProps) {
  const [traditionFilter, setTraditionFilter] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState(initialQuery || "");
  const [searchLocation, setSearchLocation] = useState<[number, number] | undefined>(initialLocation);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [locating, setLocating] = useState(false);
  const [searchError, setSearchError] = useState("");

  const toggleTradition = useCallback((key: string) => {
    setTraditionFilter((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const handleNearMe = useCallback(() => {
    setLocating(true);
    setSearchError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSearchLocation([pos.coords.latitude, pos.coords.longitude]);
        setLocating(false);
      },
      () => {
        setSearchError("Location denied. Enter your city instead.");
        setLocating(false);
      },
      { timeout: 10000 }
    );
  }, []);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setSearchError("");

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const results = await res.json();
      if (results.length > 0) {
        setSearchLocation([parseFloat(results[0].lat), parseFloat(results[0].lon)]);
      } else {
        setSearchError(`No results for "${searchQuery}". Try a city name.`);
      }
    } catch {
      setSearchError("Search unavailable — try again");
    }
  }, [searchQuery]);

  return (
    <div className="flex-1 flex overflow-hidden relative">
      {/* Sidebar — desktop */}
      <aside
        className="w-[260px] shrink-0 bg-[var(--card-bg)] border-r border-[var(--card-border)] overflow-y-auto z-30
          hidden lg:block"
      >
        <SidebarContent
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearch={handleSearch}
          searchError={searchError}
          traditionFilter={traditionFilter}
          toggleTradition={toggleTradition}
          onNearMe={handleNearMe}
          locating={locating}
        />
      </aside>

      {/* Mobile filters toggle */}
      <button
        onClick={() => setShowMobileFilters(!showMobileFilters)}
        className="lg:hidden absolute top-2 right-2 z-40 p-2 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] shadow-sm"
        aria-label="Toggle filters"
      >
        <SlidersHorizontal className="w-5 h-5 text-[var(--foreground)]" />
      </button>

      {/* Mobile bottom sheet for filters */}
      {showMobileFilters && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setShowMobileFilters(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-[var(--card-bg)] rounded-t-2xl max-h-[60vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-[var(--card-border)]">
              <h2 className="font-semibold text-[var(--foreground)]">Filters</h2>
              <button onClick={() => setShowMobileFilters(false)}>
                <X className="w-5 h-5 text-[var(--color-warm-gray)]" />
              </button>
            </div>
            <SidebarContent
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSearch={handleSearch}
              searchError={searchError}
              traditionFilter={traditionFilter}
              toggleTradition={toggleTradition}
              onNearMe={handleNearMe}
              locating={locating}
            />
          </div>
        </div>
      )}

      {/* Map */}
      <div className="flex-1 relative">
        <SanghaMapDynamic
          traditionFilter={traditionFilter}
          searchLocation={searchLocation}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sidebar content
// ---------------------------------------------------------------------------
function SidebarContent({
  searchQuery,
  setSearchQuery,
  onSearch,
  searchError,
  traditionFilter,
  toggleTradition,
  onNearMe,
  locating,
}: {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSearch: () => void;
  searchError: string;
  traditionFilter: Set<string>;
  toggleTradition: (key: string) => void;
  onNearMe: () => void;
  locating: boolean;
}) {
  return (
    <div className="p-4 space-y-5">
      <div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-dharma-tan)]" />
          <input
            type="text"
            placeholder="Search city or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
            className="w-full pl-10 pr-4 py-2.5
              border border-[var(--card-border)] rounded-lg
              bg-[var(--background)] text-[var(--foreground)]
              placeholder-[var(--color-dharma-tan)]
              focus:border-[var(--color-saffron)]/60 focus:ring-2 focus:ring-[var(--color-saffron)]/10
              transition-colors text-sm"
          />
        </div>
        {searchError && (
          <p className="text-xs text-red-600 mt-1">{searchError}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--color-warm-gray)] mb-2 uppercase tracking-wider">
          Traditions
        </label>
        <div className="flex flex-wrap gap-1.5">
          {TRADITION_KEYS.map((key) => {
            const t = traditionsData[key];
            const active = traditionFilter.has(key);
            return (
              <button
                key={key}
                onClick={() => toggleTradition(key)}
                role="checkbox"
                aria-checked={active}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors min-h-[36px]"
                style={
                  active
                    ? { backgroundColor: t.color, color: "white" }
                    : {
                        border: `1.5px solid ${t.color}`,
                        color: t.color,
                        backgroundColor: "transparent",
                      }
                }
              >
                {t.label}
              </button>
            );
          })}
        </div>
        {traditionFilter.size > 0 && (
          <button
            onClick={() =>
              TRADITION_KEYS.forEach((k) => {
                if (traditionFilter.has(k)) toggleTradition(k);
              })
            }
            className="text-xs text-[var(--color-warm-gray)] hover:text-[var(--foreground)] mt-2 transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      <button
        onClick={onNearMe}
        disabled={locating}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5
          bg-[var(--color-mist)] dark:bg-[var(--card-border)]
          hover:bg-[var(--color-dharma-tan-light)]/50
          text-[var(--foreground)] rounded-lg font-medium text-sm
          transition-all duration-200 min-h-[44px]"
      >
        <MapPin className="w-4 h-4" />
        {locating ? "Finding..." : "Near Me"}
      </button>

      <div className="pt-4 border-t border-[var(--card-border)]">
        <p className="text-xs text-[var(--color-dharma-tan)]">
          Data from{" "}
          <a
            href="https://www.openstreetmap.org"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-[var(--color-saffron)]"
          >
            OpenStreetMap
          </a>
        </p>
      </div>
    </div>
  );
}
