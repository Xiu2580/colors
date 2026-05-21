import { describe, it, expect } from 'vitest';
import {
  FAMILY_LABELS, getLuminance, textColorFor, subTextColorFor,
  hslDistance, esc, sanitizeColors, sanitizeGradients, debounce
} from '../src/utils.js';

describe('getLuminance', () => {
  it('returns 0 for pure black', () => {
    expect(getLuminance('#000000')).toBe(0);
  });

  it('returns 1 for pure white', () => {
    expect(getLuminance('#FFFFFF')).toBe(1);
  });

  it('returns correct luminance for red', () => {
    const l = getLuminance('#FF0000');
    expect(l).toBeGreaterThan(0.2);
    expect(l).toBeLessThan(0.3);
  });

  it('works with lowercase hex', () => {
    expect(getLuminance('#ffffff')).toBe(1);
  });
});

describe('textColorFor', () => {
  it('returns white text for dark colors', () => {
    const result = textColorFor('#000000');
    expect(result).toContain('255');
  });

  it('returns dark text for light colors', () => {
    const result = textColorFor('#FFFFFF');
    expect(result).toContain('rgba(0,0,0');
  });
});

describe('subTextColorFor', () => {
  it('returns semi-transparent white for dark bg', () => {
    expect(subTextColorFor('#000000')).toBe('rgba(255,255,255,.5)');
  });

  it('returns semi-transparent black for light bg', () => {
    expect(subTextColorFor('#FFFFFF')).toBe('rgba(0,0,0,.5)');
  });
});

describe('hslDistance', () => {
  it('returns 0 for identical colors', () => {
    expect(hslDistance(180, 50, 50, 180, 50, 50)).toBeCloseTo(0);
  });

  it('returns positive distance for different colors', () => {
    const d = hslDistance(0, 100, 50, 180, 100, 50);
    expect(d).toBeGreaterThan(0);
  });

  it('handles hue wrap-around (near 360/0)', () => {
    const d = hslDistance(350, 50, 50, 10, 50, 50);
    expect(d).toBeLessThan(0.1);
  });
});

describe('esc', () => {
  it('escapes HTML entities', () => {
    const result = esc('<script>alert("x")</script>');
    expect(result).not.toContain('<');
    expect(result).not.toContain('>');
  });

  it('returns empty string for falsy input', () => {
    expect(esc('')).toBe('');
    expect(esc(null)).toBe('');
    expect(esc(undefined)).toBe('');
  });

  it('returns string as-is for safe text', () => {
    expect(esc('hello world')).toBe('hello world');
  });
});

describe('FAMILY_LABELS', () => {
  it('has all 16 color families', () => {
    expect(Object.keys(FAMILY_LABELS).length).toBe(16);
  });

  it('includes red and blue', () => {
    expect(FAMILY_LABELS.red).toBe('红色');
    expect(FAMILY_LABELS.blue).toBe('蓝色');
  });
});

describe('sanitizeColors', () => {
  it('fixes known bad color names', () => {
    const colors = [{ name: '韩红', hex: '#FF0000' }];
    sanitizeColors(colors);
    expect(colors[0].name).toBe('珊瑚赤');
  });

  it('fixes source domain names', () => {
    const colors = [{ name: 'Red', hex: '#FF0000', source: 'uigradients.com' }];
    sanitizeColors(colors);
    expect(colors[0].source).toBe('UI Gradients');
  });
});

describe('sanitizeGradients', () => {
  it('fixes gradient source names', () => {
    const gradients = [{ name: 'Test', colors: ['#000'], source: 'webgradients.com' }];
    sanitizeGradients(gradients);
    expect(gradients[0].source).toBe('Web Gradients');
  });
});

describe('debounce', () => {
  it('delays function execution', async () => {
    let called = 0;
    const fn = debounce(() => { called++; }, 50);
    fn();
    fn();
    fn();
    expect(called).toBe(0);
    await new Promise(r => setTimeout(r, 80));
    expect(called).toBe(1);
  });
});
