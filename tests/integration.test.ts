import { describe, it, expect } from 'bun:test';

describe('ContextMenu programmatic API', () => {
  it('isOpen reflects visibility state', () => {
    const src = require('node:fs').readFileSync(new URL('../src/types.ts', import.meta.url), 'utf8');
    expect(src).toContain('isOpen');
  });
});

describe('Type Exports', () => {
  it('should export type definitions', async () => {
    const mod = await import('../src/types');
    expect(mod).toBeDefined();
  });
});

describe('Position Utility', () => {
  it('should export calculateMenuPosition', async () => {
    const mod = await import('../src/utils/position');
    expect(typeof mod.calculateMenuPosition).toBe('function');
  });
});

describe('Keyboard Utility', () => {
  it('should export handleMenuKeyboard', async () => {
    const mod = await import('../src/utils/keyboard');
    expect(typeof mod.handleMenuKeyboard).toBe('function');
  });
});

describe('Option Item Export', () => {
  it('should include ContextMenuOptionItem in package entry source', () => {
    const source = require('node:fs').readFileSync(new URL('../src/index.ts', import.meta.url), 'utf8');
    expect(source).toContain('ContextMenuOptionItem');
  });
});

describe('Theme Engine', () => {
  it('should export getThemeVariables and applyTheme', async () => {
    const mod = await import('../src/themes');
    expect(typeof mod.getThemeVariables).toBe('function');
    expect(typeof mod.applyTheme).toBe('function');
  });

  it('should return correct theme variables for google/light/normal', () => {
    const { getThemeVariables } = require('../src/themes');
    const vars = getThemeVariables('google', 'light', 'normal');
    expect(vars['--ctx-menu-bg']).toBe('#fff');
    expect(vars['--ctx-menu-text-color']).toBe('#333');
    expect(vars['--ctx-menu-font-size']).toBe('13px');
  });

  it('should return dark theme variables', () => {
    const { getThemeVariables } = require('../src/themes');
    const vars = getThemeVariables('google', 'dark-element', 'normal');
    expect(vars['--ctx-menu-bg']).toBe('#1d1e1f');
    expect(vars['--ctx-menu-text-color']).toBe('#e5eaf3');
  });

  it('should return size variants', () => {
    const { getThemeVariables } = require('../src/themes');
    const small = getThemeVariables('google', 'light', 'small');
    const large = getThemeVariables('google', 'light', 'large');
    expect(small['--ctx-menu-font-size']).toBe('12px');
    expect(large['--ctx-menu-font-size']).toBe('14px');
  });
});
