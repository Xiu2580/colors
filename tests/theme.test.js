import { describe, it, expect, beforeEach } from 'vitest';
import { initTheme, applyTheme, toggleTheme } from '../src/theme.js';

describe('initTheme', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns dark as default', () => {
    expect(initTheme()).toBe('dark');
  });

  it('returns saved theme from localStorage', () => {
    localStorage.setItem('ca-theme', 'light');
    expect(initTheme()).toBe('light');
  });
});

describe('toggleTheme', () => {
  it('toggles dark to light', () => {
    expect(toggleTheme('dark')).toBe('light');
  });

  it('toggles light to dark', () => {
    expect(toggleTheme('light')).toBe('dark');
  });
});

describe('applyTheme', () => {
  it('sets data-theme attribute on body', () => {
    document.body.setAttribute('data-theme', 'dark');
    applyTheme('light');
    expect(document.body.getAttribute('data-theme')).toBe('light');
  });

  it('persists to localStorage', () => {
    applyTheme('dark');
    expect(localStorage.getItem('ca-theme')).toBe('dark');
    applyTheme('light');
    expect(localStorage.getItem('ca-theme')).toBe('light');
  });
});
