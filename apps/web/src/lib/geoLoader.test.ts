import { describe, it, expect } from 'vitest';
import { countriesInViewport } from './geoLoader';
import type { CountryBounds } from './mapTypes';

const mockBounds: CountryBounds[] = [
  { code: 'th', name: 'Thailand', sw: [5.6, 97.3], ne: [20.5, 105.6], count: 5000 },
  { code: 'jp', name: 'Japan', sw: [24.0, 122.9], ne: [45.5, 153.9], count: 8000 },
  { code: 'au', name: 'Australia', sw: [-43.6, 113.1], ne: [-10.1, 153.6], count: 300 },
  { code: 'gb', name: 'United Kingdom', sw: [49.9, -8.2], ne: [60.8, 1.8], count: 200 },
  { code: 'us', name: 'United States', sw: [24.5, -124.8], ne: [49.4, -66.9], count: 1500 },
];

describe('countriesInViewport', () => {
  it('finds countries overlapping viewport', () => {
    // Viewport covering Southeast Asia
    const result = countriesInViewport(mockBounds, [0, 95], [25, 110]);
    const codes = result.map(c => c.code);
    expect(codes).toContain('th');
    expect(codes).not.toContain('jp');
    expect(codes).not.toContain('us');
  });

  it('finds multiple countries in wide viewport', () => {
    // Viewport covering East/Southeast Asia
    const result = countriesInViewport(mockBounds, [0, 95], [50, 160]);
    const codes = result.map(c => c.code);
    expect(codes).toContain('th');
    expect(codes).toContain('jp');
    expect(codes).not.toContain('us');
    expect(codes).not.toContain('gb');
  });

  it('returns empty for viewport with no countries', () => {
    // Middle of Atlantic Ocean
    const result = countriesInViewport(mockBounds, [20, -40], [30, -20]);
    expect(result).toHaveLength(0);
  });

  it('handles global viewport', () => {
    const result = countriesInViewport(mockBounds, [-90, -180], [90, 180]);
    expect(result).toHaveLength(5);
  });

  it('handles single-point viewport at country border', () => {
    // Point inside Thailand
    const result = countriesInViewport(mockBounds, [13, 100], [14, 101]);
    expect(result.map(c => c.code)).toContain('th');
  });

  it('handles southern hemisphere correctly', () => {
    // Viewport over Australia
    const result = countriesInViewport(mockBounds, [-40, 110], [-5, 155]);
    const codes = result.map(c => c.code);
    expect(codes).toContain('au');
    expect(codes).not.toContain('th');
  });
});
