// src/test/colors.test.ts
import * as assert from 'assert';
import { assignColor, hexToRgba } from '../colors';

describe('assignColor', () => {
  it('returns first palette color for index 0', () => {
    assert.strictEqual(assignColor(0), '#4ec9b0');
  });

  it('returns second palette color for index 1', () => {
    assert.strictEqual(assignColor(1), '#ce9178');
  });

  it('wraps around after 8 entries', () => {
    assert.strictEqual(assignColor(8), assignColor(0));
  });

  it('wraps correctly at index 9', () => {
    assert.strictEqual(assignColor(9), assignColor(1));
  });
});

describe('hexToRgba', () => {
  it('converts hex to rgba string', () => {
    assert.strictEqual(hexToRgba('#4ec9b0', 0.15), 'rgba(78, 201, 176, 0.15)');
  });

  it('handles full opacity', () => {
    assert.strictEqual(hexToRgba('#ffffff', 1), 'rgba(255, 255, 255, 1)');
  });
});
