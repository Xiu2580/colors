import { state } from '../state.js';
import { esc, textColorFor } from '../utils.js';
import { filterGradients } from '../data.js';
import { copyToClipboard } from '../ui/clipboard.js';
import { showToast } from '../ui/toast.js';

export function renderBGradientSourceTabs() {
  const sources = {};
  state.data.gradients.forEach(g => {
    sources[g.source] = (sources[g.source] || 0) + 1;
  });
  let html = `<button class="bfilter-btn${state.gradientSource === 'all' ? ' active' : ''}" data-source="all">全部渐变 (${state.data.gradients.length})</button>`;
  for (const [s, c] of Object.entries(sources)) {
    html += `<button class="bfilter-btn${state.gradientSource === s ? ' active' : ''}" data-source="${s}">${s} (${c})</button>`;
  }
  const el = document.getElementById('bGradientFilters');
  el.innerHTML = html;
  el.style.display = state.section === 'gradients' ? 'flex' : 'none';
}

export function renderBGradients() {
  const filtered = filterGradients(state.data.gradients, state);
  const container = document.getElementById('bContent');

  if (filtered.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="eicon">&#127752;</div><p>没有找到匹配的渐变</p></div>';
    return;
  }

  let html = '<div class="bgradient-grid">';
  for (const g of filtered) {
    const firstColor = g.colors[0] || '#000';
    const txtCol = textColorFor(firstColor);
    html += `<div class="bgradient-card" data-gradient="${esc(g.colors.join(','))}" data-gradname="${esc(g.name)}"><div class="bgpreview" style="background:linear-gradient(to right,${g.colors.join(',')})"><span class="bgname" style="color:${txtCol};text-shadow:0 1px 3px ${txtCol.includes('255') ? 'rgba(0,0,0,.45)' : 'rgba(255,255,255,.25)'}">${esc(g.name)}</span></div></div>`;
  }
  html += '</div>';
  container.innerHTML = html;
  document.getElementById('bStat').textContent = `显示 ${filtered.length} / ${state.data.meta?.totalGradients || 0} 个渐变`;
}
