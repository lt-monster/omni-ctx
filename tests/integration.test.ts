import { describe, it, expect } from 'bun:test';

describe('ContextMenu programmatic API', () => {
  it('isOpen reflects visibility state', () => {
    const src = require('node:fs').readFileSync(new URL('../src/types.ts', import.meta.url), 'utf8');
    expect(src).toContain('isOpen');
  });

  it('removeItem and clearItems are exported on the type', () => {
    const src = require('node:fs').readFileSync(new URL('../src/types.ts', import.meta.url), 'utf8');
    expect(src).toContain('removeItem');
    expect(src).toContain('clearItems');
  });

  it('handler wiring is present in addItem source', () => {
    const src = require('node:fs').readFileSync(
      new URL('../src/components/context-menu.ts', import.meta.url), 'utf8'
    );
    expect(src).toMatch(/data\.handler/);
    const handlerIdx = src.indexOf('data.handler');
    const optionChangeIdx = src.indexOf('option-change');
    expect(handlerIdx).toBeGreaterThan(optionChangeIdx);
  });

  it('exports MenuOpenConfig, MenuOpenInput, and updated open signature', () => {
    const src = require('node:fs').readFileSync(
      new URL('../src/types.ts', import.meta.url),
      'utf8'
    );

    expect(src).toContain('export interface MenuOpenConfig');
    expect(src).toContain('export type MenuOpenInput');
    expect(src).toContain('open(event: MouseEvent | { x: number; y: number }, input?: MenuOpenInput): void;');
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

  it('should include option item source file in the components directory', () => {
    const { existsSync } = require('node:fs');
    expect(existsSync(new URL('../src/components/context-menu-option-item.ts', import.meta.url))).toBe(true);
  });
});

describe('ContextMenu open input variants', () => {
  const loadSource = () =>
    require('node:fs').readFileSync(
      new URL('../src/components/context-menu.ts', import.meta.url),
      'utf8'
    );

  it('normalizes array input for open()', () => {
    const src = loadSource();
    expect(src).toContain('Array.isArray(input)');
    expect(src).toContain('items: input');
  });

  it('treats object input with items as config', () => {
    const src = loadSource();
    expect(src).toContain("'items' in input");
    expect(src).toContain('replace: config.replace ?? true');
  });

  it('marks programmatic nodes so declarative children are preserved', () => {
    const src = loadSource();
    expect(src).toContain('data-programmatic');
    expect(src).toContain('_clearProgrammaticItems');
    expect(src).toContain(':scope > [');
  });

  it('reuses shared item creation for addItem and programmatic rendering', () => {
    const src = loadSource();
    expect(src).toContain('_createItemElement');
    expect(src).toContain('_renderProgrammaticItems');
  });

  it('only clears prior programmatic nodes before re-rendering by default', () => {
    const src = loadSource();
    expect(src).toContain('if (normalized.items) {');
    expect(src).toContain('if (normalized.replace) this._clearProgrammaticItems();');
    expect(src).toContain("el.setAttribute(PROGRAMMATIC_ATTR, 'true')");
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
