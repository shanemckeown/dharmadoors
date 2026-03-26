import type { MapCenter, CenterFeature, CenterFeatureCollection } from './mapTypes';
import { ORGANIZATIONS_WITH_CONCERNS, NON_BUDDHIST_GROUPS } from './concerns';

/**
 * OSM denomination tag → DharmaDoors tradition mapping.
 * Source: https://wiki.openstreetmap.org/wiki/Key:denomination
 */
const DENOMINATION_MAP: Record<string, string> = {
  // Theravada
  theravada: 'theravada',
  'thai_forest': 'theravada',
  vipassana: 'theravada',
  // Mahayana
  mahayana: 'mahayana',
  chinese_buddhism: 'mahayana',
  fo_guang_shan: 'mahayana',
  tzu_chi: 'mahayana',
  // Vajrayana / Tibetan
  vajrayana: 'vajrayana',
  tibetan: 'vajrayana',
  gelug: 'vajrayana',
  kagyu: 'vajrayana',
  nyingma: 'vajrayana',
  sakya: 'vajrayana',
  'karma_kagyu': 'vajrayana',
  shingon: 'vajrayana',
  // Zen
  zen: 'zen',
  chan: 'zen',
  seon: 'zen',
  soto: 'zen',
  rinzai: 'zen',
  // Pure Land
  'pure_land': 'pure_land',
  'jodo_shinshu': 'pure_land',
  'jodo_shu': 'pure_land',
  amitabha: 'pure_land',
  // Nichiren
  nichiren: 'nichiren',
  sgi: 'nichiren',
  'soka_gakkai': 'nichiren',
  // Secular
  secular: 'secular',
  non_denominational: 'secular',
};

/**
 * Map an OSM denomination tag to a DharmaDoors tradition.
 * Returns 'other' for unknown or missing denominations.
 */
export function mapDenomination(denomination: string | undefined | null): string {
  if (!denomination) return 'other';
  const normalized = denomination.toLowerCase().replace(/[\s-]/g, '_');
  return DENOMINATION_MAP[normalized] || 'other';
}

/**
 * Detect affiliation and concern status from center name and tags.
 * Checks against known organizations with documented concerns and non-Buddhist groups.
 */
export function detectConcerns(
  name: string | undefined,
  denomination: string | undefined
): { affiliation: string | null; concernStatus: string | null } {
  if (!name) return { affiliation: null, concernStatus: null };
  const lower = name.toLowerCase();
  const denomLower = denomination?.toLowerCase() || '';

  // Check organizations with concerns
  for (const [key, org] of Object.entries(ORGANIZATIONS_WITH_CONCERNS) as [string, { affiliation: string }][]) {
    if (lower.includes(key) || denomLower.includes(key)) {
      return { affiliation: org.affiliation, concernStatus: 'documented' as const };
    }
  }

  // Check non-Buddhist groups
  for (const [key, group] of Object.entries(NON_BUDDHIST_GROUPS) as [string, { affiliation: string }][]) {
    if (lower.includes(key.replace('_', ' ')) || lower.includes(key)) {
      return { affiliation: group.affiliation, concernStatus: 'not_buddhism' as const };
    }
  }

  return { affiliation: null, concernStatus: null };
}

/**
 * Build a display address from OSM address tags.
 */
function buildAddress(props: Record<string, unknown>): string | undefined {
  const full = props['addr:full'] as string | undefined;
  if (full) return full;

  const parts: string[] = [];
  const housenumber = props['addr:housenumber'] as string | undefined;
  const street = props['addr:street'] as string | undefined;
  const city = props['addr:city'] as string | undefined;
  const postcode = props['addr:postcode'] as string | undefined;

  if (housenumber && street) parts.push(`${housenumber} ${street}`);
  else if (street) parts.push(street);
  if (city) parts.push(city);
  if (postcode) parts.push(postcode);

  return parts.length > 0 ? parts.join(', ') : undefined;
}

/**
 * Convert a GeoJSON Feature to a MapCenter.
 * Skips features with missing coordinates or names.
 */
export function featureToMapCenter(feature: CenterFeature): MapCenter | null {
  const { geometry, properties } = feature;

  // Skip if missing coordinates
  if (
    !geometry ||
    !geometry.coordinates ||
    geometry.coordinates.length < 2 ||
    typeof geometry.coordinates[0] !== 'number' ||
    typeof geometry.coordinates[1] !== 'number'
  ) {
    return null;
  }

  const [lng, lat] = geometry.coordinates;

  // Skip invalid coordinates
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return null;
  }

  const name = properties['name:en'] || properties.name;
  if (!name) return null;

  const tradition = mapDenomination(properties.denomination || properties.tradition);
  const { affiliation, concernStatus } = detectConcerns(name, properties.denomination);

  return {
    id: `${properties.country_code}-${lat.toFixed(5)}-${lng.toFixed(5)}`,
    name,
    latitude: lat,
    longitude: lng,
    tradition: tradition as MapCenter['tradition'],
    address: buildAddress(properties as unknown as Record<string, unknown>),
    city: properties['addr:city'],
    country: properties['addr:country'] || properties.country_code?.toUpperCase() || '',
    countryCode: properties.country_code || '',
    phone: properties.phone,
    website: properties.website,
    affiliation: affiliation as MapCenter['affiliation'],
    concernStatus: concernStatus as MapCenter['concernStatus'],
  };
}

/**
 * Convert a GeoJSON FeatureCollection to MapCenter array.
 * Filters out invalid features.
 */
export function featureCollectionToMapCenters(
  collection: CenterFeatureCollection
): MapCenter[] {
  return collection.features
    .map(featureToMapCenter)
    .filter((c): c is MapCenter => c !== null);
}
