#!/usr/bin/env node
/**
 * Extract city data from GeoJSON center files.
 * Groups centers by addr:city, computes tradition breakdown, bounds, and center point.
 * Outputs apps/web/public/data/cities.json for per-city SEO pages.
 *
 * Usage: node scripts/extract-cities.mjs
 */

import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CENTERS_DIR = join(__dirname, '..', 'apps', 'web', 'public', 'data', 'centers');
const OUTPUT_FILE = join(__dirname, '..', 'apps', 'web', 'public', 'data', 'cities.json');
const MIN_CENTERS = 5;

// Same denomination mapping as adapter.ts
const DENOMINATION_MAP = {
  theravada: 'theravada', thai_forest: 'theravada', vipassana: 'theravada',
  mahayana: 'mahayana', chinese_buddhism: 'mahayana', fo_guang_shan: 'mahayana', tzu_chi: 'mahayana',
  vajrayana: 'vajrayana', tibetan: 'vajrayana', gelug: 'vajrayana', kagyu: 'vajrayana',
  nyingma: 'vajrayana', sakya: 'vajrayana', karma_kagyu: 'vajrayana', shingon: 'vajrayana',
  zen: 'zen', chan: 'zen', seon: 'zen', soto: 'zen', rinzai: 'zen',
  pure_land: 'pure_land', jodo_shinshu: 'pure_land', jodo_shu: 'pure_land', amitabha: 'pure_land',
  nichiren: 'nichiren', sgi: 'nichiren', soka_gakkai: 'nichiren',
  secular: 'secular', non_denominational: 'secular',
};

const COUNTRY_NAMES = {
  th: 'Thailand', mm: 'Myanmar', kh: 'Cambodia', la: 'Laos', vn: 'Vietnam',
  jp: 'Japan', kr: 'South Korea', cn: 'China', tw: 'Taiwan', hk: 'Hong Kong',
  mo: 'Macau', sg: 'Singapore', my: 'Malaysia', id: 'Indonesia', bn: 'Brunei',
  ph: 'Philippines', lk: 'Sri Lanka', in: 'India', np: 'Nepal', bt: 'Bhutan',
  bd: 'Bangladesh', pk: 'Pakistan', mn: 'Mongolia', ru: 'Russia',
  kz: 'Kazakhstan', kg: 'Kyrgyzstan', au: 'Australia', nz: 'New Zealand',
  gb: 'United Kingdom', de: 'Germany', fr: 'France', nl: 'Netherlands',
  be: 'Belgium', at: 'Austria', ch: 'Switzerland', it: 'Italy', es: 'Spain',
  pt: 'Portugal', se: 'Sweden', no: 'Norway', dk: 'Denmark', fi: 'Finland',
  pl: 'Poland', cz: 'Czech Republic', hu: 'Hungary', ie: 'Ireland',
  gr: 'Greece', ro: 'Romania', bg: 'Bulgaria', hr: 'Croatia', si: 'Slovenia',
  sk: 'Slovakia', lt: 'Lithuania', lv: 'Latvia', ee: 'Estonia',
  us: 'United States', ca: 'Canada', mx: 'Mexico', br: 'Brazil',
  ar: 'Argentina', cl: 'Chile', co: 'Colombia', pe: 'Peru', cr: 'Costa Rica',
  za: 'South Africa', ke: 'Kenya', tz: 'Tanzania', ug: 'Uganda', ng: 'Nigeria',
  il: 'Israel', ae: 'United Arab Emirates',
};

function mapDenomination(denomination) {
  if (!denomination) return 'other';
  const normalized = denomination.toLowerCase().replace(/[\s-]/g, '_');
  return DENOMINATION_MAP[normalized] || 'other';
}

function toSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Read all GeoJSON files
const files = readdirSync(CENTERS_DIR).filter(f => f.endsWith('.json'));
console.log(`Reading ${files.length} country files...`);

// Group by city
const cityMap = new Map(); // key: "countryCode:cityName"

let totalFeatures = 0;
let featuresWithCity = 0;

for (const file of files) {
  const countryCode = file.replace('.json', '');
  const data = JSON.parse(readFileSync(join(CENTERS_DIR, file), 'utf-8'));

  for (const feature of data.features) {
    totalFeatures++;
    const city = feature.properties['addr:city'];
    if (!city || city.trim() === '') continue;
    featuresWithCity++;

    const key = `${countryCode}:${city}`;
    if (!cityMap.has(key)) {
      cityMap.set(key, {
        name: city,
        country: countryCode.toUpperCase(),
        countryName: COUNTRY_NAMES[countryCode] || countryCode.toUpperCase(),
        features: [],
      });
    }
    cityMap.get(key).features.push(feature);
  }
}

console.log(`Total features: ${totalFeatures}`);
console.log(`Features with addr:city: ${featuresWithCity}`);
console.log(`Unique cities: ${cityMap.size}`);

// Build city entries
const cities = [];

for (const [, entry] of cityMap) {
  if (entry.features.length < MIN_CENTERS) continue;

  let sumLat = 0, sumLng = 0;
  let minLat = Infinity, maxLat = -Infinity;
  let minLng = Infinity, maxLng = -Infinity;
  const traditions = {};

  for (const feature of entry.features) {
    const [lng, lat] = feature.geometry.coordinates;
    sumLat += lat;
    sumLng += lng;
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);

    const tradition = mapDenomination(feature.properties.denomination);
    traditions[tradition] = (traditions[tradition] || 0) + 1;
  }

  const count = entry.features.length;
  cities.push({
    slug: toSlug(entry.name),
    name: entry.name,
    country: entry.country,
    countryName: entry.countryName,
    centerCount: count,
    center: [
      Math.round((sumLat / count) * 100000) / 100000,
      Math.round((sumLng / count) * 100000) / 100000,
    ],
    traditions,
    bounds: [
      [Math.round(minLat * 100000) / 100000, Math.round(minLng * 100000) / 100000],
      [Math.round(maxLat * 100000) / 100000, Math.round(maxLng * 100000) / 100000],
    ],
  });
}

// Sort by center count descending
cities.sort((a, b) => b.centerCount - a.centerCount);

writeFileSync(OUTPUT_FILE, JSON.stringify(cities, null, 2));
console.log(`\nGenerated ${cities.length} cities with ${MIN_CENTERS}+ centers`);
console.log(`Top 10:`);
cities.slice(0, 10).forEach((c, i) => {
  console.log(`  ${i + 1}. ${c.name}, ${c.countryName}: ${c.centerCount} centers`);
});
console.log(`\nOutput: ${OUTPUT_FILE}`);
