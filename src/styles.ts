export const menuBaseStyles = `
  :host {
    --_bg: var(--ctx-menu-bg, #fff);
    --_border: var(--ctx-menu-border, 1px solid #e0e0e0);
    --_radius: var(--ctx-menu-border-radius, 6px);
    --_shadow: var(--ctx-menu-shadow, 0 4px 16px rgba(0,0,0,0.12));
    --_padding: var(--ctx-menu-padding, 4px 0);
    --_min-width: var(--ctx-menu-min-width, 180px);
    --_max-width: var(--ctx-menu-max-width, 280px);
    --_font: var(--ctx-menu-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
    --_font-size: var(--ctx-menu-font-size, 13px);
    --_text: var(--ctx-menu-text-color, #333);
    --_z: var(--ctx-menu-z-index, 10000);

    --_item-padding: var(--ctx-menu-item-padding, 6px 12px);
    --_item-hover-bg: var(--ctx-menu-item-hover-bg, #f0f4ff);
    --_item-hover-text: var(--ctx-menu-item-hover-text, #1a56db);
    --_item-disabled-opacity: var(--ctx-menu-item-disabled-opacity, 0.4);
    --_item-icon-size: var(--ctx-menu-item-icon-size, 16px);
    --_item-shortcut-color: var(--ctx-menu-item-shortcut-color, #999);
    --_item-shortcut-fz: var(--ctx-menu-item-shortcut-font-size, 12px);

    --_sep-color: var(--ctx-menu-separator-color, #e8e8e8);
    --_sep-margin: var(--ctx-menu-separator-margin, 4px 8px);

    --_sub-arrow: var(--ctx-menu-submenu-arrow, '\\25B6');
  }

  .ctx-menu {
    display: none;
    position: fixed;
    z-index: var(--_z);
    min-width: var(--_min-width);
    max-width: var(--_max-width);
    background: var(--_bg);
    border: var(--_border);
    border-radius: var(--_radius);
    box-shadow: var(--_shadow);
    padding: var(--_padding);
    font-family: var(--_font);
    font-size: var(--_font-size);
    color: var(--_text);
    overflow: hidden;
    user-select: none;
  }

  .ctx-menu--visible {
    display: block;
  }
`;

export const menuItemStyles = `
  :host {
    display: block;
    cursor: pointer;
  }

  .ctx-menu-item {
    display: flex;
    align-items: center;
    padding: var(--_item-padding);
    gap: 8px;
    white-space: nowrap;
    position: relative;
  }

  .ctx-menu-item:hover {
    background: var(--_item-hover-bg);
    color: var(--_item-hover-text);
  }

  .ctx-menu-item__icon {
    width: var(--_item-icon-size);
    height: var(--_item-icon-size);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--_item-icon-size);
  }

  .ctx-menu-item__label {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .ctx-menu-item__shortcut {
    margin-left: auto;
    padding-left: 24px;
    color: var(--_item-shortcut-color);
    font-size: var(--_item-shortcut-fz);
  }

  .ctx-menu-item__arrow {
    margin-left: 4px;
    font-size: 10px;
  }

  .ctx-menu-item--disabled {
    opacity: var(--_item-disabled-opacity);
    cursor: not-allowed;
    pointer-events: none;
  }
`;

export const separatorStyles = `
  :host {
    display: block;
  }

  .ctx-menu-separator {
    height: 1px;
    background: var(--_sep-color);
    margin: var(--_sep-margin);
  }
`;

export const groupStyles = `
  :host { display: contents; }
  .ctx-menu-group__label {
    color: var(--ctx-menu-group-label-color, #888);
    font-size: var(--ctx-menu-group-label-font-size, 11px);
    padding: var(--ctx-menu-group-label-padding, 4px 12px);
    font-weight: var(--ctx-menu-group-label-font-weight, 600);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    user-select: none;
  }
  .ctx-menu-group__items { display: contents; }
`;

export const radioGroupStyles = `
  :host { display: contents; }
`;

export const radioItemStyles = `
  :host { display: block; cursor: pointer; }
  .ctx-menu-radio-item {
    display: flex; align-items: center;
    padding: var(--ctx-menu-item-padding, 6px 12px);
    gap: 8px;
  }
  .ctx-menu-radio-item:hover {
    background: var(--ctx-menu-item-hover-bg, #f0f4ff);
  }
  .ctx-menu-radio-item--disabled {
    opacity: var(--ctx-menu-item-disabled-opacity, 0.4);
    cursor: not-allowed; pointer-events: none;
  }
  .ctx-menu-radio-item__mark {
    width: var(--ctx-menu-item-icon-size, 16px);
    flex-shrink: 0; text-align: center;
    color: var(--ctx-menu-radio-checked-color, #1a56db);
  }
  .ctx-menu-radio-item__label { flex: 1; }
`;

export const toggleItemStyles = `
  :host { display: block; cursor: pointer; }
  .ctx-menu-toggle-item {
    display: flex; align-items: center;
    padding: var(--ctx-menu-item-padding, 6px 12px);
    gap: 8px;
  }
  .ctx-menu-toggle-item:hover {
    background: var(--ctx-menu-item-hover-bg, #f0f4ff);
  }
  .ctx-menu-toggle-item--disabled {
    opacity: var(--ctx-menu-item-disabled-opacity, 0.4);
    cursor: not-allowed; pointer-events: none;
  }
  .ctx-menu-toggle-item__label { flex: 1; }
  .ctx-menu-toggle-item__switch {
    position: relative;
    width: var(--ctx-menu-toggle-width, 36px);
    height: var(--ctx-menu-toggle-height, 20px);
    flex-shrink: 0;
  }
  .ctx-menu-toggle-item__track {
    width: 100%; height: 100%;
    border-radius: 10px;
    background: var(--ctx-menu-toggle-off-bg, #ccc);
    transition: background 0.2s;
  }
  .ctx-menu-toggle-item__track--on {
    background: var(--ctx-menu-toggle-on-bg, #1a56db);
  }
  .ctx-menu-toggle-item__thumb {
    position: absolute; top: 2px; left: 2px;
    width: calc(var(--ctx-menu-toggle-height, 20px) - 4px);
    height: calc(var(--ctx-menu-toggle-height, 20px) - 4px);
    border-radius: 50%;
    background: var(--ctx-menu-toggle-thumb-bg, #fff);
    transition: left 0.2s;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }
  .ctx-menu-toggle-item__track--on .ctx-menu-toggle-item__thumb {
    left: calc(var(--ctx-menu-toggle-width, 36px) - var(--ctx-menu-toggle-height, 20px) + 2px);
  }
`;

export const overlayStyles = `
  .ctx-menu-overlay {
    position: fixed; top: 0; left: 0;
    width: 100vw; height: 100vh;
    z-index: var(--ctx-menu-overlay-z-index, 9999);
    background: transparent;
  }
`;
