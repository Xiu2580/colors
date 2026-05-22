import { state, updateState } from './state.js';
import { applyTheme, toggleTheme as toggleThemeFn } from './theme.js';
import { parseHash, writeHash } from './hash.js';
import { findHexIndex } from './data.js';
import { showToast } from './ui/toast.js';
import { copyToClipboard } from './ui/clipboard.js';
import {
  renderIPanel, renderIHero, selectIColor,
  openPanel, closePanel, togglePanel, ensureINavBar
} from './render/immersive.js';
import { renderBrowse, renderBColors } from './render/browse.js';
import { renderBGradientSourceTabs, renderBGradients } from './render/browse-gradients.js';
import { openModal, closeModal, modalNav } from './render/modal.js';

let iSearchTimer, bSearchTimer;

export function bindEvents() {
  // === Mode tabs ===
  document.querySelector('.mode-tabs').addEventListener('click', e => {
    const tab = e.target.closest('.mode-tab');
    if (!tab) return;
    switchMode(tab.dataset.mode);
  });

  // === Theme toggle ===
  document.getElementById('btnTheme').addEventListener('click', () => {
    const next = toggleThemeFn(state.theme);
    updateState({ theme: next });
    applyTheme(next);
  });

  // === Immersive: float button ===
  document.getElementById('floatBtn').addEventListener('click', () => togglePanel());

  // === Immersive: panel close ===
  document.getElementById('fpClose').addEventListener('click', () => closePanel());
  document.getElementById('fpOverlay').addEventListener('click', () => closePanel());

  // === Immersive: family tags ===
  document.getElementById('fpFamilyTags').addEventListener('click', e => {
    const tag = e.target.closest('.pf-tag');
    if (!tag) return;
    updateState({ family: tag.dataset.family, currentIndex: 0, search: '' });
    document.getElementById('fpSearch').value = '';
    renderIPanel();
    renderIHero();
    writeHash(state);
  });

  // === Immersive: color list ===
  document.getElementById('fpColorList').addEventListener('click', e => {
    const item = e.target.closest('.pc-item');
    if (!item) return;
    selectIColor(parseInt(item.dataset.index));
    writeHash(state);
  });

  // === Immersive: search ===
  document.getElementById('fpSearch').addEventListener('input', e => {
    clearTimeout(iSearchTimer);
    iSearchTimer = setTimeout(() => {
      updateState({ search: e.target.value.trim(), family: 'all', currentIndex: 0 });
      renderIPanel();
      renderIHero();
      writeHash(state);
    }, 200);
  });

  // === Immersive: hex click to copy ===
  document.getElementById('iHeroHex').addEventListener('click', () => {
    const c = state.currentFiltered[state.currentIndex];
    if (c) copyToClipboard(c.hex);
  });

  // === Immersive: similar dots ===
  document.getElementById('iSimilar').addEventListener('click', e => {
    const dot = e.target.closest('.isdot');
    if (!dot) return;
    const colors = state.currentFiltered;
    const idx = findHexIndex(colors, dot.dataset.hex);
    if (idx >= 0) selectIColor(idx);
    writeHash(state);
  });

  // === Immersive: bottom nav bar ===
  document.getElementById('immersiveView').addEventListener('click', e => {
    const btn = e.target.closest('.inav-btn');
    if (!btn) return;
    const filtered = state.currentFiltered;
    switch (btn.dataset.action) {
      case 'panel': togglePanel(); break;
      case 'prev':
        selectIColor((state.currentIndex - 1 + filtered.length) % filtered.length);
        writeHash(state); break;
      case 'next':
        selectIColor((state.currentIndex + 1) % filtered.length);
        writeHash(state); break;
      case 'random':
        selectIColor(Math.floor(Math.random() * filtered.length));
        writeHash(state); break;
      case 'copy': {
        const c = filtered[state.currentIndex];
        if (c) copyToClipboard(c.hex);
      } break;
    }
  });

  // === Immersive: gradient strip ===
  document.getElementById('iGradientStrip').addEventListener('click', e => {
    const bar = e.target.closest('.igbar');
    if (!bar) return;
    updateState({ section: 'gradients' });
    switchMode('browse');
  });

  // === Browse: search ===
  document.getElementById('bSearchInput').addEventListener('input', e => {
    clearTimeout(bSearchTimer);
    bSearchTimer = setTimeout(() => {
      updateState({ search: e.target.value.trim(), family: 'all' });
      renderBrowse();
    }, 200);
  });

  // === Browse: view buttons ===
  document.getElementById('bBtnGrid').addEventListener('click', () => {
    updateState({ view: 'grid' });
    renderBrowse();
  });
  document.getElementById('bBtnList').addEventListener('click', () => {
    updateState({ view: 'list' });
    renderBrowse();
  });
  document.getElementById('bBtnSpectrum').addEventListener('click', () => {
    updateState({ view: 'spectrum' });
    renderBrowse();
  });

  // === Browse: sort ===
  document.getElementById('bSort').addEventListener('change', e => {
    updateState({ sort: e.target.value });
    renderBrowse();
  });

  // === Browse: section tabs ===
  document.getElementById('bSectionTabs').addEventListener('click', e => {
    const tab = e.target.closest('.bstab-i');
    if (!tab) return;
    updateState({ section: tab.dataset.section });
    renderBrowse();
    renderBGradientSourceTabs();
    if (state.section === 'gradients') {
      renderBGradients();
    }
  });

  // === Browse: family filters ===
  document.getElementById('bFilters').addEventListener('click', e => {
    const btn = e.target.closest('.bfilter-btn');
    if (!btn) return;
    updateState({ family: btn.dataset.family });
    renderBrowse();
  });

  // === Browse: gradient source filters ===
  document.getElementById('bGradientFilters').addEventListener('click', e => {
    const btn = e.target.closest('.bfilter-btn');
    if (!btn) return;
    updateState({ gradientSource: btn.dataset.source });
    renderBGradientSourceTabs();
    renderBGradients();
    writeHash(state);
  });

  // === Browse: content clicks (cards, rows, spectrum, gradients) ===
  document.getElementById('bContent').addEventListener('click', e => {
    const card = e.target.closest('.bcard');
    const row = e.target.closest('.brow');
    const slice = e.target.closest('.bsslice');
    const gcard = e.target.closest('.bgradient-card');
    if (card) { openModal(parseInt(card.dataset.index)); }
    else if (row) { openModal(parseInt(row.dataset.index)); }
    else if (slice) { openModal(parseInt(slice.dataset.index)); }
    else if (gcard) {
      copyToClipboard(gcard.dataset.gradient);
      showToast('已复制渐变: ' + gcard.dataset.gradname);
    }
  });

  // === Modal overlay ===
  document.getElementById('modalOverlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });

  // === Custom event: open-in-immersive from modal ===
  document.addEventListener('ca:open-immersive', e => {
    switchMode('immersive');
    const idx = findHexIndex(state.currentFiltered, e.detail.hex);
    if (idx >= 0) {
      updateState({ currentIndex: idx });
      renderIHero();
      writeHash(state);
    }
  });

  // === Keyboard ===
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' && e.key !== 'Escape') return;

    if (e.key === 'Escape') {
      if (state.modalIndex >= 0) { closeModal(); return; }
      if (state.mode === 'immersive') { closePanel(); return; }
    }
    if (e.key === '1' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); switchMode('immersive'); return; }
    if (e.key === '2' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); switchMode('browse'); return; }

    if (state.modalIndex >= 0) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); modalNav(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); modalNav(1); }
      return;
    }

    if (state.mode === 'immersive') {
      const filtered = state.currentFiltered;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIdx = (state.currentIndex + 1) % filtered.length;
        selectIColor(nextIdx);
        writeHash(state);
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIdx = (state.currentIndex - 1 + filtered.length) % filtered.length;
        selectIColor(prevIdx);
        writeHash(state);
      }
      if (e.key === 'k' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        openPanel();
        document.getElementById('fpSearch').focus();
      }
    }
  });

  // === Hash change ===
  window.addEventListener('hashchange', () => {
    const parsed = parseHash();
    updateState(parsed);
    if (state.mode === 'immersive') {
      document.getElementById('fpSearch').value = state.search;
      renderIPanel();
      if (parsed._hashHex) {
        const idx = findHexIndex(state.currentFiltered, '#' + parsed._hashHex);
        if (idx >= 0) updateState({ currentIndex: idx });
      }
      renderIHero();
    } else {
      renderBrowse();
    }
  });
}

export function switchMode(mode) {
  updateState({ mode });
  document.querySelectorAll('.mode-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.mode === mode);
  });
  document.getElementById('immersiveView').style.display = mode === 'immersive' ? 'flex' : 'none';
  document.getElementById('browseView').style.display = mode === 'browse' ? 'flex' : 'none';

  if (mode === 'immersive') {
    ensureINavBar();
    renderIPanel();
    renderIHero();
    closePanel();
  } else {
    renderBrowse();
    renderBGradientSourceTabs();
    if (state.section === 'gradients') {
      renderBGradients();
    }
  }
  writeHash(state);
}
