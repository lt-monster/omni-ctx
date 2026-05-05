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
    '--ctx-menu-border-radius': '3px',
    '--ctx-menu-min-width': '208px',
    '--ctx-menu-padding': '4px 0',
    '--ctx-menu-item-padding': '7px 14px',
    '--ctx-menu-shadow': '0 8px 24px rgba(0,0,0,0.18)',
    '--ctx-menu-item-shortcut-color': '#6b6b6b',
    '--ctx-menu-group-label-font-weight': '500',
    '--ctx-menu-submenu-arrow': '\u203A',
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
    '--ctx-menu-item-shortcut-color': '#888',
    '--ctx-menu-group-label-color': '#888',
    '--ctx-menu-toggle-off-bg': '#555',
    '--ctx-menu-toggle-on-bg': '#4c8bf5',
    '--ctx-menu-toggle-thumb-bg': '#e5eaf3',
    '--ctx-menu-scrollbar-thumb': '#5a5a5a',
    '--ctx-menu-scrollbar-thumb-hover': '#6e6e6e',
  },
  'dark-naive': {
    '--ctx-menu-bg': 'rgb(72,72,78)',
    '--ctx-menu-border': '1px solid rgba(255,255,255,0.12)',
    '--ctx-menu-text-color': 'rgba(255,255,255,0.9)',
    '--ctx-menu-item-hover-bg': 'rgba(255,255,255,0.12)',
    '--ctx-menu-item-hover-text': '#63e2b7',
    '--ctx-menu-separator-color': 'rgba(255,255,255,0.12)',
    '--ctx-menu-shadow': '0 3px 14px 2px rgba(0,0,0,0.5)',
    '--ctx-menu-item-shortcut-color': 'rgba(255,255,255,0.45)',
    '--ctx-menu-group-label-color': 'rgba(255,255,255,0.5)',
    '--ctx-menu-toggle-off-bg': 'rgba(255,255,255,0.18)',
    '--ctx-menu-toggle-on-bg': '#63e2b7',
    '--ctx-menu-toggle-thumb-bg': '#fff',
    '--ctx-menu-scrollbar-thumb': 'rgba(255,255,255,0.22)',
    '--ctx-menu-scrollbar-thumb-hover': 'rgba(255,255,255,0.35)',
  },
};

const STYLE_THEME_MAP: Partial<Record<MenuStyle, Partial<Record<MenuTheme, ThemeVariables>>>> = {
  edge: {
    light: {
      '--ctx-menu-bg': '#f9f9f9',
      '--ctx-menu-border': '1px solid #dadada',
      '--ctx-menu-text-color': '#1f1f1f',
      '--ctx-menu-item-hover-bg': '#eaeaea',
      '--ctx-menu-item-hover-text': '#1f1f1f',
      '--ctx-menu-separator-color': '#e5e5e5',
      '--ctx-menu-toggle-on-bg': '#0078d4',
    },
    'dark-element': {
      '--ctx-menu-bg': '#2b2b2b',
      '--ctx-menu-border': '1px solid #3a3a3a',
      '--ctx-menu-text-color': '#f3f3f3',
      '--ctx-menu-item-hover-bg': '#3b3b3b',
      '--ctx-menu-item-hover-text': '#f3f3f3',
      '--ctx-menu-separator-color': '#454545',
      '--ctx-menu-shadow': '0 8px 24px rgba(0,0,0,0.42)',
      '--ctx-menu-item-shortcut-color': '#b8b8b8',
      '--ctx-menu-group-label-color': '#b8b8b8',
      '--ctx-menu-toggle-off-bg': '#5a5a5a',
      '--ctx-menu-toggle-on-bg': '#0078d4',
      '--ctx-menu-toggle-thumb-bg': '#f3f3f3',
      '--ctx-menu-scrollbar-thumb': '#4a4a4a',
      '--ctx-menu-scrollbar-thumb-hover': '#5e5e5e',
    },
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
    ...STYLE_THEME_MAP[style]?.[theme],
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
