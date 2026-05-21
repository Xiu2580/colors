import { describe, it, expect, beforeEach } from 'vitest';
import { state, updateState, onStateChange } from '../src/state.js';

describe('state', () => {
  beforeEach(() => {
    // Reset state to defaults
    state.mode = 'immersive';
    state.family = 'all';
    state.search = '';
    state.sort = 'default';
    state.view = 'grid';
    state.section = 'colors';
    state.gradientSource = 'all';
    state.currentIndex = 0;
    state.modalIndex = -1;
    state.currentFiltered = [];
    state._hashHex = null;
  });

  it('has default values', () => {
    expect(state.mode).toBe('immersive');
    expect(state.family).toBe('all');
    expect(state.currentIndex).toBe(0);
  });
});

describe('updateState', () => {
  beforeEach(() => {
    state.mode = 'immersive';
    state.family = 'all';
    state.search = '';
  });

  it('merges partial state', () => {
    updateState({ mode: 'browse', family: 'red' });
    expect(state.mode).toBe('browse');
    expect(state.family).toBe('red');
  });

  it('notifies subscribers', () => {
    let notified = null;
    const unsub = onStateChange(partial => { notified = partial; });
    updateState({ search: 'red' });
    expect(notified).toEqual({ search: 'red' });
    unsub();
  });
});

describe('onStateChange', () => {
  it('returns unsubscribe function that works', () => {
    let count = 0;
    const unsub = onStateChange(() => { count++; });
    updateState({ mode: 'browse' });
    expect(count).toBe(1);
    unsub();
    updateState({ mode: 'immersive' });
    expect(count).toBe(1);
  });
});
