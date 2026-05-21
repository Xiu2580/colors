import { state } from '../state.js';

let _timer = null;

export function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(_timer);
  _timer = setTimeout(() => t.classList.remove('show'), 1600);
}
