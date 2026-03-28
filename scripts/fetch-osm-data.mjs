#!/usr/bin/env node
/**
 * Fetch Buddhist center data from OpenStreetMap Overpass API.
 *
 * Queries per-country using ISO 3166-1 codes to avoid global query timeout.
 * Outputs GeoJSON files to apps/web/public/data/centers/{code}.json
 * and a bounding box index to apps/web/public/data/country-bounds.json
 *
 * Rate limit policy (https://dev.overpass-api.de/overpass-doc/en/preface/commons.html):
 *   - ~10,000 requests/day, <1 GB/day
 *   - Slot-based: cool-down = fraction to multiple of execution time
 *   - 429 when no slot available after 15s queue
 *   - 504 when server-side query timeout exceeded
 *
 * Usage:
 *   node scripts/fetch-osm-data.mjs              # fetch all countries
 *   node scripts/fetch-osm-data.mjs TH JP AU     # fetch specific countries
 */

import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OVERPASS_API = 'https://overpass-api.de/api/interpreter';
const OUTPUT_DIR = join(__dirname, '..', 'apps', 'web', 'public', 'data', 'centers');
const BOUNDS_FILE = join(__dirname, '..', 'apps', 'web', 'public', 'data', 'country-bounds.json');

// Delay between successful requests (Overpass cool-down is dynamic,
// but 15s is conservative enough for sustained batch runs)
const DELAY_BETWEEN_REQUESTS_MS = 15_000;
// Client-side fetch timeout — abort if no response in 4 minutes
const FETCH_TIMEOUT_MS = 240_000;

const COUNTRIES = [
  'TH', 'MM', 'KH', 'LA', 'VN', 'JP', 'KR', 'CN', 'TW', 'HK', 'MO', 'SG', 'MY', 'ID', 'BN', 'PH',
  'LK', 'IN', 'NP', 'BT', 'BD', 'PK',
  'MN', 'RU', 'KZ', 'KG',
  'AU', 'NZ',
  'GB', 'DE', 'FR', 'NL', 'BE', 'AT', 'CH', 'IT', 'ES', 'PT', 'SE', 'NO', 'DK', 'FI',
  'PL', 'CZ', 'HU', 'IE', 'GR', 'RO', 'BG', 'HR', 'SI', 'SK', 'LT', 'LV', 'EE',
  'US', 'CA', 'MX', 'BR', 'AR', 'CL', 'CO', 'PE', 'CR',
  'ZA', 'KE', 'TZ', 'UG', 'NG',
  'IL', 'AE',
];

const COUNTRY_NAMES = {
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

function buildQuery(countryCode) {
  // 300s server-side timeout for large countries like VN, CN, RU
  return `[out:json][timeout:300];
area["ISO3166-1"="${countryCode}"]->.searchArea;
(
  nwr["amenity"="place_of_worship"]["religion"="buddhist"](area.searchArea);
);
out center tags;`;
}

function elementToFeature(el, countryCode) {
  const lat = el.lat ?? el.center?.lat;
  const lon = el.lon ?? el.center?.lon;
  if (lat === undefined || lon === undefined) return null;
  if (!el.tags) return null;

  const tags = el.tags;
  const name = tags['name:en'] || tags.name;
  if (!name) return null;

  return {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [lon, lat] },
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

async function fetchWithRetry(url, countryCode, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      if (response.ok) return response;
      if (response.status === 429 || response.status === 504) {
        // Exponential backoff: 30s, 60s, 90s
        const delay = attempt * 30_000;
        console.log(`  ${countryCode}: ${response.status} — retrying in ${delay / 1000}s (attempt ${attempt}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw new Error(`Overpass API returned ${response.status} for ${countryCode}`);
    } catch (err) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        if (attempt < retries) {
          const delay = attempt * 30_000;
          console.log(`  ${countryCode}: client timeout — retrying in ${delay / 1000}s (attempt ${attempt}/${retries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw new Error(`Fetch timed out after ${FETCH_TIMEOUT_MS / 1000}s for ${countryCode}`);
      }
      throw err;
    }
  }
  throw new Error(`Overpass API failed after ${retries} retries for ${countryCode}`);
}

async function fetchCountry(countryCode) {
  const query = buildQuery(countryCode);
  const url = `${OVERPASS_API}?data=${encodeURIComponent(query)}`;
  const response = await fetchWithRetry(url, countryCode);
  const data = await response.json();

  const features = [];
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
    ? { sw: [minLat, minLon], ne: [maxLat, maxLon] }
    : null;

  return { features, bounds };
}

async function main() {
  const args = process.argv.slice(2);
  const targetCountries = args.length > 0 ? args.map(c => c.toUpperCase()) : COUNTRIES;

  mkdirSync(OUTPUT_DIR, { recursive: true });

  let countryBounds = [];
  if (existsSync(BOUNDS_FILE)) {
    try { countryBounds = JSON.parse(readFileSync(BOUNDS_FILE, 'utf-8')); } catch {}
  }

  // Skip countries we already have data for (incremental mode)
  const existingCodes = new Set(countryBounds.map(b => b.code));
  const toFetch = targetCountries.filter(c => !existingCodes.has(c.toLowerCase()));

  if (toFetch.length < targetCountries.length) {
    const skipped = targetCountries.length - toFetch.length;
    console.log(`Skipping ${skipped} countries already in index. Fetching ${toFetch.length} remaining.\n`);
  }

  let totalCenters = 0;
  const failed = [];

  for (let i = 0; i < toFetch.length; i++) {
    const code = toFetch[i];
    try {
      console.log(`[${i + 1}/${toFetch.length}] Fetching ${code} (${COUNTRY_NAMES[code] || code})...`);
      const { features, bounds } = await fetchCountry(code);

      if (features.length === 0) {
        console.log(`  ${code}: 0 centers — skipping`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        continue;
      }

      const geojson = { type: 'FeatureCollection', features };
      const outPath = join(OUTPUT_DIR, `${code.toLowerCase()}.json`);
      writeFileSync(outPath, JSON.stringify(geojson));
      console.log(`  ${code}: ${features.length} centers → ${code.toLowerCase()}.json`);

      totalCenters += features.length;

      if (bounds) {
        const entry = {
          code: code.toLowerCase(),
          name: COUNTRY_NAMES[code] || code,
          sw: bounds.sw,
          ne: bounds.ne,
          count: features.length,
        };
        const existing = countryBounds.findIndex(b => b.code === entry.code);
        if (existing >= 0) countryBounds[existing] = entry;
        else countryBounds.push(entry);
      }

      // Save bounds after each country for crash resilience
      writeFileSync(BOUNDS_FILE, JSON.stringify(countryBounds, null, 2));

      // Polite delay between requests
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS_MS));
    } catch (err) {
      console.error(`  ${code}: ERROR — ${err.message}`);
      failed.push(code);
      // Wait extra on error before continuing
      await new Promise(resolve => setTimeout(resolve, 30_000));
    }
  }

  writeFileSync(BOUNDS_FILE, JSON.stringify(countryBounds, null, 2));
  console.log(`\nDone! ${totalCenters} new centers fetched`);
  console.log(`Total in index: ${countryBounds.length} countries`);
  if (failed.length > 0) {
    console.log(`\nFailed countries (re-run with): node scripts/fetch-osm-data.mjs ${failed.join(' ')}`);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
