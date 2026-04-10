"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useState, useCallback, useEffect, useRef, Suspense, startTransition } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronRight, MapPin, Search } from "lucide-react";

// Lazy-load the entire map view (includes Leaflet, clustering, etc.)
// This chunk won't download until mapReady becomes true.
const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-[var(--background)]">
      <p className="text-sm text-[var(--color-warm-gray)]">Loading map...</p>
    </div>
  ),
});

export default function SanghaMapPage() {
  return (
    <Suspense>
      <SanghaMapInner />
    </Suspense>
  );
}

function SanghaMapInner() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState<[number, number] | undefined>();
  const [mapReady, setMapReady] = useState(false);
  const [locating, setLocating] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const initialSearchDone = useRef(false);

  // Handle ?q= param from homepage search
  useEffect(() => {
    if (initialSearchDone.current) return;
    const q = searchParams.get("q");
    if (q) {
      initialSearchDone.current = true;
      setSearchQuery(q);
      setSearching(true);
      fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`,
        { headers: { "Accept-Language": "en" } }
      )
        .then(res => res.json())
        .then(results => {
          startTransition(() => {
            setSearching(false);
            if (results.length > 0) {
              setSearchLocation([parseFloat(results[0].lat), parseFloat(results[0].lon)]);
              setMapReady(true);
            } else {
              setSearchError(`No results for "${q}". Try a city name.`);
            }
          });
        })
        .catch(() => startTransition(() => {
          setSearching(false);
          setSearchError("Search unavailable");
        }));
    }
  }, [searchParams]);

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
    setSearching(true);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const results = await res.json();
      setSearching(false);
      if (results.length > 0) {
        setSearchLocation([parseFloat(results[0].lat), parseFloat(results[0].lon)]);
        setMapReady(true);
      } else {
        setSearchError(`No results for "${searchQuery}". Try a city name.`);
      }
    } catch {
      setSearching(false);
      setSearchError("Search unavailable — try again");
    }
  }, [searchQuery]);

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
        </div>
      </header>

      {!mapReady ? (
        /* ---- Lightweight search prompt (no Leaflet JS loaded) ---- */
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
              disabled={!searchQuery.trim() || searching}
              className="w-full py-3 bg-[var(--color-saffron)] hover:bg-[var(--color-saffron-dark)]
                disabled:opacity-40
                text-white rounded-xl font-medium text-base
                transition-colors mb-3"
            >
              {searching ? "Searching..." : "Search"}
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
              onClick={() => setMapReady(true)}
              className="mt-6 text-sm text-[var(--color-warm-gray)] hover:text-[var(--foreground)] transition-colors"
            >
              Just explore the map
            </button>
          </div>
        </div>
      ) : (
        /* ---- Map (Leaflet loads NOW, not before) ---- */
        <MapView
          initialLocation={searchLocation}
          initialQuery={searchQuery}
        />
      )}
    </div>
  );
}
