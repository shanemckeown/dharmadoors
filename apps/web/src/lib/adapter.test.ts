import { describe, it, expect } from 'vitest';
import {
  mapDenomination,
  detectConcerns,
  featureToMapCenter,
  featureCollectionToMapCenters,
} from './adapter';
import type { CenterFeature, CenterFeatureCollection } from './mapTypes';

// ---------------------------------------------------------------------------
// mapDenomination
// ---------------------------------------------------------------------------
describe('mapDenomination', () => {
  it('maps theravada variants', () => {
    expect(mapDenomination('theravada')).toBe('theravada');
    expect(mapDenomination('thai_forest')).toBe('theravada');
    expect(mapDenomination('vipassana')).toBe('theravada');
  });

  it('maps mahayana variants', () => {
    expect(mapDenomination('mahayana')).toBe('mahayana');
    expect(mapDenomination('chinese_buddhism')).toBe('mahayana');
    expect(mapDenomination('fo_guang_shan')).toBe('mahayana');
    expect(mapDenomination('tzu_chi')).toBe('mahayana');
  });

  it('maps vajrayana variants', () => {
    expect(mapDenomination('vajrayana')).toBe('vajrayana');
    expect(mapDenomination('tibetan')).toBe('vajrayana');
    expect(mapDenomination('gelug')).toBe('vajrayana');
    expect(mapDenomination('kagyu')).toBe('vajrayana');
    expect(mapDenomination('nyingma')).toBe('vajrayana');
    expect(mapDenomination('sakya')).toBe('vajrayana');
    expect(mapDenomination('karma_kagyu')).toBe('vajrayana');
    expect(mapDenomination('shingon')).toBe('vajrayana');
  });

  it('maps zen variants', () => {
    expect(mapDenomination('zen')).toBe('zen');
    expect(mapDenomination('chan')).toBe('zen');
    expect(mapDenomination('seon')).toBe('zen');
    expect(mapDenomination('soto')).toBe('zen');
    expect(mapDenomination('rinzai')).toBe('zen');
  });

  it('maps pure land variants', () => {
    expect(mapDenomination('pure_land')).toBe('pure_land');
    expect(mapDenomination('jodo_shinshu')).toBe('pure_land');
    expect(mapDenomination('jodo_shu')).toBe('pure_land');
    expect(mapDenomination('amitabha')).toBe('pure_land');
  });

  it('maps nichiren variants', () => {
    expect(mapDenomination('nichiren')).toBe('nichiren');
    expect(mapDenomination('sgi')).toBe('nichiren');
    expect(mapDenomination('soka_gakkai')).toBe('nichiren');
  });

  it('maps secular variants', () => {
    expect(mapDenomination('secular')).toBe('secular');
    expect(mapDenomination('non_denominational')).toBe('secular');
  });

  it('normalizes spaces and hyphens to underscores', () => {
    expect(mapDenomination('thai forest')).toBe('theravada');
    expect(mapDenomination('thai-forest')).toBe('theravada');
    expect(mapDenomination('pure land')).toBe('pure_land');
    expect(mapDenomination('jodo-shinshu')).toBe('pure_land');
  });

  it('is case-insensitive', () => {
    expect(mapDenomination('THERAVADA')).toBe('theravada');
    expect(mapDenomination('Zen')).toBe('zen');
    expect(mapDenomination('Tibetan')).toBe('vajrayana');
  });

  it('returns "other" for unknown denominations', () => {
    expect(mapDenomination('unknown')).toBe('other');
    expect(mapDenomination('hindu')).toBe('other');
  });

  it('returns "other" for null/undefined/empty', () => {
    expect(mapDenomination(null)).toBe('other');
    expect(mapDenomination(undefined)).toBe('other');
    expect(mapDenomination('')).toBe('other');
  });
});

// ---------------------------------------------------------------------------
// detectConcerns
// ---------------------------------------------------------------------------
describe('detectConcerns', () => {
  it('detects organizations with concerns', () => {
    const result = detectConcerns('Shambhala Center', undefined);
    expect(result.affiliation).toBe('shambhala');
    expect(result.concernStatus).toBe('documented');
  });

  it('detects non-Buddhist groups', () => {
    const result = detectConcerns('Falun Gong Practice Site', undefined);
    expect(result.affiliation).toBe('falun_gong');
    expect(result.concernStatus).toBe('not_buddhism');
  });

  it('detects concerns via denomination', () => {
    const result = detectConcerns('Some Center', 'nkt');
    expect(result.affiliation).toBe('nkt');
    expect(result.concernStatus).toBe('documented');
  });

  it('returns null for unknown centers', () => {
    const result = detectConcerns('Dharma Rain Zen Center', undefined);
    expect(result.affiliation).toBeNull();
    expect(result.concernStatus).toBeNull();
  });

  it('returns null for missing name', () => {
    const result = detectConcerns(undefined, undefined);
    expect(result.affiliation).toBeNull();
    expect(result.concernStatus).toBeNull();
  });

  it('is case-insensitive for name matching', () => {
    const result = detectConcerns('RIGPA LONDON', undefined);
    expect(result.affiliation).toBe('rigpa');
    expect(result.concernStatus).toBe('documented');
  });
});

// ---------------------------------------------------------------------------
// featureToMapCenter
// ---------------------------------------------------------------------------
function makeFeature(overrides: Partial<{
  coordinates: [number, number];
  name: string;
  denomination: string;
  tradition: string;
  country_code: string;
  'addr:city': string;
  phone: string;
  website: string;
}> = {}): CenterFeature {
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: overrides.coordinates ?? [100.5, 13.75],
    },
    properties: {
      name: overrides.name ?? 'Wat Pho',
      tradition: overrides.tradition ?? 'buddhist',
      country_code: overrides.country_code ?? 'th',
      denomination: overrides.denomination,
      'addr:city': overrides['addr:city'],
      phone: overrides.phone,
      website: overrides.website,
    },
  };
}

describe('featureToMapCenter', () => {
  it('converts a valid feature', () => {
    const center = featureToMapCenter(makeFeature({
      name: 'Wat Pho',
      coordinates: [100.5, 13.75],
      denomination: 'theravada',
      country_code: 'th',
    }));

    expect(center).not.toBeNull();
    expect(center!.name).toBe('Wat Pho');
    expect(center!.latitude).toBe(13.75);
    expect(center!.longitude).toBe(100.5);
    expect(center!.tradition).toBe('theravada');
    expect(center!.countryCode).toBe('th');
    expect(center!.country).toBe('TH');
  });

  it('generates a stable id from country + coords', () => {
    const center = featureToMapCenter(makeFeature({
      coordinates: [100.12345, 13.67890],
      country_code: 'th',
    }));
    expect(center!.id).toBe('th-13.67890-100.12345');
  });

  it('returns null for missing name', () => {
    const feature = makeFeature();
    (feature.properties as unknown as Record<string, unknown>).name = undefined;
    expect(featureToMapCenter(feature)).toBeNull();
  });

  it('returns null for invalid coordinates', () => {
    expect(featureToMapCenter(makeFeature({ coordinates: [200, 13] }))).toBeNull();
    expect(featureToMapCenter(makeFeature({ coordinates: [100, 95] }))).toBeNull();
  });

  it('returns null for missing coordinates', () => {
    const feature = makeFeature();
    (feature as unknown as Record<string, unknown>).geometry = null;
    expect(featureToMapCenter(feature as CenterFeature)).toBeNull();
  });

  it('prefers name:en over name', () => {
    const feature = makeFeature({ name: 'วัดโพธิ์' });
    (feature.properties as unknown as Record<string, unknown>)['name:en'] = 'Wat Pho';
    const center = featureToMapCenter(feature);
    expect(center!.name).toBe('Wat Pho');
  });

  it('maps denomination to tradition', () => {
    const center = featureToMapCenter(makeFeature({ denomination: 'gelug' }));
    expect(center!.tradition).toBe('vajrayana');
  });

  it('defaults to "other" tradition when no denomination', () => {
    const center = featureToMapCenter(makeFeature({ denomination: undefined }));
    expect(center!.tradition).toBe('other');
  });

  it('builds address from parts', () => {
    const feature = makeFeature();
    const props = feature.properties as unknown as Record<string, unknown>;
    props['addr:housenumber'] = '2';
    props['addr:street'] = 'Sanam Chai Rd';
    props['addr:city'] = 'Bangkok';
    props['addr:postcode'] = '10200';

    const center = featureToMapCenter(feature);
    expect(center!.address).toBe('2 Sanam Chai Rd, Bangkok, 10200');
  });

  it('handles addr:full', () => {
    const feature = makeFeature();
    (feature.properties as unknown as Record<string, unknown>)['addr:full'] = '2 Sanam Chai Rd, Bangkok 10200';
    const center = featureToMapCenter(feature);
    expect(center!.address).toBe('2 Sanam Chai Rd, Bangkok 10200');
  });

  it('detects ethical concerns', () => {
    const center = featureToMapCenter(makeFeature({ name: 'Shambhala Meditation Center' }));
    expect(center!.affiliation).toBe('shambhala');
    expect(center!.concernStatus).toBe('documented');
  });
});

// ---------------------------------------------------------------------------
// featureCollectionToMapCenters
// ---------------------------------------------------------------------------
describe('featureCollectionToMapCenters', () => {
  it('converts valid features and skips invalid ones', () => {
    const collection: CenterFeatureCollection = {
      type: 'FeatureCollection',
      features: [
        makeFeature({ name: 'Wat Pho', coordinates: [100.5, 13.75] }),
        makeFeature({ name: '', coordinates: [100.5, 13.75] }), // empty name → skip
        makeFeature({ name: 'Wat Arun', coordinates: [100.49, 13.74] }),
      ],
    };
    // Empty string name → feature.properties.name is '' which is falsy → skipped
    (collection.features[1].properties as unknown as Record<string, unknown>).name = '';

    const centers = featureCollectionToMapCenters(collection);
    expect(centers).toHaveLength(2);
    expect(centers[0].name).toBe('Wat Pho');
    expect(centers[1].name).toBe('Wat Arun');
  });

  it('returns empty array for empty collection', () => {
    const collection: CenterFeatureCollection = {
      type: 'FeatureCollection',
      features: [],
    };
    expect(featureCollectionToMapCenters(collection)).toEqual([]);
  });
});
