import { state, updateState } from '../state.js';
import { FAMILY_LABELS, esc } from '../utils.js';
import { applyFilters, sortColors, getColorStats } from '../data.js';
import { openModal } from './modal.js';

function getFilteredSorted() {
  const filtered = applyFilters(state.data.solidColors, state);
  return sortColors(filtered, state.sort);
}

export function renderBFamilyTabs() {
  const families = state.data.meta?.colorFamilies || {};
  let html = `<button class="bfilter-btn${state.family === 'all' ? ' active' : ''}" data-family="all">全部 (${state.data.meta?.totalSolidColors || 0})</button>`;
  for (const [f, c] of Object.entries(families).sort((a, b) => b[1] - a[1])) {
    html += `<button class="bfilter-btn${state.family === f ? ' active' : ''}" data-family="${f}">${FAMILY_LABELS[f] || f} (${c})</button>`;
  }
  document.getElementById('bFilters').innerHTML = html;
}

export function renderBColors() {
  const filtered = getFilteredSorted();
  updateState({ currentFiltered: filtered });
  const container = document.getElementById('bContent');

  if (filtered.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="eicon">&#128270;</div><p>没有找到匹配的颜色</p><p style="font-size:.78rem;color:var(--text3)">尝试修改筛选条件或搜索词</p></div>';
    return;
  }

  switch (state.view) {
    case 'list': renderBList(filtered, container); break;
    case 'spectrum': renderBSpectrum(filtered, container); break;
    default: renderBGrid(filtered, container); break;
  }
  document.getElementById('bStat').textContent = `显示 ${filtered.length} / ${state.data.meta?.totalSolidColors || 0} 种`;
}

function renderBGrid(colors, container) {
  let html = '<div class="bgrid">';
  for (let i = 0; i < colors.length; i++) {
    const c = colors[i];
    const rgb = c.rgb || [0, 0, 0];
    const family = FAMILY_LABELS[c.colorFamily] || c.colorFamily;
    html += `<div class="bcard" data-index="${i}" data-hex="${c.hex}"><div class="bcswatch" style="background:${c.hex}"><span class="bcwatermark">${c.hex}</span></div><div class="bcinfo"><div class="bcname-row"><span class="bcname-cn">${esc(c.name || '未命名')}</span>${c.nameEn ? '<span class="bcname-en">' + esc(c.nameEn) + '</span>' : ''}</div><div class="bctags"><span class="bctag">RGB ${rgb[0]},${rgb[1]},${rgb[2]}</span><span class="bctag family">${family}</span></div></div></div>`;
  }
  html += '</div>';
  container.innerHTML = html;
}

function renderBList(colors, container) {
  let html = '<div class="blist">';
  for (let i = 0; i < colors.length; i++) {
    const c = colors[i];
    html += `<div class="brow" data-index="${i}" data-hex="${c.hex}"><div class="brswatch" style="background:${c.hex}"></div><div class="brhex">${c.hex}</div><div class="brname">${esc(c.name || '')}${c.nameEn ? ' / ' + esc(c.nameEn) : ''}</div><div class="brfamily">${FAMILY_LABELS[c.colorFamily] || c.colorFamily}</div></div>`;
  }
  html += '</div>';
  container.innerHTML = html;
}

function renderBSpectrum(colors, container) {
  const sorted = [...colors].sort((a, b) => (a.hsl?.[0] ?? 0) - (b.hsl?.[0] ?? 0));
  updateState({ currentFiltered: sorted });
  let html = '<div class="bspectrum" id="bSpectrumStrip">';
  for (let i = 0; i < sorted.length; i++) {
    html += `<div class="bsslice" data-index="${i}" data-hex="${sorted[i].hex}" style="background:${sorted[i].hex}"></div>`;
  }
  html += '</div><p style="text-align:center;color:var(--text2);font-size:.75rem;margin-top:.4rem">' + sorted.length + ' 种颜色按色相排列 · 悬停查看 · 点击打开</p>';
  container.innerHTML = html;

  const tooltip = document.getElementById('specTooltip');
  const strip = document.getElementById('bSpectrumStrip');
  if (!strip) return;
  strip.addEventListener('mouseover', e => {
    const slice = e.target.closest('.bsslice');
    if (!slice) { tooltip.classList.remove('show'); return; }
    const c = sorted[parseInt(slice.dataset.index)];
    if (!c) return;
    tooltip.innerHTML = `<strong>${c.hex}</strong> ${esc(c.name || '')} ${esc(c.nameEn || '')}`;
    tooltip.classList.add('show');
  });
  strip.addEventListener('mousemove', e => {
    tooltip.style.left = (e.clientX + 12) + 'px';
    tooltip.style.top = (e.clientY - 40) + 'px';
  });
  strip.addEventListener('mouseleave', () => tooltip.classList.remove('show'));
}

export function renderBrowse() {
  document.querySelectorAll('.bstab-i').forEach(t => t.classList.toggle('active', t.dataset.section === state.section));
  document.querySelectorAll('#bFilters .bfilter-btn').forEach(b => b.classList.toggle('active', b.dataset.family === state.family));
  document.querySelectorAll('#bGradientFilters .bfilter-btn').forEach(b => b.classList.toggle('active', b.dataset.source === state.gradientSource));
  document.getElementById('bSearchInput').value = state.search;
  document.getElementById('bSort').value = state.sort;

  const isGrad = state.section === 'gradients';
  document.getElementById('bBtnGrid').style.display = isGrad ? 'none' : '';
  document.getElementById('bBtnList').style.display = isGrad ? 'none' : '';
  document.getElementById('bBtnSpectrum').style.display = isGrad ? 'none' : '';
  document.getElementById('bSort').style.display = isGrad ? 'none' : '';

  if (!isGrad) {
    document.getElementById('bBtnGrid').classList.toggle('active', state.view === 'grid');
    document.getElementById('bBtnList').classList.toggle('active', state.view === 'list');
    document.getElementById('bBtnSpectrum').classList.toggle('active', state.view === 'spectrum');
  }

  renderBFamilyTabs();
  if (state.section === 'colors') {
    renderBColors();
  }
}
