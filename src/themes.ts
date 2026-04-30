import type { MenuStyle, MenuTheme, MenuSize } from './types';

interface ThemeVariables {
  [key: string]: string;
}

const SIZE_MAP: Record<MenuSize, ThemeVariables> = {
  small: {
    '--ctx-menu-font-size': '12px',
    '--ctx-menu-item-padding': '4px 8px',
    '--ctx-menu-item-icon-size': '14px',
    '--ctx-menu-item-shortcut-font-size': '11px',
  },
  normal: {
    '--ctx-menu-font-size': '13px',
    '--ctx-menu-item-padding': '6px 12px',
    '--ctx-menu-item-icon-size': '16px',
    '--ctx-menu-item-shortcut-font-size': '12px',
  },
  large: {
    '--ctx-menu-font-size': '14px',
    '--ctx-menu-item-padding': '8px 16px',
    '--ctx-menu-item-icon-size': '18px',
    '--ctx-menu-item-shortcut-font-size': '13px',
  },
};

const STYLE_MAP: Record<MenuStyle, ThemeVariables> = {
  google: {
    '--ctx-menu-border-radius': '8px',
    '--ctx-menu-item-padding': '8px 12px',
    '--ctx-menu-shadow': '0 4px 16px rgba(0,0,0,0.12)',
  },
  edge: {
    '--ctx-menu-border-radius': '4px',
    '--ctx-menu-shadow': '0 3px 14px 2px rgba(0,0,0,0.12)',
  },
};

const THEME_MAP: Record<MenuTheme, ThemeVariables> = {
  light: {
    '--ctx-menu-bg': '#fff',
    '--ctx-menu-border': '1px solid #e0e0e0',
    '--ctx-menu-text-color': '#333',
    '--ctx-menu-item-hover-bg': '#f0f4ff',
    '--ctx-menu-item-hover-text': '#1a56db',
    '--ctx-menu-separator-color': '#e8e8e8',
  },
  'dark-element': {
    '--ctx-menu-bg': '#1d1e1f',
    '--ctx-menu-border': '1px solid #4c4d4f',
    '--ctx-menu-text-color': '#e5eaf3',
    '--ctx-menu-item-hover-bg': '#2c2c2d',
    '--ctx-menu-item-hover-text': '#a8c7fa',
    '--ctx-menu-separator-color': '#4c4d4f',
    '--ctx-menu-shadow': '0 3px 14px 2px rgba(0,0,0,0.4)',
  },
  'dark-naive': {
    '--ctx-menu-bg': 'rgb(72,72,78)',
    '--ctx-menu-border': '1px solid rgba(255,255,255,0.12)',
    '--ctx-menu-text-color': 'rgba(255,255,255,0.9)',
    '--ctx-menu-item-hover-bg': 'rgba(255,255,255,0.12)',
    '--ctx-menu-item-hover-text': '#63e2b7',
    '--ctx-menu-separator-color': 'rgba(255,255,255,0.12)',
    '--ctx-menu-shadow': '0 3px 14px 2px rgba(0,0,0,0.5)',
  },
};

export function getThemeVariables(
  style: MenuStyle = 'google',
  theme: MenuTheme = 'light',
  size: MenuSize = 'normal',
): ThemeVariables {
  return {
    ...SIZE_MAP[size],
    ...STYLE_MAP[style],
    ...THEME_MAP[theme],
  };
}

export function applyTheme(
  element: HTMLElement,
  style: MenuStyle = 'google',
  theme: MenuTheme = 'light',
  size: MenuSize = 'normal',
): void {
  const vars = getThemeVariables(style, theme, size);
  for (const [key, value] of Object.entries(vars)) {
    element.style.setProperty(key, value);
  }
}
