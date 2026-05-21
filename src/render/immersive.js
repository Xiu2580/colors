import { state, updateState } from '../state.js';
import { FAMILY_LABELS, esc, textColorFor, subTextColorFor } from '../utils.js';
import { applyFilters, sortColors, findSimilar, findHexIndex, findGradientsForHex } from '../data.js';
import { copyToClipboard } from '../ui/clipboard.js';
import { showToast } from '../ui/toast.js';

function getFilteredSorted() {
  const filtered = applyFilters(state.data.solidColors, state);
  return sortColors(filtered, state.sort);
}

export function renderIPanel() {
  const filtered = getFilteredSorted();
  updateState({ currentFiltered: filtered });
  document.getElementById('fpCount').textContent = `${filtered.length} 种颜色`;

  const families = state.data.meta?.colorFamilies || {};
  let tags = `<span class="pf-tag${state.family === 'all' ? ' active' : ''}" data-family="all">全部</span>`;
  for (const [f, c] of Object.entries(families).sort((a, b) => b[1] - a[1])) {
    tags += `<span class="pf-tag${state.family === f ? ' active' : ''}" data-family="${f}">${FAMILY_LABELS[f] || f}</span>`;
  }
  document.getElementById('fpFamilyTags').innerHTML = tags;

  const list = document.getElementById('fpColorList');
  if (filtered.length === 0) {
    list.innerHTML = '<div class="pempty">没有找到匹配的颜色</div>';
    return;
  }

  let html = '', lastFamily = null;
  for (let i = 0; i < filtered.length; i++) {
    const c = filtered[i];
    if (c.colorFamily !== lastFamily) {
      lastFamily = c.colorFamily;
      html += `<div class="pgroup-hdr">${FAMILY_LABELS[lastFamily] || lastFamily}</div>`;
    }
    const active = i === state.currentIndex ? ' active' : '';
    html += `<div class="pc-item${active}" data-index="${i}" data-hex="${c.hex}">
      <div class="pdot" style="background:${c.hex}"></div>
      <span class="pname">${esc(c.name || '未命名')}${c.nameEn ? ' <span style="opacity:.45;font-size:.68rem">' + esc(c.nameEn) + '</span>' : ''}</span>
      <span class="phex">${c.hex}</span>
    </div>`;
  }
  list.innerHTML = html;
}

export function renderIHero() {
  const filtered = getFilteredSorted();
  if (filtered.length === 0) return;
  if (state.currentIndex >= filtered.length) updateState({ currentIndex: 0 });

  const c = filtered[state.currentIndex];
  const hex = c.hex;
  const textCol = textColorFor(hex);
  const subCol = subTextColorFor(hex);
  const rgb = c.rgb || [];
  const hsl = c.hsl || [];

  const main = document.getElementById('iMain');
  main.style.background = hex;
  main.style.color = textCol;
  document.getElementById('iTopHint').style.color = subCol;
  document.getElementById('fbDot').style.background = hex;

  document.getElementById('iHeroName').textContent = c.name || '未命名';
  document.getElementById('iHeroEn').textContent = c.nameEn || '';
  const hexEl = document.getElementById('iHeroHex');
  hexEl.textContent = hex;
  hexEl.style.cursor = 'pointer';
  hexEl.title = '点击复制';
  document.getElementById('iSourceTag').textContent = `${state.currentIndex + 1} / ${filtered.length}`;
  document.title = `${c.name || '色彩'} - ${hex}`;

  document.getElementById('iValues').innerHTML = `
    <div class="ivg"><div class="ivl">RGB</div><div class="ivn">${rgb[0] || 0}, ${rgb[1] || 0}, ${rgb[2] || 0}</div></div>
    <div class="ivg"><div class="ivl">HSL</div><div class="ivn">${hsl[0] || 0}&deg;, ${hsl[1] || 0}%, ${hsl[2] || 0}%</div></div>
    <div class="ivg"><div class="ivl">CMYK</div><div class="ivn">${typeof c.cmyk === 'string' ? c.cmyk : (Array.isArray(c.cmyk) ? c.cmyk.join(', ') : '—')}</div></div>`;

  const similar = findSimilar(hex, state.data.solidColors, 8);
  let simHTML = '<span class="islabel">相似色</span>';
  for (const s of similar) {
    simHTML += `<div class="isdot" style="background:${s.hex}" data-hex="${s.hex}" title="${s.hex} ${esc(s.name || '')}"></div>`;
  }
  document.getElementById('iSimilar').innerHTML = simHTML;

  const grads = findGradientsForHex(hex, state.data.gradients);
  const gs = document.getElementById('iGradientStrip');
  if (grads.length > 0) {
    gs.style.display = '';
    gs.innerHTML = `<div class="igbar" style="background:linear-gradient(to right,${grads[0].colors.join(',')})" data-grad="${esc(grads[0].colors.join(','))}" data-gname="${esc(grads[0].name)}"></div><div class="ighint">${grads.length} 个渐变包含此颜色</div>`;
  } else {
    gs.style.display = 'none';
  }

  // Update active item in panel list
  document.querySelectorAll('.pc-item').forEach(item => {
    item.classList.toggle('active', parseInt(item.dataset.index) === state.currentIndex);
  });
  const activeItem = document.querySelector('.pc-item.active');
  if (activeItem) activeItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

export function selectIColor(index) {
  const filtered = getFilteredSorted();
  if (index < 0 || index >= filtered.length) return;
  updateState({ currentIndex: index });
  renderIHero();
  closePanel();
}

export function openPanel() {
  document.getElementById('floatPanel').classList.add('open');
  document.getElementById('fpOverlay').classList.add('show');
}

export function closePanel() {
  document.getElementById('floatPanel').classList.remove('open');
  document.getElementById('fpOverlay').classList.remove('show');
}

export function togglePanel() {
  if (document.getElementById('floatPanel').classList.contains('open')) {
    closePanel();
  } else {
    openPanel();
  }
}

export function ensureINavBar() {
  if (document.getElementById('immersiveNav')) return;
  const nav = document.createElement('div');
  nav.id = 'immersiveNav';
  nav.className = 'immersive-nav';
  nav.innerHTML = `<button class="inav-btn" data-action="panel" title="颜色列表">&#9776;</button><button class="inav-btn" data-action="prev" title="上一个">&#8249;</button><button class="inav-btn" data-action="next" title="下一个">&#8250;</button><div class="inav-divider"></div><button class="inav-btn" data-action="random" title="随机">&#9861;</button><button class="inav-btn" data-action="copy" title="复制 HEX">&#9112;</button>`;
  document.getElementById('immersiveView').appendChild(nav);
}
