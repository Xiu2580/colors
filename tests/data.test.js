import { describe, it, expect } from 'vitest';
import {
  applyFilters, sortColors, findSimilar,
  findHexIndex, filterGradients, getColorStats
} from '../src/data.js';

const mockColors = [
  { hex: '#FF0000', name: '大红', nameEn: 'Red', colorFamily: 'red', hsl: [0, 100, 50] },
  { hex: '#00FF00', name: '绿色', nameEn: 'Green', colorFamily: 'green', hsl: [120, 100, 50] },
  { hex: '#0000FF', name: '蓝色', nameEn: 'Blue', colorFamily: 'blue', hsl: [240, 100, 50] },
  { hex: '#FFA500', name: '橙色', nameEn: 'Orange', colorFamily: 'orange', hsl: [39, 100, 50] },
  { hex: '#FFFFFF', name: '白色', nameEn: 'White', colorFamily: 'white', hsl: [0, 0, 100] },
];

const mockGradients = [
  { name: 'Sunset', colors: ['#FF0000', '#FFA500'], source: 'UI Gradients' },
  { name: 'Ocean', colors: ['#0000FF', '#00FF00'], source: 'CoolHue' },
  { name: 'Forest', colors: ['#00FF00', '#000000'], source: 'UI Gradients' },
];

describe('applyFilters', () => {
  it('returns all colors when family is all and no search', () => {
    const result = applyFilters(mockColors, { family: 'all', search: '' });
    expect(result).toHaveLength(5);
  });

  it('filters by family', () => {
    const result = applyFilters(mockColors, { family: 'red', search: '' });
    expect(result).toHaveLength(1);
    expect(result[0].colorFamily).toBe('red');
  });

  it('filters by search text', () => {
    const result = applyFilters(mockColors, { family: 'all', search: '红' });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('大红');
  });

  it('filters by hex in search', () => {
    const result = applyFilters(mockColors, { family: 'all', search: 'ff0000' });
    expect(result).toHaveLength(1);
  });

  it('filters by english name in search', () => {
    const result = applyFilters(mockColors, { family: 'all', search: 'blue' });
    expect(result).toHaveLength(1);
  });
});

describe('sortColors', () => {
  it('sorts by hue', () => {
    const result = sortColors(mockColors, 'hue');
    // First should be lowest hue: white or red (both hue 0)
    expect(['white', 'red']).toContain(result[0].colorFamily);
    // Last should be blue (hue 240)
    expect(result[result.length - 1].colorFamily).toBe('blue');
  });

  it('sorts by lightness', () => {
    const result = sortColors(mockColors, 'lightness');
    expect(result[result.length - 1].colorFamily).toBe('white'); // highest lightness
  });

  it('sorts by name (default)', () => {
    const result = sortColors(mockColors, 'default');
    expect(result).toHaveLength(5);
  });

  it('sorts by name alphabetically', () => {
    const result = sortColors(mockColors, 'name');
    expect(result.length).toBe(5);
  });
});

describe('findSimilar', () => {
  it('returns N-1 similar colors (excluding self)', () => {
    const result = findSimilar('#FF0000', mockColors, 3);
    expect(result.length).toBeLessThanOrEqual(3);
    expect(result.every(c => c.hex !== '#FF0000')).toBe(true);
  });

  it('returns empty for non-existent color', () => {
    const result = findSimilar('#BADBAD', mockColors, 5);
    expect(result).toHaveLength(0);
  });
});

describe('findHexIndex', () => {
  it('finds index of hex in array', () => {
    expect(findHexIndex(mockColors, '#FF0000')).toBe(0);
    expect(findHexIndex(mockColors, '#0000FF')).toBe(2);
  });

  it('returns -1 for not found', () => {
    expect(findHexIndex(mockColors, '#BADBAD')).toBe(-1);
  });
});

describe('filterGradients', () => {
  it('returns all when source is all', () => {
    const result = filterGradients(mockGradients, { gradientSource: 'all', search: '' });
    expect(result).toHaveLength(3);
  });

  it('filters by source', () => {
    const result = filterGradients(mockGradients, { gradientSource: 'UI Gradients', search: '' });
    expect(result).toHaveLength(2);
  });

  it('filters by search', () => {
    const result = filterGradients(mockGradients, { gradientSource: 'all', search: 'ocean' });
    expect(result).toHaveLength(1);
  });
});

describe('getColorStats', () => {
  it('counts colors per family', () => {
    const stats = getColorStats(mockColors);
    expect(stats.red).toBe(1);
    expect(stats.green).toBe(1);
    expect(stats.blue).toBe(1);
    expect(stats.orange).toBe(1);
    expect(stats.white).toBe(1);
  });
});
