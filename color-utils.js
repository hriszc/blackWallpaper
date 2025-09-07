// Utility functions for color parsing and conversion

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

if (typeof module !== 'undefined') {
  module.exports = { clamp, toHex2, hexFromRGB, rgbToHsl, hslToRgb, parseHex, parseRgb, parseHsl, parseColor, formatRGB, formatHSL };
}
