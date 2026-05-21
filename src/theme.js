const STORAGE_KEY = 'ca-theme';

export function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'dark' || saved === 'light') return saved;
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme:light)').matches) return 'light';
  return 'dark';
}

export function applyTheme(theme) {
  document.body.setAttribute('data-theme', theme);
  const btn = document.getElementById('btnTheme');
  if (btn) btn.innerHTML = theme === 'dark' ? '&#9789;' : '&#9788;';
  localStorage.setItem(STORAGE_KEY, theme);
}

export function toggleTheme(theme) {
  return theme === 'dark' ? 'light' : 'dark';
}
