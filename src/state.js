export const state = {
  mode: 'immersive',
  family: 'all',
  search: '',
  sort: 'default',
  view: 'grid',
  section: 'colors',
  gradientSource: 'all',
  theme: 'dark',
  currentIndex: 0,
  modalIndex: -1,
  currentFiltered: [],
  data: null,
  loaded: false,
  _hashHex: null
};

const _subscribers = [];

export function updateState(partial) {
  Object.assign(state, partial);
  for (const fn of _subscribers) fn(partial);
}

export function onStateChange(fn) {
  _subscribers.push(fn);
  return () => {
    const idx = _subscribers.indexOf(fn);
    if (idx >= 0) _subscribers.splice(idx, 1);
  };
}
