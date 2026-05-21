export const FAMILY_LABELS = {
  red: '红色', vermillion: '朱红', orange: '橙色', yellow: '黄色',
  'yellow-green': '黄绿', green: '绿色', cyan: '青色', 'blue-green': '蓝绿',
  blue: '蓝色', purple: '紫色', pink: '粉色', rose: '玫红',
  brown: '棕色', gray: '灰色', white: '白色', black: '黑色'
};

const SOURCE_FIX = {
  'uigradients.com': 'UI Gradients',
  'webgradients.com': 'Web Gradients',
  'coolhue': 'CoolHue',
  'zhongguose.com': '中国色',
  'hao.uisdc.com': 'HAO UISDC',
  'nipponcolors.com': 'Nippon Colors'
};

const NAME_FIX = {
  '韩红': '珊瑚赤'
};

export function getLuminance(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const lin = c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function textColorFor(hex) {
  return getLuminance(hex) > 0.35 ? 'rgba(0,0,0,.85)' : 'rgba(255,255,255,.92)';
}

export function subTextColorFor(hex) {
  return getLuminance(hex) > 0.35 ? 'rgba(0,0,0,.5)' : 'rgba(255,255,255,.5)';
}

export function hslDistance(h1, s1, l1, h2, s2, l2) {
  let dH = Math.abs(h1 - h2);
  if (dH > 180) dH = 360 - dH;
  const dS = s1 - s2;
  const dL = l1 - l2;
  return Math.sqrt((dH / 360) ** 2 + (dS / 200) ** 2 + (dL / 200) ** 2);
}

export function esc(str) {
  if (!str) return '';
  const d = document.createElement('div');
  d.textContent = String(str);
  return d.innerHTML;
}

export function sanitizeColors(colors) {
  for (const c of colors) {
    if (NAME_FIX[c.name]) c.name = NAME_FIX[c.name];
    if (c.source && SOURCE_FIX[c.source]) c.source = SOURCE_FIX[c.source];
  }
  return colors;
}

export function sanitizeGradients(gradients) {
  for (const g of gradients) {
    if (g.source && SOURCE_FIX[g.source]) g.source = SOURCE_FIX[g.source];
  }
  return gradients;
}

export function debounce(fn, ms) {
  let t;
  return function (...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), ms);
  };
}
