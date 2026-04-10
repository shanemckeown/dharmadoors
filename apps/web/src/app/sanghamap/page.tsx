"use client";

import Link from "next/link";
import { useState, useCallback, useEffect, useRef, Suspense, startTransition } from "react";
import { useSearchParams } from "next/navigation";
import { traditionsData, TRADITION_KEYS } from "@/data/traditionsData";
import { ChevronRight, MapPin, Search, X, SlidersHorizontal } from "lucide-react";

export default function SanghaMapPage() {
  return (
    <Suspense>
      <SanghaMapInner />
    </Suspense>
  );
}

function SanghaMapInner() {
  const searchParams = useSearchParams();
  const [traditionFilter, setTraditionFilter] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState<[number, number] | undefined>();
  const [mapReady, setMapReady] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [locating, setLocating] = useState(false);
  const [searchError, setSearchError] = useState("");
  const initialSearchDone = useRef(false);

  // Handle ?q= param from homepage search
  useEffect(() => {
    if (initialSearchDone.current) return;
    const q = searchParams.get("q");
    if (q) {
      initialSearchDone.current = true;
      fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`,
        { headers: { "Accept-Language": "en" } }
      )
        .then(res => res.json())
        .then(results => {
          startTransition(() => {
            setSearchQuery(q);
            if (results.length > 0) {
              setSearchLocation([parseFloat(results[0].lat), parseFloat(results[0].lon)]);
              setMapReady(true);
            } else {
              setSearchError(`No results for "${q}". Try a city name.`);
            }
          });
        })
        .catch(() => startTransition(() => {
          setSearchQuery(q);
          setSearchError("Search unavailable");
        }));
    }
  }, [searchParams]);

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
        setMapReady(true);
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
        setMapReady(true);
      } else {
        setSearchError(`No results for "${searchQuery}". Try a city name.`);
      }
    } catch {
      setSearchError("Search unavailable — try again");
    }
  }, [searchQuery]);

  const handleExplore = useCallback(() => {
    setMapReady(true);
  }, []);

  // Map is only loaded AFTER the user provides a location or clicks "explore"
  const showPrompt = !mapReady;

  return (
    <div className="h-screen flex flex-col bg-[var(--background)]">
      {/* Header */}
      <header className="bg-[var(--card-bg)]/95 backdrop-blur-sm border-b border-[var(--card-border)] z-40 shrink-0">
        <div className="px-4 py-2.5 flex items-center justify-between">
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/"
              className="text-[var(--color-warm-gray)] hover:text-[var(--foreground)] transition-colors"
            >
              DharmaDoors
            </Link>
            <ChevronRight className="w-4 h-4 text-[var(--color-mist)]" />
            <span className="text-[var(--foreground)] font-medium">SanghaMap</span>
          </nav>

          {/* Mobile filter toggle — only when map is showing */}
          {!showPrompt && (
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden p-2 rounded-lg bg-[var(--color-mist)] dark:bg-[var(--card-border)]"
              aria-label="Toggle filters"
            >
              <SlidersHorizontal className="w-5 h-5 text-[var(--foreground)]" />
            </button>
          )}
        </div>
      </header>

      {showPrompt ? (
        /* ---- Location prompt (no map loaded yet, page is lightweight) ---- */
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="w-14 h-14 rounded-2xl bg-[var(--color-saffron)]/10 flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-7 h-7 text-[var(--color-saffron)]" />
            </div>

            <h2
              className="text-2xl font-semibold text-[var(--foreground)] mb-2"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Find sangha near you
            </h2>
            <p className="text-sm text-[var(--color-warm-gray)] mb-8">
              69,000+ Buddhist centers across all traditions worldwide
            </p>

            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-dharma-tan)]" />
              <input
                type="text"
                placeholder="City or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-11 pr-4 py-3
                  border border-[var(--card-border)] rounded-xl
                  bg-[var(--card-bg)] text-[var(--foreground)]
                  placeholder-[var(--color-dharma-tan)]
                  focus:border-[var(--color-saffron)]/60 focus:ring-2 focus:ring-[var(--color-saffron)]/10
                  transition-colors text-base"
                autoFocus
              />
            </div>

            {searchError && (
              <p className="text-sm text-red-600 mb-3">{searchError}</p>
            )}

            <button
              onClick={handleSearch}
              disabled={!searchQuery.trim()}
              className="w-full py-3 bg-[var(--color-saffron)] hover:bg-[var(--color-saffron-dark)]
                disabled:opacity-40
                text-white rounded-xl font-medium text-base
                transition-colors mb-3"
            >
              Search
            </button>

            <button
              onClick={handleNearMe}
              disabled={locating}
              className="w-full py-2.5 bg-[var(--color-mist)] dark:bg-[var(--card-border)]
                hover:bg-[var(--color-dharma-tan-light)]/50
                text-[var(--foreground)] rounded-xl font-medium text-sm
                transition-colors flex items-center justify-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              {locating ? "Finding your location..." : "Use my location"}
            </button>

            <button
              onClick={handleExplore}
              className="mt-6 text-sm text-[var(--color-warm-gray)] hover:text-[var(--foreground)] transition-colors"
            >
              Just explore the map
            </button>
          </div>
        </div>
      ) : (
        /* ---- Map view (Leaflet loads here, only after user action) ---- */
        <MapView
          traditionFilter={traditionFilter}
          searchLocation={searchLocation}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSearch={handleSearch}
          searchError={searchError}
          toggleTradition={toggleTradition}
          handleNearMe={handleNearMe}
          locating={locating}
          showMobileFilters={showMobileFilters}
          setShowMobileFilters={setShowMobileFilters}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// MapView — only rendered after user provides location or clicks "explore"
// This is where Leaflet gets imported (via dynamic import in SanghaMapDynamic)
// ---------------------------------------------------------------------------
import { SanghaMapDynamic } from "@/components/map";

function MapView({
  traditionFilter,
  searchLocation,
  searchQuery,
  setSearchQuery,
  handleSearch,
  searchError,
  toggleTradition,
  handleNearMe,
  locating,
  showMobileFilters,
  setShowMobileFilters,
}: {
  traditionFilter: Set<string>;
  searchLocation?: [number, number];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  handleSearch: () => void;
  searchError: string;
  toggleTradition: (key: string) => void;
  handleNearMe: () => void;
  locating: boolean;
  showMobileFilters: boolean;
  setShowMobileFilters: (show: boolean) => void;
}) {
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
// Sidebar content (shared between desktop sidebar and mobile bottom sheet)
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
      {/* Search */}
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

      {/* Tradition filter chips */}
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

      {/* Near Me */}
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

      {/* Data attribution */}
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
