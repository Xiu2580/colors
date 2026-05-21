import './css/theme.css';
import './css/base.css';
import './css/topbar.css';
import './css/immersive.css';
import './css/browse.css';
import './css/modal.css';
import './css/responsive.css';

import { state, updateState } from './state.js';
import { initTheme, applyTheme } from './theme.js';
import { parseHash } from './hash.js';
import { esc } from './utils.js';
import { loadData, findHexIndex } from './data.js';
import { renderIPanel, renderIHero } from './render/immersive.js';
import { renderBrowse } from './render/browse.js';
import { bindEvents, switchMode } from './events.js';

async function init() {
  // Theme
  const theme = initTheme();
  updateState({ theme });
  applyTheme(theme);

  // Bind events early so UI is responsive
  bindEvents();

  // Load data
  try {
    const data = await loadData();
    updateState({ data, loaded: true });

    document.getElementById('topStat').textContent = `${data.meta.totalSolidColors || 0} 纯色 · ${data.meta.totalGradients || 0} 渐变`;
    const loadEl = document.getElementById('iLoading');
    if (loadEl) loadEl.remove();

    // Restore state from hash
    const parsed = parseHash();
    updateState(parsed);

    if (state.mode === 'immersive') {
      renderIPanel();
      if (parsed._hashHex) {
        const idx = findHexIndex(state.currentFiltered, '#' + parsed._hashHex);
        if (idx >= 0) updateState({ currentIndex: idx });
      }
      renderIHero();
    }

    // Initial mode render
    switchMode(state.mode);
  } catch (err) {
    document.getElementById('iMain').innerHTML = `<div style="text-align:center;color:inherit;font-family:system-ui,sans-serif;padding:2rem"><p style="font-size:1.5rem">加载失败</p><p style="opacity:.6;margin-top:.5rem">${esc(err.message)}</p><p style="opacity:.4;font-size:.78rem">请确保 colors_organized.json 在此页面同一域下</p></div>`;
    document.getElementById('topStat').textContent = '数据加载失败';
  }
}

// Bootstrap
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
