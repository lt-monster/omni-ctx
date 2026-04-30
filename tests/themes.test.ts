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
    expect(vars['--ctx-menu-border-radius']).toBe('4px');
    expect(vars['--ctx-menu-font-size']).toBe('12px');
    expect(vars['--ctx-menu-text-color']).toBe('rgba(255,255,255,0.9)');
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
