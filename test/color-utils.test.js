const test = require('node:test');
const assert = require('node:assert');
const {
  clamp, toHex2, hexFromRGB, rgbToHsl, hslToRgb,
  parseHex, parseRgb, parseHsl, parseColor, formatRGB, formatHSL
} = require('../color-utils.js');

test('clamp', () => {
  assert.strictEqual(clamp(5, 0, 10), 5);
  assert.strictEqual(clamp(-1, 0, 10), 0);
  assert.strictEqual(clamp(11, 0, 10), 10);
});

test('toHex2', () => {
  assert.strictEqual(toHex2(15), '0F');
  assert.strictEqual(toHex2(-1), '00');
  assert.strictEqual(toHex2(300), 'FF');
});

test('hexFromRGB', () => {
  assert.strictEqual(hexFromRGB({ r: 0, g: 0, b: 0 }), '#000000');
});

test('rgbToHsl', () => {
  assert.deepStrictEqual(rgbToHsl(255, 255, 255), { h: 0, s: 0, l: 100 }); // max === min
  assert.deepStrictEqual(rgbToHsl(255, 0, 0), { h: 0, s: 100, l: 50 }); // r max
  assert.deepStrictEqual(rgbToHsl(0, 255, 0), { h: 120, s: 100, l: 50 }); // g max
  assert.deepStrictEqual(rgbToHsl(0, 0, 255), { h: 240, s: 100, l: 50 }); // b max
  assert.deepStrictEqual(rgbToHsl(255, 128, 128), { h: 0, s: 100, l: 75 }); // l > 0.5 path
});

test('hslToRgb', () => {
  assert.deepStrictEqual(hslToRgb(0, 0, 0), { r: 0, g: 0, b: 0 }); // s === 0
  assert.deepStrictEqual(hslToRgb(0, 100, 50), { r: 255, g: 0, b: 0 });
  assert.deepStrictEqual(hslToRgb(60, 100, 50), { r: 255, g: 255, b: 0 }); // 1/2 < t < 2/3 branch
  assert.deepStrictEqual(hslToRgb(720, 100, 50), { r: 255, g: 0, b: 0 }); // hue wrap
});

test('parseHex', () => {
  assert.deepStrictEqual(parseHex('#0f0'), { r: 0, g: 255, b: 0 });
  assert.deepStrictEqual(parseHex('00FF00'), { r: 0, g: 255, b: 0 });
  assert.strictEqual(parseHex('xyz'), null);
});

test('parseRgb', () => {
  assert.deepStrictEqual(parseRgb('rgb(255,0,0)'), { r: 255, g: 0, b: 0 });
  assert.deepStrictEqual(parseRgb('255,0,0'), { r: 255, g: 0, b: 0 });
  assert.deepStrictEqual(parseRgb('rgb(100%,0%,0%)'), { r: 255, g: 0, b: 0 });
  assert.strictEqual(parseRgb('rgb(1,2)'), null); // parts < 3
  assert.strictEqual(parseRgb('rgb(1,2,foo)'), null); // NaN
});

test('parseHsl', () => {
  assert.deepStrictEqual(parseHsl('hsl(0,100%,50%)'), { r: 255, g: 0, b: 0 });
  assert.strictEqual(parseHsl('hsl(0,100%)'), null);
  assert.strictEqual(parseHsl('hsl(0,foo%,50%)'), null);
});

test('parseColor', () => {
  assert.deepStrictEqual(parseColor('#00ff00'), { r: 0, g: 255, b: 0 });
  assert.deepStrictEqual(parseColor('rgb(0,0,255)'), { r: 0, g: 0, b: 255 });
  assert.deepStrictEqual(parseColor('hsl(240,100%,50%)'), { r: 0, g: 0, b: 255 });
  assert.strictEqual(parseColor('invalid'), null);
  assert.strictEqual(parseColor(), null);
});

test('formatters', () => {
  assert.strictEqual(formatRGB({ r: 1, g: 2, b: 3 }), 'rgb(1, 2, 3)');
  assert.strictEqual(formatHSL({ r: 255, g: 0, b: 0 }), 'hsl(0, 100%, 50%)');
});
