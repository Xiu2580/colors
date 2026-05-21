import { state, updateState } from '../state.js';
import { FAMILY_LABELS, esc } from '../utils.js';
import { findSimilar } from '../data.js';
import { copyToClipboard } from '../ui/clipboard.js';
import { showToast } from '../ui/toast.js';

function getFiltered() {
  return state.currentFiltered;
}

export function openModal(index) {
  const colors = getFiltered();
  if (index < 0 || index >= colors.length) return;
  updateState({ modalIndex: index });
  renderModal(colors[index], index, colors.length);
  document.getElementById('modalOverlay').classList.add('show');
}

export function closeModal() {
  document.getElementById('modalOverlay').classList.remove('show');
  updateState({ modalIndex: -1 });
}

export function modalNav(dir) {
  const colors = getFiltered();
  if (colors.length === 0) return;
  const idx = (state.modalIndex + dir + colors.length) % colors.length;
  updateState({ modalIndex: idx });
  renderModal(colors[idx], idx, colors.length);
}

export function renderModal(color, index, total) {
  const rgb = color.rgb || [];
  const hsl = color.hsl || [];
  const cmykStr = typeof color.cmyk === 'string'
    ? color.cmyk
    : (Array.isArray(color.cmyk) ? color.cmyk.join(', ') : '—');
  const similar = findSimilar(color.hex, state.data.solidColors, 8);
  const hexClean = color.hex.replace('#', '');

  const modal = document.getElementById('modal');
  modal.innerHTML = `
    <button class="modal-close" id="modalClose">&times;</button>
    <div class="modal-swatch" style="background:${color.hex}">
      ${total > 1 ? `<button class="modal-nav-btn prev" id="modalPrev">&#8249;</button>` : ''}
      ${total > 1 ? `<button class="modal-nav-btn next" id="modalNext">&#8250;</button>` : ''}
      <div class="swatch-badge"><span>${FAMILY_LABELS[color.colorFamily] || color.colorFamily}</span></div>
    </div>
    <div class="modal-title">
      <span>${esc(color.name || '未命名')}</span>
      ${color.nameEn ? '<span style="font-weight:400;color:var(--text2);font-size:.88rem">/ ' + esc(color.nameEn) + '</span>' : ''}
      <span style="margin-left:auto;font-size:.74rem;color:var(--text3);font-weight:400">${index + 1} / ${total}</span>
    </div>
    <div class="modal-value-chips">
      <div class="modal-value-chip" data-copy="${color.hex}"><span class="vlabel">HEX</span><span class="vvalue">${color.hex}</span><span class="vcopy-icon">&#9112;</span></div>
      <div class="modal-value-chip" data-copy="rgb(${rgb[0] || 0}, ${rgb[1] || 0}, ${rgb[2] || 0})"><span class="vlabel">RGB</span><span class="vvalue">rgb(${rgb[0] || 0}, ${rgb[1] || 0}, ${rgb[2] || 0})</span><span class="vcopy-icon">&#9112;</span></div>
      <div class="modal-value-chip" data-copy="hsl(${hsl[0] || 0}, ${hsl[1] || 0}%, ${hsl[2] || 0}%)"><span class="vlabel">HSL</span><span class="vvalue">hsl(${hsl[0] || 0}, ${hsl[1] || 0}%, ${hsl[2] || 0}%)</span><span class="vcopy-icon">&#9112;</span></div>
      <div class="modal-value-chip" data-copy="${cmykStr}"><span class="vlabel">CMYK</span><span class="vvalue">${cmykStr}</span><span class="vcopy-icon">&#9112;</span></div>
    </div>
    ${similar.length > 0 ? `<div class="modal-section-title">相似颜色 (HSL距离最近)</div><div class="modal-similar">${similar.map(s => `<div class="ms" style="background:${s.hex}" data-hex="${s.hex}" title="${s.hex} ${esc(s.name || '')}"><div class="mshex">${s.hex}</div></div>`).join('')}</div>` : ''}
    <div class="modal-actions">
      <button class="modal-action-btn primary" id="modalOpenImmersive">&#9671; 在沉浸模式中打开</button>
      <button class="modal-action-btn" id="modalShare">&#128279; 分享</button>
    </div>`;

  document.getElementById('modalClose').onclick = () => closeModal();
  if (total > 1) {
    document.getElementById('modalPrev').onclick = () => modalNav(-1);
    document.getElementById('modalNext').onclick = () => modalNav(1);
  }
  document.getElementById('modalOpenImmersive').onclick = () => {
    document.dispatchEvent(new CustomEvent('ca:open-immersive', { detail: { hex: color.hex } }));
    closeModal();
  };
  document.getElementById('modalShare').onclick = () => {
    const url = location.origin + location.pathname + '#hex=' + hexClean;
    copyToClipboard(url);
    showToast('已复制分享链接');
  };
  modal.querySelectorAll('.modal-value-chip').forEach(chip => {
    chip.onclick = () => copyToClipboard(chip.dataset.copy);
  });
  modal.querySelectorAll('.ms').forEach(s => {
    s.onclick = () => copyToClipboard(s.dataset.hex);
  });
}
