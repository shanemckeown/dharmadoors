"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { MapCenter } from "@/lib/mapTypes";
import { loadCentersInViewport } from "@/lib/geoLoader";
import { getTradition, traditionsData } from "@/data/traditionsData";
import {
  ChevronDown,
  ChevronUp,
  Phone,
  Globe,
  Navigation,
  Share2,
  AlertTriangle,
  Check,
} from "lucide-react";

// Tradition colors (from traditionsData)
const TRADITION_COLORS: Record<string, string> = Object.fromEntries(
  Object.entries(traditionsData).map(([key, data]) => [key, data.color])
);

// Minimum zoom level before loading center data.
// Below this, the viewport is too large and loading would pull in too many markers.
// Zoom 9 ≈ metro area; zoom 7 can span entire countries (Japan = 25K markers).
const MIN_DATA_ZOOM = 9;

// Maximum markers to render at once. Beyond this, clustering still chokes the browser.
const MAX_RENDERED_MARKERS = 2000;

// Cache marker icons to avoid recreating DivIcons on every render
const iconCache = new Map<string, L.DivIcon>();

/**
 * Create a custom SVG teardrop marker icon for a tradition.
 * Cached by tradition + visited key.
 */
function createTraditionIcon(tradition: string, isVisited: boolean): L.DivIcon {
  const cacheKey = `${tradition}-${isVisited}`;
  const cached = iconCache.get(cacheKey);
  if (cached) return cached;

  const color = TRADITION_COLORS[tradition] || "#6B7280";
  const visitedDot = isVisited
    ? `<circle cx="20" cy="28" r="5" fill="#E97116" stroke="white" stroke-width="1.5"/><polyline points="17,28 19,30 23,26" stroke="white" stroke-width="1.5" fill="none"/>`
    : "";

  const icon = L.divIcon({
    html: `<svg width="28" height="40" viewBox="0 0 28 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 0C6.3 0 0 6.3 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.3 21.7 0 14 0z" fill="${color}" stroke="white" stroke-width="1.5"/>
      <circle cx="14" cy="14" r="6" fill="white" opacity="0.9"/>
      ${visitedDot}
    </svg>`,
    className: "tradition-marker",
    iconSize: [28, 40],
    iconAnchor: [14, 40],
    popupAnchor: [0, -40],
  });

  iconCache.set(cacheKey, icon);
  return icon;
}

/**
 * Custom cluster icon showing count with dominant tradition color.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createClusterIcon(cluster: any): L.DivIcon {
  const count = cluster.getChildCount() as number;
  const markers = cluster.getAllChildMarkers() as L.Marker[];

  // Find dominant tradition
  const traditionCounts: Record<string, number> = {};
  markers.forEach((m: L.Marker) => {
    const tradition = (m.options as { tradition?: string }).tradition || "other";
    traditionCounts[tradition] = (traditionCounts[tradition] || 0) + 1;
  });

  let dominant = "other";
  let maxCount = 0;
  let mixed = false;
  for (const [t, c] of Object.entries(traditionCounts)) {
    if (c > maxCount) {
      dominant = t;
      maxCount = c;
    }
  }
  if (maxCount < markers.length * 0.6) mixed = true;

  const color = mixed ? "#A09078" : (TRADITION_COLORS[dominant] || "#6B7280");
  const size = count < 10 ? 36 : count < 50 ? 44 : 52;

  return L.divIcon({
    html: `<div style="
      background: ${color};
      width: ${size}px; height: ${size}px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      color: white; font-weight: 600; font-size: ${count > 999 ? 11 : 13}px;
      border: 2px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    ">${count > 999 ? Math.round(count / 1000) + "k" : count}</div>`,
    className: "marker-cluster-custom",
    iconSize: L.point(size, size),
  });
}

// ---------------------------------------------------------------------------
// Visited centers (localStorage)
// ---------------------------------------------------------------------------
function getVisited(): Set<string> {
  try {
    const raw = localStorage.getItem("sanghamap-visited");
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function toggleVisited(id: string): Set<string> {
  const visited = getVisited();
  if (visited.has(id)) visited.delete(id);
  else visited.add(id);
  try {
    localStorage.setItem("sanghamap-visited", JSON.stringify([...visited]));
  } catch { /* private browsing — fail silently */ }
  return new Set(visited);
}

// ---------------------------------------------------------------------------
// ViewportLoader — loads centers when viewport changes
// ---------------------------------------------------------------------------
function ViewportLoader({
  onCentersLoaded,
  onLoading,
  onZoomTooLow,
}: {
  onCentersLoaded: (centers: MapCenter[]) => void;
  onLoading: (loading: boolean) => void;
  onZoomTooLow: (tooLow: boolean) => void;
}) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const loadForBounds = useCallback(
    (map: L.Map) => {
      // Don't load data when zoomed out too far — too many markers kills the page
      if (map.getZoom() < MIN_DATA_ZOOM) {
        onZoomTooLow(true);
        onCentersLoaded([]);
        onLoading(false);
        return;
      }

      onZoomTooLow(false);
      const bounds = map.getBounds();
      const sw: [number, number] = [bounds.getSouth(), bounds.getWest()];
      const ne: [number, number] = [bounds.getNorth(), bounds.getEast()];

      onLoading(true);
      loadCentersInViewport(sw, ne)
        .then(onCentersLoaded)
        .catch(() => {})
        .finally(() => onLoading(false));
    },
    [onCentersLoaded, onLoading, onZoomTooLow]
  );

  useMapEvents({
    moveend: (e) => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => loadForBounds(e.target), 300);
    },
    zoomend: (e) => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => loadForBounds(e.target), 300);
    },
  });

  // Initial load
  const map = useMap();
  useEffect(() => {
    loadForBounds(map);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

// ---------------------------------------------------------------------------
// Detail Popup Content
// ---------------------------------------------------------------------------
function CenterPopupContent({
  center,
  visited,
  onToggleVisited,
}: {
  center: MapCenter;
  visited: boolean;
  onToggleVisited: () => void;
}) {
  const tradition = getTradition(center.tradition);
  const [showGuide, setShowGuide] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showConcerns, setShowConcerns] = useState(false);

  const hasConcerns = center.concernStatus === "documented" || center.concernStatus === "not_buddhism";

  return (
    <div className="min-w-[260px] max-w-[320px] font-sans">
      {/* Name */}
      <h3 className="font-bold text-base text-zinc-900 leading-tight mb-1">{center.name}</h3>

      {/* Tradition badge */}
      <span
        className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium text-white mb-2"
        style={{ backgroundColor: tradition.color }}
      >
        {tradition.label}
      </span>

      {/* Address */}
      <p className="text-sm text-zinc-600 mb-1">
        {center.address || [center.city, center.country].filter(Boolean).join(", ") || "—"}
      </p>

      {/* Contact */}
      {center.phone && (
        <p className="text-sm text-zinc-600 flex items-center gap-1.5 mb-0.5">
          <Phone className="w-3.5 h-3.5" />
          <a href={`tel:${center.phone}`} className="hover:text-[#E97116]">{center.phone}</a>
        </p>
      )}
      {center.website && (
        <p className="text-sm text-zinc-600 flex items-center gap-1.5 mb-2">
          <Globe className="w-3.5 h-3.5" />
          <a href={center.website} target="_blank" rel="noopener noreferrer"
            className="hover:text-[#E97116] truncate max-w-[200px]">
            {center.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
          </a>
        </p>
      )}

      {/* Visited toggle */}
      <button
        onClick={onToggleVisited}
        className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors mb-2 ${
          visited
            ? "bg-[#E97116]/10 text-[#E97116]"
            : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
        }`}
      >
        <Check className="w-4 h-4" />
        {visited ? "Visited" : "Mark as Visited"}
      </button>

      {/* Expandable: First Visit Guide */}
      <button
        onClick={() => setShowGuide(!showGuide)}
        className="flex items-center justify-between w-full text-sm font-medium text-zinc-700 py-1.5 border-t border-zinc-200"
      >
        <span>First Visit Guide</span>
        {showGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {showGuide && (
        <p className="text-sm text-zinc-600 pb-2 leading-relaxed">{tradition.firstVisitGuide}</p>
      )}

      {/* Expandable: About Tradition */}
      <button
        onClick={() => setShowAbout(!showAbout)}
        className="flex items-center justify-between w-full text-sm font-medium text-zinc-700 py-1.5 border-t border-zinc-200"
      >
        <span>About {tradition.label}</span>
        {showAbout ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {showAbout && (
        <p className="text-sm text-zinc-600 pb-2 leading-relaxed">{tradition.description}</p>
      )}

      {/* Expandable: Ethical Concerns */}
      {hasConcerns && (
        <>
          <button
            onClick={() => setShowConcerns(!showConcerns)}
            className="flex items-center justify-between w-full text-sm font-medium text-amber-700 py-1.5 border-t border-zinc-200"
          >
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              {center.concernStatus === "not_buddhism" ? "Not Buddhism" : "Ethical Concerns"}
            </span>
            {showConcerns ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showConcerns && (
            <div className="text-sm text-amber-800 pb-2 pl-2 border-l-2 border-amber-400 leading-relaxed">
              {center.concernStatus === "not_buddhism"
                ? "This organization uses Buddhist imagery but is not recognized as a Buddhist tradition by mainstream Buddhist federations."
                : "This organization has documented ethical concerns. We include it for transparency — many wonderful people practice in this tradition."}
            </div>
          )}
        </>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 pt-2 border-t border-zinc-200">
        <button
          onClick={() => {
            const url = `https://www.google.com/maps/dir/?api=1&destination=${center.latitude},${center.longitude}`;
            window.open(url, "_blank");
          }}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-zinc-100 hover:bg-zinc-200 rounded-lg text-sm font-medium text-zinc-700 transition-colors"
        >
          <Navigation className="w-4 h-4" />
          Directions
        </button>
        <button
          onClick={() => {
            const text = `${center.name} — ${tradition.label} Buddhist center`;
            const url = window.location.href;
            if (navigator.share) {
              navigator.share({ title: center.name, text, url });
            } else {
              navigator.clipboard.writeText(`${text}\n${url}`);
            }
          }}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-zinc-100 hover:bg-zinc-200 rounded-lg text-sm font-medium text-zinc-700 transition-colors"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MapPanner — pan map to a location
// ---------------------------------------------------------------------------
function MapPanner({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 12, { animate: true });
  }, [center, map]);
  return null;
}

// ---------------------------------------------------------------------------
// Main SanghaMap Component
// ---------------------------------------------------------------------------
export interface SanghaMapProps {
  traditionFilter: Set<string>;
  searchLocation?: [number, number];
}

export default function SanghaMap({ traditionFilter, searchLocation }: SanghaMapProps) {
  const [centers, setCenters] = useState<MapCenter[]>([]);
  const [loading, setLoading] = useState(false);
  const [zoomTooLow, setZoomTooLow] = useState(false);
  const [visited, setVisited] = useState<Set<string>>(() => getVisited());

  const filteredCenters = centers.filter((c) => {
    if (traditionFilter.size === 0) return true;
    return traditionFilter.has(c.tradition);
  });

  // Cap rendered markers to prevent browser freeze
  const capped = filteredCenters.length > MAX_RENDERED_MARKERS;
  const renderedCenters = capped
    ? filteredCenters.slice(0, MAX_RENDERED_MARKERS)
    : filteredCenters;

  return (
    <div role="application" aria-label="Buddhist center map" className="h-full w-full">
    <MapContainer
      center={searchLocation || [20, 0]}
      zoom={searchLocation ? 12 : 3}
      className="h-full w-full"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {searchLocation && <MapPanner center={searchLocation} />}

      <ViewportLoader
        onCentersLoaded={setCenters}
        onLoading={setLoading}
        onZoomTooLow={setZoomTooLow}
      />

      {/* Loading indicator */}
      {loading && (
        <div className="absolute top-4 right-4 z-[1000] bg-white/90 dark:bg-zinc-800/90 rounded-lg px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-300 shadow-sm">
          Loading centers...
        </div>
      )}

      {/* Zoom-in prompt */}
      {zoomTooLow && !loading && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/95 dark:bg-zinc-800/95 rounded-lg px-4 py-2 text-sm text-zinc-600 dark:text-zinc-300 shadow-md text-center">
          Zoom in or search for a city to see centers
        </div>
      )}

      {/* Marker cap warning */}
      {capped && !loading && !zoomTooLow && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/95 dark:bg-zinc-800/95 rounded-lg px-4 py-2 text-sm text-zinc-600 dark:text-zinc-300 shadow-md text-center">
          Showing {MAX_RENDERED_MARKERS.toLocaleString()} of {filteredCenters.length.toLocaleString()} centers — zoom in for more
        </div>
      )}

      <MarkerClusterGroup
        chunkedLoading
        maxClusterRadius={60}
        iconCreateFunction={createClusterIcon}
        spiderfyOnMaxZoom
        showCoverageOnHover={false}
      >
        {renderedCenters.map((center) => {
          const isVisited = visited.has(center.id);
          return (
            <Marker
              key={center.id}
              position={[center.latitude, center.longitude]}
              icon={createTraditionIcon(center.tradition, isVisited)}
              aria-label={`${center.name}, ${getTradition(center.tradition).label}, ${center.city || center.country}`}
            >
              <Popup maxWidth={340} minWidth={260}>
                <CenterPopupContent
                  center={center}
                  visited={isVisited}
                  onToggleVisited={() => {
                    setVisited(toggleVisited(center.id));
                  }}
                />
              </Popup>
            </Marker>
          );
        })}
      </MarkerClusterGroup>
    </MapContainer>
    </div>
  );
}
