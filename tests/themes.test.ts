import { describe, it, expect, beforeAll } from 'bun:test';
import { getThemeVariables, applyTheme } from '../src/themes';

describe('Theme Engine', () => {
  it('should return correct theme variables for google/light/normal', () => {
    const vars = getThemeVariables('google', 'light', 'normal');
    expect(vars['--ctx-menu-bg']).toBe('#fff');
    expect(vars['--ctx-menu-text-color']).toBe('#333');
    expect(vars['--ctx-menu-font-size']).toBe('13px');
  });

  it('should return dark theme variables', () => {
    const vars = getThemeVariables('google', 'dark-element', 'normal');
    expect(vars['--ctx-menu-bg']).toBe('#1d1e1f');
    expect(vars['--ctx-menu-text-color']).toBe('#e5eaf3');
  });

  it('should return dark-naive theme variables', () => {
    const vars = getThemeVariables('google', 'dark-naive', 'normal');
    expect(vars['--ctx-menu-text-color']).toBe('rgba(255,255,255,0.9)');
  });

  it('should return size variants', () => {
    const small = getThemeVariables('google', 'light', 'small');
    const large = getThemeVariables('google', 'light', 'large');
    expect(small['--ctx-menu-font-size']).toBe('12px');
    expect(large['--ctx-menu-font-size']).toBe('14px');
  });

  it('should merge style, theme, and size together', () => {
    const vars = getThemeVariables('edge', 'dark-naive', 'small');
    expect(vars['--ctx-menu-border-radius']).toBe('3px');
    expect(vars['--ctx-menu-font-size']).toBe('12px');
    expect(vars['--ctx-menu-text-color']).toBe('rgba(255,255,255,0.9)');
  });

  it('should make edge light menus look distinct from google light menus', () => {
    const edge = getThemeVariables('edge', 'light', 'normal');
    const google = getThemeVariables('google', 'light', 'normal');

    expect(edge['--ctx-menu-bg']).toBe('#f9f9f9');
    expect(edge['--ctx-menu-border-radius']).toBe('3px');
    expect(edge['--ctx-menu-min-width']).toBe('208px');
    expect(edge['--ctx-menu-item-hover-bg']).toBe('#eaeaea');
    expect(edge['--ctx-menu-item-hover-text']).toBe('#1f1f1f');
    expect(edge['--ctx-menu-item-shortcut-color']).toBe('#6b6b6b');
    expect(edge['--ctx-menu-bg']).not.toBe(google['--ctx-menu-bg']);
    expect(edge['--ctx-menu-item-hover-bg']).not.toBe(google['--ctx-menu-item-hover-bg']);
  });

  it('should make edge dark menus use browser-like neutral dark colors', () => {
    const vars = getThemeVariables('edge', 'dark-element', 'normal');

    expect(vars['--ctx-menu-bg']).toBe('#2b2b2b');
    expect(vars['--ctx-menu-border']).toBe('1px solid #3a3a3a');
    expect(vars['--ctx-menu-text-color']).toBe('#f3f3f3');
    expect(vars['--ctx-menu-item-hover-bg']).toBe('#3b3b3b');
    expect(vars['--ctx-menu-item-hover-text']).toBe('#f3f3f3');
    expect(vars['--ctx-menu-separator-color']).toBe('#454545');
    expect(vars['--ctx-menu-item-shortcut-color']).toBe('#b8b8b8');
  });
});

describe('applyTheme', () => {
  it('should set CSS custom properties on element', () => {
    const el = {
      style: {
        setProperty: (() => {}) as any,
      },
    } as HTMLElement;
    let calls: [string, string][] = [];
    el.style.setProperty = ((key: string, value: string) => {
      calls.push([key, value]);
    }) as any;

    applyTheme(el, 'google', 'light', 'normal');

    const bgCall = calls.find(([k]) => k === '--ctx-menu-bg');
    expect(bgCall).toBeDefined();
    expect(bgCall![1]).toBe('#fff');
  });
});
