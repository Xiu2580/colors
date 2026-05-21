import { describe, it, expect } from 'vitest';
import { parseHash } from '../src/hash.js';

describe('parseHash', () => {
  it('returns empty object for empty hash', () => {
    // Mock location.hash
    const oldHash = location.hash;
    location.hash = '';
    const result = parseHash();
    expect(result).toEqual({});
    location.hash = oldHash;
  });

  it('parses mode from hash', () => {
    const oldHash = location.hash;
    location.hash = '#mode=browse';
    const result = parseHash();
    expect(result.mode).toBe('browse');
    location.hash = oldHash;
  });

  it('parses multiple params', () => {
    const oldHash = location.hash;
    location.hash = '#mode=browse&family=red&view=list&search=樱&sort=hue';
    const result = parseHash();
    expect(result.mode).toBe('browse');
    expect(result.family).toBe('red');
    expect(result.view).toBe('list');
    expect(result.search).toBe('樱');
    expect(result.sort).toBe('hue');
    location.hash = oldHash;
  });

  it('ignores invalid values', () => {
    const oldHash = location.hash;
    location.hash = '#mode=invalid&family=nonexistent&view=table';
    const result = parseHash();
    expect(result.mode).toBeUndefined();
    expect(result.family).toBeUndefined();
    expect(result.view).toBeUndefined();
    location.hash = oldHash;
  });

  it('parses hex param', () => {
    const oldHash = location.hash;
    location.hash = '#hex=FF0000';
    const result = parseHash();
    expect(result._hashHex).toBe('FF0000');
    location.hash = oldHash;
  });
});
