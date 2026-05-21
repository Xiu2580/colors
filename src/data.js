import { sanitizeColors, sanitizeGradients, hslDistance } from './utils.js';

let _data = null;

export function getData() {
  return _data;
}

export async function loadData() {
  const resp = await fetch(import.meta.env.BASE_URL + 'colors_organized.json');
  if (!resp.ok) throw new Error('HTTP ' + resp.status);
  const json = await resp.json();

  const solidColors = sanitizeColors(json.solidColors || []);
  const gradients = sanitizeGradients(json.gradients || []);
  const meta = json.meta || {};

  _data = { solidColors, gradients, meta };
  return _data;
}

export function applyFilters(data, state) {
  let colors = data || [];
  if (state.family !== 'all') {
    colors = colors.filter(c => c.colorFamily === state.family);
  }
  if (state.search) {
    const q = state.search.toLowerCase();
    colors = colors.filter(c =>
      c.hex.toLowerCase().includes(q) ||
      (c.name || '').toLowerCase().includes(q) ||
      (c.nameEn || '').toLowerCase().includes(q)
    );
  }
  return colors;
}

export function sortColors(colors, sort) {
  switch (sort) {
    case 'hue':
      return [...colors].sort((a, b) => (a.hsl?.[0] ?? 0) - (b.hsl?.[0] ?? 0));
    case 'lightness':
      return [...colors].sort((a, b) => (a.hsl?.[2] ?? 0) - (b.hsl?.[2] ?? 0));
    case 'saturation':
      return [...colors].sort((a, b) => (a.hsl?.[1] ?? 0) - (b.hsl?.[1] ?? 0));
    case 'name':
      return [...colors].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'zh'));
    default:
      return colors;
  }
}

export function findSimilar(hex, allColors, n) {
  const target = allColors.find(c => c.hex.toUpperCase() === hex.toUpperCase());
  if (!target) return [];

  const h1 = target.hsl?.[0] ?? 0;
  const s1 = target.hsl?.[1] ?? 0;
  const l1 = target.hsl?.[2] ?? 0;
  const upper = hex.toUpperCase();

  const results = [];
  for (const c of allColors) {
    if (c.hex.toUpperCase() === upper) continue;
    const d = hslDistance(h1, s1, l1, c.hsl?.[0] ?? 0, c.hsl?.[1] ?? 0, c.hsl?.[2] ?? 0);
    results.push({ ...c, _dist: d });
  }
  results.sort((a, b) => a._dist - b._dist);
  return results.slice(0, n);
}

export function findHexIndex(colors, hex) {
  const key = hex.toUpperCase();
  return colors.findIndex(c => c.hex.toUpperCase() === key);
}

export function findGradientsForHex(hex, gradients) {
  const key = hex.toUpperCase();
  return gradients.filter(g => g.colors.some(c => c.toUpperCase() === key));
}

export function filterGradients(gradients, state) {
  let result = gradients || [];
  if (state.gradientSource !== 'all') {
    result = result.filter(g => g.source === state.gradientSource);
  }
  if (state.search) {
    const q = state.search.toLowerCase();
    result = result.filter(g =>
      g.name.toLowerCase().includes(q) ||
      g.colors.some(c => c.toLowerCase().includes(q))
    );
  }
  return result;
}

export function getColorStats(colors) {
  const families = {};
  for (const c of colors) {
    const f = c.colorFamily || 'unknown';
    families[f] = (families[f] || 0) + 1;
  }
  return families;
}
