// Re-declare types locally to avoid workspace resolution issues
type Tradition =
  | 'theravada' | 'mahayana' | 'vajrayana' | 'zen'
  | 'pure_land' | 'nichiren' | 'secular' | 'multi_tradition' | 'other';

type Affiliation = string | null;
type ConcernStatus = 'documented' | 'not_buddhism' | 'resolved' | null;

/**
 * Slim center type used by the map component.
 * Adapted from GeoJSON Feature properties — only the fields needed for rendering.
 */
export interface MapCenter {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  tradition: Tradition;
  address?: string;
  city?: string;
  country: string;
  countryCode: string;
  phone?: string;
  website?: string;
  affiliation?: Affiliation;
  concernStatus?: ConcernStatus;
}

/**
 * GeoJSON Feature properties as they come from the OSM pipeline.
 */
export interface OSMCenterProperties {
  name?: string;
  'name:en'?: string;
  tradition: string;
  denomination?: string;
  'addr:full'?: string;
  'addr:street'?: string;
  'addr:housenumber'?: string;
  'addr:city'?: string;
  'addr:postcode'?: string;
  'addr:country'?: string;
  country_code: string;
  phone?: string;
  website?: string;
  affiliation?: string;
  concern_status?: string;
}

/**
 * GeoJSON Feature for a Buddhist center from the OSM pipeline.
 */
export interface CenterFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  properties: OSMCenterProperties;
}

/**
 * GeoJSON FeatureCollection for a country.
 */
export interface CenterFeatureCollection {
  type: 'FeatureCollection';
  features: CenterFeature[];
}

/**
 * Country bounding box entry for viewport intersection checks.
 */
export interface CountryBounds {
  code: string;
  name: string;
  sw: [number, number]; // [lat, lng]
  ne: [number, number]; // [lat, lng]
  count: number;
}
