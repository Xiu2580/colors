import { FAMILY_LABELS } from './utils.js';

export function parseHash() {
  const raw = location.hash.replace(/^#/, '');
  const params = {};
  raw.split('&').forEach(p => {
    const [k, v] = p.split('=');
    if (k && v !== undefined) params[k] = decodeURIComponent(v);
  });

  const result = {};
  if (params.mode && ['immersive', 'browse'].includes(params.mode)) result.mode = params.mode;
  if (params.family && (params.family === 'all' || FAMILY_LABELS[params.family])) result.family = params.family;
  if (params.view && ['grid', 'list', 'spectrum'].includes(params.view)) result.view = params.view;
  if (params.sort && ['default', 'hue', 'lightness', 'saturation', 'name'].includes(params.sort)) result.sort = params.sort;
  if (params.search !== undefined) result.search = params.search;
  if (params.section && ['colors', 'gradients'].includes(params.section)) result.section = params.section;
  if (params.gs !== undefined) result.gradientSource = params.gs;
  if (params.hex) result._hashHex = params.hex.toUpperCase();

  return result;
}

export function writeHash(state) {
  const parts = [];
  if (state.mode !== 'immersive') parts.push('mode=' + encodeURIComponent(state.mode));
  if (state.family !== 'all') parts.push('family=' + encodeURIComponent(state.family));
  if (state.view !== 'grid') parts.push('view=' + encodeURIComponent(state.view));
  if (state.sort !== 'default') parts.push('sort=' + encodeURIComponent(state.sort));
  if (state.search) parts.push('search=' + encodeURIComponent(state.search));
  if (state.section !== 'colors') parts.push('section=' + encodeURIComponent(state.section));
  if (state.gradientSource !== 'all') parts.push('gs=' + encodeURIComponent(state.gradientSource));
  if (state.mode === 'immersive') {
    const fc = state.currentFiltered[state.currentIndex];
    if (fc) parts.push('hex=' + fc.hex.replace('#', ''));
  }
  const hash = parts.join('&');
  history.replaceState(null, '', location.pathname + location.search + (hash ? '#' + hash : ''));
}
