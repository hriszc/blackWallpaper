// ---- Utilities: Color parsing and conversion ----

function clamp(n, min, max) { return Math.min(max, Math.max(min, n)); }

function toHex2(n) {
  const s = clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0');
  return s.toUpperCase();
}

function hexFromRGB({ r, g, b }) {
  return `#${toHex2(r)}${toHex2(g)}${toHex2(b)}`;
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max - min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s /= 100; l /= 100;
  if (s === 0) {
    const v = Math.round(l * 255); return { r: v, g: v, b: v };
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hk = h / 360;
  const tc = [hk + 1/3, hk, hk - 1/3].map(t => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  });
  return { r: Math.round(tc[0] * 255), g: Math.round(tc[1] * 255), b: Math.round(tc[2] * 255) };
}

function parseHex(str) {
  const s = str.trim().replace(/^#/,'');
  if (/^[0-9a-fA-F]{3}$/.test(s)) {
    const r = parseInt(s[0] + s[0], 16);
    const g = parseInt(s[1] + s[1], 16);
    const b = parseInt(s[2] + s[2], 16);
    return { r, g, b };
  }
  if (/^[0-9a-fA-F]{6}$/.test(s)) {
    const r = parseInt(s.slice(0,2), 16);
    const g = parseInt(s.slice(2,4), 16);
    const b = parseInt(s.slice(4,6), 16);
    return { r, g, b };
  }
  return null;
}

function parseRgb(str) {
  const s = str.trim().toLowerCase().replace(/\s+/g, '');
  const m = s.match(/^rgba?\(([^)]+)\)$/) || s.match(/^([0-9.,]+)$/);
  if (!m) return null;
  const parts = m[1].split(',');
  if (parts.length < 3) return null;
  const nums = parts.slice(0,3).map(v => {
    if (v.endsWith('%')) return clamp(parseFloat(v) * 2.55, 0, 255);
    return parseFloat(v);
  });
  if (nums.some(n => Number.isNaN(n))) return null;
  const [r, g, b] = nums.map(n => clamp(Math.round(n), 0, 255));
  return { r, g, b };
}

function parseHsl(str) {
  const s = str.trim().toLowerCase().replace(/\s+/g, '');
  const m = s.match(/^hsla?\(([^)]+)\)$/);
  if (!m) return null;
  const parts = m[1].split(',');
  if (parts.length < 3) return null;
  const h = parseFloat(parts[0]);
  const sPerc = parseFloat(parts[1]);
  const lPerc = parseFloat(parts[2]);
  if ([h, sPerc, lPerc].some(n => Number.isNaN(n))) return null;
  return hslToRgb(h, sPerc, lPerc);
}

function parseColor(input) {
  if (!input) return null;
  const s = String(input).trim();
  return (
    parseHex(s) ||
    parseRgb(s) ||
    parseHsl(s)
  );
}

function formatRGB({ r, g, b }) { return `rgb(${r}, ${g}, ${b})`; }
function formatHSL({ r, g, b }) { const { h, s, l } = rgbToHsl(r, g, b); return `hsl(${h}, ${s}%, ${l}%)`; }

// ---- i18n ----
const I18N = {
  'zh-CN': {
    appTitle: '纯色壁纸生成器',
    langLabel: '语言',
    btnFullscreen: '全屏预览',
    btnHidePanel: '隐藏面板',
    btnShowPanel: '显示面板',
    sectionColor: '颜色生成',
    pickerLabel: '拾色器',
    colorCodeLabel: '颜色代码（HEX/RGB/HSL）',
    colorPlaceholder: '#000000 | rgb(0,0,0) | hsl(0,0%,0%)',
    btnRandom: '随机颜色',
    btnCopy: '复制',
    sectionConfig: '壁纸配置',
    presetLabel: '预设尺寸',
    widthLabel: '宽度 (px)',
    heightLabel: '高度 (px)',
    btnUseScreen: '当前屏幕',
    sectionExport: '导出',
    formatLabel: '格式',
    jpegQualityLabel: 'JPEG 质量',
    btnDownload: '下载壁纸',
    shareTwitter: '分享到 Twitter',
    shareCopy: '复制推荐文案',
    shareText: '免费纯前端「纯色壁纸生成器」：秒级创建纯色壁纸，支持 HEX/RGB/HSL、1080p/4K/手机预设、PNG/JPEG 导出与一键复制颜色。',
    toastInvalidSize: '请输入有效的尺寸',
    toastTooLarge: '尺寸过大，可能内存不足，请降低分辨率',
    toastDownloaded: '已下载：',
    toastExportFail: '导出失败，请稍后重试',
    toastExportTooLarge: '导出失败：可能是尺寸过大',
    toastFullscreenFail: '全屏失败',
    toastHideHint: '再次点击可隐藏面板',
    toastColorUnrecognized: '无法识别的颜色：请使用 HEX/RGB/HSL',
    toastCopied: '已复制到剪贴板',
    toastCopiedFallback: '已复制',
    toastAppliedScreen: '已应用当前屏幕：',
    presetScreen: '当前屏幕',
    titleSuffix: '黑色壁纸生成器 · 纯色壁纸生成器',
  },
  en: {
    appTitle: 'Solid Wallpaper Generator',
    langLabel: 'Language',
    btnFullscreen: 'Fullscreen',
    btnHidePanel: 'Hide Panel',
    btnShowPanel: 'Show Panel',
    sectionColor: 'Color',
    pickerLabel: 'Picker',
    colorCodeLabel: 'Color Code (HEX/RGB/HSL)',
    colorPlaceholder: '#000000 | rgb(0,0,0) | hsl(0,0%,0%)',
    btnRandom: 'Random',
    btnCopy: 'Copy',
    sectionConfig: 'Wallpaper',
    presetLabel: 'Preset Size',
    widthLabel: 'Width (px)',
    heightLabel: 'Height (px)',
    btnUseScreen: 'Screen Size',
    sectionExport: 'Export',
    formatLabel: 'Format',
    jpegQualityLabel: 'JPEG Quality',
    btnDownload: 'Download',
    shareTwitter: 'Share on Twitter',
    shareCopy: 'Copy blurb',
    shareText: 'Solid Color Wallpaper Generator — create crisp wallpapers in seconds. HEX/RGB/HSL, presets for 1080p/4K/iPhone/Android, PNG/JPEG export, and one‑click color copy.',
    toastInvalidSize: 'Please enter a valid size',
    toastTooLarge: 'Size too large. Lower resolution to avoid memory issues',
    toastDownloaded: 'Downloaded: ',
    toastExportFail: 'Export failed. Please try again',
    toastExportTooLarge: 'Export failed: size too large',
    toastFullscreenFail: 'Fullscreen failed',
    toastHideHint: 'Click again to hide panel',
    toastColorUnrecognized: 'Unrecognized color. Use HEX/RGB/HSL',
    toastCopied: 'Copied to clipboard',
    toastCopiedFallback: 'Copied',
    toastAppliedScreen: 'Applied current screen: ',
    presetScreen: 'Current Screen',
    titleSuffix: 'Black Wallpaper Generator · Solid Color Wallpaper',
  }
};

function getDefaultLang() {
  const cached = localStorage.getItem('bw_lang');
  if (cached && I18N[cached]) return cached;
  return 'en';
}

function t(key) {
  const dict = I18N[state.lang] || I18N['en'];
  return dict[key] || key;
}

function applyI18n() {
  document.title = t('titleSuffix');
  document.documentElement.setAttribute('lang', state.lang);
  // text nodes
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  // placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.setAttribute('placeholder', t(key));
  });
  // button titles (for a few known buttons)
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  if (fullscreenBtn) fullscreenBtn.title = t('btnFullscreen');
  const hideUiBtn = document.getElementById('hideUiBtn');
  if (hideUiBtn) hideUiBtn.title = t('btnHidePanel');
  const showUiFab = document.getElementById('showUiFab');
  if (showUiFab) showUiFab.title = t('btnShowPanel');
  const langBtn = document.getElementById('langToggleBtn');
  if (langBtn) {
    langBtn.title = 'Language / 语言';
    // 显示将切换至的语言：当前中文则显示 EN，当前英文则显示 中
    langBtn.textContent = state.lang === 'zh-CN' ? 'EN' : '中';
  }
  const hideLabel = document.getElementById('hideUiBtnLabel');
  if (hideLabel) hideLabel.textContent = t('btnHidePanel');
  // refresh presets to localize 'Current Screen'
  initPresets(true);
  // refresh share intents (if available after init)
  if (typeof window !== 'undefined' && typeof window.updateShareIntent === 'function') {
    window.updateShareIntent();
  }
}

// ---- App State ----
const state = {
  color: { r: 0, g: 0, b: 0 },
  width: 1920,
  height: 1080,
  format: 'png',
  jpegQuality: 0.92,
  lang: getDefaultLang(),
};

// ---- Persistence (recent) ----
const LS = {
  recentColors: 'bw_recent_colors',
  recentSizes: 'bw_recent_sizes',
  lang: 'bw_lang',
};

function loadRecent(key) {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
}
function saveRecent(key, arr) { try { localStorage.setItem(key, JSON.stringify(arr)); } catch {} }
function pushRecent(arr, value, max = 6) {
  const v = String(value);
  const next = [v, ...arr.filter(x => String(x) !== v)];
  return next.slice(0, max);
}

function renderRecentColors() {
  const wrap = qs('#recentColors'); if (!wrap) return;
  const list = loadRecent(LS.recentColors);
  wrap.innerHTML = '';
  if (!list.length) { wrap.hidden = true; return; }
  list.forEach(hex => {
    const btn = document.createElement('button');
    btn.className = 'chip';
    btn.style.background = hex; btn.style.color = '#000';
    btn.textContent = hex.toUpperCase();
    btn.addEventListener('click', () => setColorFromAny(hex));
    wrap.appendChild(btn);
  });
  wrap.hidden = false;
}

function renderRecentSizes() {
  const wrap = qs('#recentSizes'); if (!wrap) return;
  const list = loadRecent(LS.recentSizes);
  wrap.innerHTML = '';
  if (!list.length) { wrap.hidden = true; return; }
  list.forEach(sz => {
    const btn = document.createElement('button');
    btn.className = 'chip';
    btn.textContent = sz;
    btn.addEventListener('click', () => {
      const [w, h] = sz.split('x').map(v => parseInt(v,10));
      if (w && h) {
        state.width = w; state.height = h;
        els.widthInput.value = w; els.heightInput.value = h;
      }
    });
    wrap.appendChild(btn);
  });
  wrap.hidden = false;
}

// ---- DOM ----
const els = {};
function qs(sel) { return document.querySelector(sel); }
function qsa(sel) { return Array.from(document.querySelectorAll(sel)); }

function toast(msg) {
  const t = qs('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => t.classList.remove('show'), 1400);
}

function applyPreview() {
  const { r, g, b } = state.color;
  document.body.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
  // readouts
  const hex = hexFromRGB(state.color);
  const rgb = formatRGB(state.color);
  const hsl = formatHSL(state.color);
  els.hexRead.value = hex;
  els.rgbRead.value = rgb;
  els.hslRead.value = hsl;

  // Adjust FAB contrast based on background brightness
  const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255; // 0..1
  const fab = qs('#showUiFab');
  if (fab) {
    fab.classList.toggle('fab--dark', brightness > 0.7); // light bg -> dark glass
    fab.classList.toggle('fab--light', brightness <= 0.7); // dark bg -> light glass
  }
}

function setColorFromAny(input) {
  const parsed = parseColor(input);
  if (!parsed) return false;
  state.color = parsed;
  // sync inputs
  els.colorPicker.value = hexFromRGB(parsed);
  els.colorInput.value = hexFromRGB(parsed);
  applyPreview();
  // persist recent color
  const hex = hexFromRGB(parsed).toUpperCase();
  const list = pushRecent(loadRecent(LS.recentColors), hex, 6);
  saveRecent(LS.recentColors, list);
  renderRecentColors();
  return true;
}

function initPresets(fromI18n = false) {
  const dpr = Math.round(window.devicePixelRatio || 1);
  const sw = Math.round((window.screen && window.screen.width) ? window.screen.width * dpr : window.innerWidth * dpr);
  const sh = Math.round((window.screen && window.screen.height) ? window.screen.height * dpr : window.innerHeight * dpr);
  const presets = [
    { label: `${t('presetScreen')} (${sw}×${sh})`, w: sw, h: sh, id: 'screen' },
    { label: '4K UHD (3840×2160)', w: 3840, h: 2160 },
    { label: '1440p (2560×1440)', w: 2560, h: 1440 },
    { label: '1080p (1920×1080)', w: 1920, h: 1080 },
    { label: 'UWQHD (3440×1440)', w: 3440, h: 1440 },
    { label: 'iPhone 15 Pro (1179×2556)', w: 1179, h: 2556 },
    { label: 'Android 1440×3120', w: 1440, h: 3120 },
    { label: '720p (1280×720)', w: 1280, h: 720 },
  ];
  const current = `${state.width}x${state.height}`;
  els.presetSelect.innerHTML = presets.map((p, i) => {
    const val = `${p.w}x${p.h}`;
    const sel = (fromI18n ? (val === current) : i === 3) ? 'selected' : '';
    return `<option value="${val}" ${sel}>${p.label}</option>`;
  }).join('');
  if (!fromI18n) {
    const def = presets[3];
    state.width = def.w; state.height = def.h;
    els.widthInput.value = state.width;
    els.heightInput.value = state.height;
  }
  // initial recent sizes render
  renderRecentSizes();
}

function randomColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return { r, g, b };
}

function downloadImage() {
  const w = parseInt(els.widthInput.value, 10);
  const h = parseInt(els.heightInput.value, 10);
  if (!(w > 0 && h > 0)) { toast('请输入有效的尺寸'); return; }
  // Safety: huge canvases can fail; soft limit for feedback
  const area = w * h;
  if (area > 10000 * 10000) { // 100MP guard
    toast('尺寸过大，可能内存不足，请降低分辨率');
    return;
  }
  const { r, g, b } = state.color;
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: false });
  ctx.fillStyle = `rgb(${r},${g},${b})`;
  ctx.fillRect(0, 0, w, h);
  const ext = state.format === 'png' ? 'png' : 'jpg';
  const mime = state.format === 'png' ? 'image/png' : 'image/jpeg';
  const quality = state.format === 'png' ? undefined : clamp(Number(state.jpegQuality) || 0.92, 0.5, 1.0);
  const nameColor = hexFromRGB(state.color).slice(1);
  const filename = `wallpaper_${nameColor}_${w}x${h}.${ext}`;
  try {
    canvas.toBlob(blob => {
      if (!blob) { toast('导出失败，请稍后重试'); return; }
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(a.href);
      a.remove();
      toast(`${t('toastDownloaded')}${filename}`);
    }, mime, quality);
  } catch (e) {
    console.error(e);
    toast(t('toastExportTooLarge'));
  }
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.().catch(() => toast(t('toastFullscreenFail'))); 
  } else {
    document.exitFullscreen?.();
  }
}

function togglePanelVisibility() {
  const app = qs('#app');
  const willHide = !app.classList.contains('is-hidden');
  app.classList.toggle('is-hidden', willHide);
  const hideLabel = qs('#hideUiBtnLabel');
  if (!willHide && hideLabel) hideLabel.textContent = t('btnHidePanel');
  const fab = qs('#showUiFab');
  fab.hidden = !willHide;
  if (!willHide) toast(t('toastHideHint'));
}

// ---- Init ----
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
window.addEventListener('DOMContentLoaded', () => {
  // cache DOM
  els.colorPicker = qs('#colorPicker');
  els.colorInput = qs('#colorInput');
  els.randomBtn = qs('#randomBtn');
  els.hexRead = qs('#hexRead');
  els.rgbRead = qs('#rgbRead');
  els.hslRead = qs('#hslRead');
  els.presetSelect = qs('#presetSelect');
  els.widthInput = qs('#widthInput');
  els.heightInput = qs('#heightInput');
  els.useScreenBtn = qs('#useScreenBtn');
  els.formatSelect = qs('#formatSelect');
  els.jpegQualityWrap = qs('#jpegQualityWrap');
  els.jpegQuality = qs('#jpegQuality');
  els.downloadBtn = qs('#downloadBtn');
  els.shareTwitterBtn = qs('#shareTwitterBtn');
  els.copyShareBtn = qs('#copyShareBtn');
  els.fullscreenBtn = qs('#fullscreenBtn');
  els.hideUiBtn = qs('#hideUiBtn');
  els.showUiFab = qs('#showUiFab');
  els.langToggleBtn = qs('#langToggleBtn');
  els.formatSegment = qs('#formatSegment');
  els.formatButtons = qsa('#formatSegment [data-format]');

  // init language
  applyI18n();
  initPresets();

  // default color: black
  setColorFromAny('#000000');

  // color picker
  els.colorPicker.addEventListener('input', (e) => {
    setColorFromAny(e.target.value);
  });

  // color code input
  let colorDebounce;
  els.colorInput.addEventListener('input', (e) => {
    clearTimeout(colorDebounce);
    const val = e.target.value;
    colorDebounce = setTimeout(() => {
      const ok = setColorFromAny(val);
      e.target.setCustomValidity(ok ? '' : 'Invalid');
      if (!ok && val.trim()) toast(t('toastColorUnrecognized'));
    }, 180);
  });

  // random
  els.randomBtn.addEventListener('click', () => {
    state.color = randomColor();
    els.colorPicker.value = hexFromRGB(state.color);
    els.colorInput.value = hexFromRGB(state.color);
    applyPreview();
  });

  // copy buttons
  qsa('[data-copy]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const target = btn.getAttribute('data-copy');
      const input = qs(target);
      try {
        await navigator.clipboard.writeText(input.value);
        toast(t('toastCopied'));
      } catch {
        input.select(); document.execCommand?.('copy');
        toast(t('toastCopiedFallback'));
      }
    });
  });

  // presets
  els.presetSelect.addEventListener('change', () => {
    const [w, h] = els.presetSelect.value.split('x').map(v => parseInt(v, 10));
    if (w && h) {
      state.width = w; state.height = h;
      els.widthInput.value = w; els.heightInput.value = h;
    }
  });

  // manual size
  const syncSize = () => {
    const w = parseInt(els.widthInput.value, 10);
    const h = parseInt(els.heightInput.value, 10);
    if (w > 0) state.width = w;
    if (h > 0) state.height = h;
    if (w > 0 && h > 0) {
      const list = pushRecent(loadRecent(LS.recentSizes), `${w}x${h}`, 6);
      saveRecent(LS.recentSizes, list);
      renderRecentSizes();
    }
  };
  els.widthInput.addEventListener('input', syncSize);
  els.heightInput.addEventListener('input', syncSize);

  // use current screen
  els.useScreenBtn.addEventListener('click', () => {
    const dpr = Math.round(window.devicePixelRatio || 1);
    const w = Math.round(window.screen.width * dpr);
    const h = Math.round(window.screen.height * dpr);
    els.widthInput.value = w; els.heightInput.value = h;
    state.width = w; state.height = h;
    toast(`${t('toastAppliedScreen')}${w}×${h}`);
    const list = pushRecent(loadRecent(LS.recentSizes), `${w}x${h}`, 6);
    saveRecent(LS.recentSizes, list);
    renderRecentSizes();
  });

  // format
  const updateFormatUI = () => {
    const isJ = state.format === 'jpeg';
    els.jpegQualityWrap.hidden = !isJ;
    // sync segmented and select
    els.formatButtons.forEach(btn => {
      const sel = btn.getAttribute('data-format') === state.format;
      btn.setAttribute('aria-selected', sel ? 'true' : 'false');
    });
    if (els.formatSelect.value !== state.format) {
      els.formatSelect.value = state.format;
    }
  };

  els.formatSelect.addEventListener('change', () => {
    state.format = els.formatSelect.value;
    updateFormatUI();
  });

  els.formatButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const f = btn.getAttribute('data-format');
      if (f && (f === 'png' || f === 'jpeg')) {
        state.format = f;
        updateFormatUI();
      }
    });
  });
  els.jpegQuality.addEventListener('input', () => {
    state.jpegQuality = Number(els.jpegQuality.value);
  });

  // download
  els.downloadBtn.addEventListener('click', downloadImage);
  // share actions
  function updateShareIntent() {
    const landingURL = new URL('index.html', location.href).href;
    const text = t('shareText');
    els.shareTwitterBtn._href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(landingURL)}&hashtags=${encodeURIComponent('wallpaper,design,minimalism')}`;
  }
  window.updateShareIntent = updateShareIntent;
  els.shareTwitterBtn.addEventListener('click', () => {
    if (!els.shareTwitterBtn._href) updateShareIntent();
    const w = window.open(els.shareTwitterBtn._href, '_blank', 'noopener');
    if (!w) toast(state.lang==='zh-CN'?'无法打开 Twitter，请检查弹窗拦截':'Could not open Twitter (popup blocked)');
  });
  els.copyShareBtn.addEventListener('click', async () => {
    const landingURL = new URL('landing.html', location.href).href;
    const content = `${t('shareText')} ${landingURL}`;
    try { await navigator.clipboard.writeText(content); toast(t('toastCopied')); }
    catch { const ta=document.createElement('textarea'); ta.value=content; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); toast(t('toastCopied')); }
  });

  // fullscreen
  els.fullscreenBtn.addEventListener('click', toggleFullscreen);
  // hide panel
  els.hideUiBtn.addEventListener('click', togglePanelVisibility);
  els.showUiFab.addEventListener('click', togglePanelVisibility);

  // language toggle button
  els.langToggleBtn.addEventListener('click', () => {
    state.lang = state.lang === 'zh-CN' ? 'en' : 'zh-CN';
    localStorage.setItem('bw_lang', state.lang);
    applyI18n();
  });

  // keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'r') { els.randomBtn.click(); }
    if (e.key.toLowerCase() === 'd') { els.downloadBtn.click(); }
    if (e.key.toLowerCase() === 'f') { els.fullscreenBtn.click(); }
    if (e.key.toLowerCase() === 'h') { togglePanelVisibility(); }
  });

  applyPreview();
  updateFormatUI();
  updateShareIntent();
  renderRecentColors();
  renderRecentSizes();
});
}

// ---- URL Params (shareable links) ----
if (typeof window !== 'undefined' && typeof location !== 'undefined') {
  (function applyParams(){
    try {
      const p = new URLSearchParams(location.search);
      const c = p.get('color');
      const w = parseInt(p.get('w')||p.get('width'), 10);
      const h = parseInt(p.get('h')||p.get('height'), 10);
      const f = p.get('format');
      if (c) setColorFromAny(c);
      if (w>0) { state.width = w; els.widthInput && (els.widthInput.value = w); }
      if (h>0) { state.height = h; els.heightInput && (els.heightInput.value = h); }
      if (f === 'png' || f === 'jpeg') state.format = f;
    } catch {}
  })();
}

// Export selected utilities for testing in Node environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    clamp,
    toHex2,
    hexFromRGB,
    rgbToHsl,
    hslToRgb,
    parseHex,
    parseRgb,
    parseHsl,
    parseColor,
    formatRGB,
    formatHSL,
    I18N,
  };
}
