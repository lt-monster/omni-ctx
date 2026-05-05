import {
  openContextMenu,
  calculateMenuPosition,
  handleMenuKeyboard,
  getThemeVariables,
  applyTheme,
  ContextMenu,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuGroup,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuOptionItem,
  ContextMenuToggleItem,
} from './index';

const OmniCtx = {
  openContextMenu,
  calculateMenuPosition,
  handleMenuKeyboard,
  getThemeVariables,
  applyTheme,
  ContextMenu,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuGroup,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuOptionItem,
  ContextMenuToggleItem,
};

declare global {
  interface Window {
    OmniCtx: typeof OmniCtx;
  }
}

window.OmniCtx = OmniCtx;
