import type { CountryBounds, CenterFeatureCollection } from './mapTypes';
import type { MapCenter } from './mapTypes';
import { featureCollectionToMapCenters } from './adapter';

let boundsCache: CountryBounds[] | null = null;
const centerCache = new Map<string, MapCenter[]>();

/**
 * Load the country bounding box index.
 * Cached after first fetch.
 */
export async function loadCountryBounds(): Promise<CountryBounds[]> {
  if (boundsCache) return boundsCache;

  try {
    const res = await fetch('/data/country-bounds.json');
    if (!res.ok) throw new Error(`Failed to load country bounds: ${res.status}`);
    boundsCache = await res.json() as CountryBounds[];
    return boundsCache;
  } catch {
    console.error('Could not load country bounds index');
    return [];
  }
}

/**
 * Find countries whose bounding boxes intersect the given viewport.
 */
export function countriesInViewport(
  bounds: CountryBounds[],
  viewSW: [number, number], // [lat, lng]
  viewNE: [number, number], // [lat, lng]
): CountryBounds[] {
  return bounds.filter(country => {
    const [cSwLat, cSwLng] = country.sw;
    const [cNeLat, cNeLng] = country.ne;
    const [vSwLat, vSwLng] = viewSW;
    const [vNeLat, vNeLng] = viewNE;

    // No overlap if one is entirely above/below/left/right of the other
    if (cNeLat < vSwLat || cSwLat > vNeLat) return false;
    if (cNeLng < vSwLng || cSwLng > vNeLng) return false;
    return true;
  });
}

/**
 * Load centers for a specific country code.
 * Cached after first fetch.
 */
export async function loadCountryCenters(code: string): Promise<MapCenter[]> {
  if (centerCache.has(code)) return centerCache.get(code)!;

  try {
    const res = await fetch(`/data/centers/${code}.json`);
    if (!res.ok) {
      centerCache.set(code, []);
      return [];
    }
    const collection = await res.json() as CenterFeatureCollection;
    const centers = featureCollectionToMapCenters(collection);
    centerCache.set(code, centers);
    return centers;
  } catch {
    console.error(`Could not load centers for ${code}`);
    centerCache.set(code, []);
    return [];
  }
}

/**
 * Load all centers visible in the current viewport.
 * Loads country GeoJSON files for countries intersecting the viewport.
 */
export async function loadCentersInViewport(
  viewSW: [number, number],
  viewNE: [number, number],
): Promise<MapCenter[]> {
  const bounds = await loadCountryBounds();
  const visible = countriesInViewport(bounds, viewSW, viewNE);

  const results = await Promise.all(
    visible.map(country => loadCountryCenters(country.code))
  );

  return results.flat();
}
