#!/usr/bin/env npx tsx
/**
 * Fetch Buddhist center data from OpenStreetMap Overpass API.
 *
 * Queries per-country using ISO 3166-1 codes to avoid global query timeout.
 * Outputs GeoJSON files to apps/web/public/data/centers/{code}.json
 * and a bounding box index to apps/web/public/data/country-bounds.json
 *
 * Usage:
 *   npx tsx scripts/fetch-osm-data.ts              # fetch all countries
 *   npx tsx scripts/fetch-osm-data.ts TH JP AU     # fetch specific countries
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const OVERPASS_API = 'https://overpass-api.de/api/interpreter';
const OUTPUT_DIR = join(__dirname, '..', 'apps', 'web', 'public', 'data', 'centers');
const BOUNDS_FILE = join(__dirname, '..', 'apps', 'web', 'public', 'data', 'country-bounds.json');

// Countries with known Buddhist communities (ISO 3166-1 alpha-2)
const COUNTRIES = [
  // East & Southeast Asia
  'TH', 'MM', 'KH', 'LA', 'VN', 'JP', 'KR', 'CN', 'TW', 'HK', 'MO', 'SG', 'MY', 'ID', 'BN', 'PH',
  // South Asia
  'LK', 'IN', 'NP', 'BT', 'BD', 'PK',
  // Central Asia
  'MN', 'RU', 'KZ', 'KG',
  // Oceania
  'AU', 'NZ',
  // Europe
  'GB', 'DE', 'FR', 'NL', 'BE', 'AT', 'CH', 'IT', 'ES', 'PT', 'SE', 'NO', 'DK', 'FI',
  'PL', 'CZ', 'HU', 'IE', 'GR', 'RO', 'BG', 'HR', 'SI', 'SK', 'LT', 'LV', 'EE',
  // Americas
  'US', 'CA', 'MX', 'BR', 'AR', 'CL', 'CO', 'PE', 'CR',
  // Africa
  'ZA', 'KE', 'TZ', 'UG', 'NG',
  // Middle East
  'IL', 'AE',
];

interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: Record<string, string | undefined>;
}

function buildQuery(countryCode: string): string {
  return `
[out:json][timeout:60];
area["ISO3166-1"="${countryCode}"]->.searchArea;
(
  nwr["amenity"="place_of_worship"]["religion"="buddhist"](area.searchArea);
);
out center tags;
`.trim();
}

function elementToFeature(el: OverpassElement, countryCode: string): GeoJSONFeature | null {
  const lat = el.lat ?? el.center?.lat;
  const lon = el.lon ?? el.center?.lon;
  if (lat === undefined || lon === undefined) return null;
  if (!el.tags) return null;

  const tags = el.tags;
  const name = tags['name:en'] || tags.name;
  if (!name) return null;

  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [lon, lat],
    },
    properties: {
      name: tags.name,
      'name:en': tags['name:en'],
      tradition: tags.religion || 'buddhist',
      denomination: tags.denomination,
      'addr:full': tags['addr:full'],
      'addr:street': tags['addr:street'],
      'addr:housenumber': tags['addr:housenumber'],
      'addr:city': tags['addr:city'],
      'addr:postcode': tags['addr:postcode'],
      'addr:country': tags['addr:country'],
      country_code: countryCode.toLowerCase(),
      phone: tags.phone || tags['contact:phone'],
      website: tags.website || tags['contact:website'],
    },
  };
}

async function fetchCountry(countryCode: string): Promise<{
  features: GeoJSONFeature[];
  bounds: { sw: [number, number]; ne: [number, number] } | null;
}> {
  const query = buildQuery(countryCode);
  const url = `${OVERPASS_API}?data=${encodeURIComponent(query)}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Overpass API returned ${response.status} for ${countryCode}`);
  }

  const data = await response.json() as { elements: OverpassElement[] };
  const features: GeoJSONFeature[] = [];
  let minLat = Infinity, maxLat = -Infinity;
  let minLon = Infinity, maxLon = -Infinity;

  for (const el of data.elements) {
    const feature = elementToFeature(el, countryCode);
    if (!feature) continue;

    features.push(feature);

    const [lon, lat] = feature.geometry.coordinates;
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
    minLon = Math.min(minLon, lon);
    maxLon = Math.max(maxLon, lon);
  }

  const bounds = features.length > 0
    ? { sw: [minLat, minLon] as [number, number], ne: [maxLat, maxLon] as [number, number] }
    : null;

  return { features, bounds };
}

// Country name lookup for index
const COUNTRY_NAMES: Record<string, string> = {
  TH: 'Thailand', MM: 'Myanmar', KH: 'Cambodia', LA: 'Laos', VN: 'Vietnam',
  JP: 'Japan', KR: 'South Korea', CN: 'China', TW: 'Taiwan', HK: 'Hong Kong',
  MO: 'Macau', SG: 'Singapore', MY: 'Malaysia', ID: 'Indonesia', BN: 'Brunei',
  PH: 'Philippines', LK: 'Sri Lanka', IN: 'India', NP: 'Nepal', BT: 'Bhutan',
  BD: 'Bangladesh', PK: 'Pakistan', MN: 'Mongolia', RU: 'Russia',
  KZ: 'Kazakhstan', KG: 'Kyrgyzstan', AU: 'Australia', NZ: 'New Zealand',
  GB: 'United Kingdom', DE: 'Germany', FR: 'France', NL: 'Netherlands',
  BE: 'Belgium', AT: 'Austria', CH: 'Switzerland', IT: 'Italy', ES: 'Spain',
  PT: 'Portugal', SE: 'Sweden', NO: 'Norway', DK: 'Denmark', FI: 'Finland',
  PL: 'Poland', CZ: 'Czech Republic', HU: 'Hungary', IE: 'Ireland',
  GR: 'Greece', RO: 'Romania', BG: 'Bulgaria', HR: 'Croatia', SI: 'Slovenia',
  SK: 'Slovakia', LT: 'Lithuania', LV: 'Latvia', EE: 'Estonia',
  US: 'United States', CA: 'Canada', MX: 'Mexico', BR: 'Brazil',
  AR: 'Argentina', CL: 'Chile', CO: 'Colombia', PE: 'Peru', CR: 'Costa Rica',
  ZA: 'South Africa', KE: 'Kenya', TZ: 'Tanzania', UG: 'Uganda', NG: 'Nigeria',
  IL: 'Israel', AE: 'United Arab Emirates',
};

async function main() {
  const args = process.argv.slice(2);
  const targetCountries = args.length > 0
    ? args.map(c => c.toUpperCase())
    : COUNTRIES;

  mkdirSync(OUTPUT_DIR, { recursive: true });
  mkdirSync(join(OUTPUT_DIR, '..'), { recursive: true });

  const countryBounds: Array<{
    code: string;
    name: string;
    sw: [number, number];
    ne: [number, number];
    count: number;
  }> = [];

  let totalCenters = 0;

  for (const code of targetCountries) {
    try {
      console.log(`Fetching ${code} (${COUNTRY_NAMES[code] || code})...`);
      const { features, bounds } = await fetchCountry(code);

      if (features.length === 0) {
        console.log(`  ${code}: 0 centers — skipping`);
        continue;
      }

      const geojson = {
        type: 'FeatureCollection',
        features,
      };

      const outPath = join(OUTPUT_DIR, `${code.toLowerCase()}.json`);
      writeFileSync(outPath, JSON.stringify(geojson));
      console.log(`  ${code}: ${features.length} centers → ${outPath}`);

      totalCenters += features.length;

      if (bounds) {
        countryBounds.push({
          code: code.toLowerCase(),
          name: COUNTRY_NAMES[code] || code,
          sw: bounds.sw,
          ne: bounds.ne,
          count: features.length,
        });
      }

      // Rate limit: 1 request per 2 seconds to be polite to Overpass
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (err) {
      console.error(`  ${code}: ERROR — ${(err as Error).message}`);
    }
  }

  // Write bounding box index
  writeFileSync(BOUNDS_FILE, JSON.stringify(countryBounds, null, 2));
  console.log(`\nDone! ${totalCenters} centers across ${countryBounds.length} countries`);
  console.log(`Index: ${BOUNDS_FILE}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
