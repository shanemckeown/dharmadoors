import { describe, it, expect } from 'vitest';
import { traditionsData, getTradition, TRADITION_KEYS } from './traditionsData';

describe('traditionsData', () => {
  it('has all 9 traditions', () => {
    expect(Object.keys(traditionsData)).toHaveLength(9);
  });

  it('includes expected tradition keys', () => {
    const expected = [
      'theravada', 'mahayana', 'vajrayana', 'zen',
      'pure_land', 'nichiren', 'secular', 'multi_tradition', 'other',
    ];
    expect(Object.keys(traditionsData).sort()).toEqual(expected.sort());
  });

  it('every tradition has all required fields', () => {
    for (const [key, data] of Object.entries(traditionsData)) {
      expect(data.key).toBe(key);
      expect(data.label).toBeTruthy();
      expect(data.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(data.description.length).toBeGreaterThan(50);
      expect(data.firstVisitGuide.length).toBeGreaterThan(50);
    }
  });

  it('has unique colors (except secular and other share gray)', () => {
    const colors = Object.values(traditionsData).map(t => t.color);
    const uniqueColors = new Set(colors);
    // secular and other both use #6B7280
    expect(uniqueColors.size).toBe(colors.length - 1);
  });
});

describe('getTradition', () => {
  it('returns correct tradition for valid key', () => {
    expect(getTradition('theravada').label).toBe('Theravada');
    expect(getTradition('zen').label).toBe('Zen/Chan/Seon');
  });

  it('returns "other" for unknown key', () => {
    expect(getTradition('unknown_tradition')).toBe(traditionsData.other);
  });

  it('returns "other" for null', () => {
    expect(getTradition(null)).toBe(traditionsData.other);
  });

  it('returns "other" for undefined', () => {
    expect(getTradition(undefined)).toBe(traditionsData.other);
  });

  it('returns "other" for empty string', () => {
    expect(getTradition('')).toBe(traditionsData.other);
  });
});

describe('TRADITION_KEYS', () => {
  it('has all 9 keys', () => {
    expect(TRADITION_KEYS).toHaveLength(9);
  });

  it('matches traditionsData keys', () => {
    expect(TRADITION_KEYS.sort()).toEqual(Object.keys(traditionsData).sort());
  });
});
