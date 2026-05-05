export interface Position {
  top: number;
  left: number;
}

export interface ViewportRect {
  width: number;
  height: number;
}

export interface MenuParam {
  [key: string]: unknown;
}

export type MenuStyle = 'google' | 'edge';
export type MenuTheme = 'light' | 'dark-element' | 'dark-naive';
export type MenuSize = 'small' | 'normal' | 'large';
export type ExpandTrigger = 'hover' | 'click';

export interface MenuItemData {
  id?: string;
  name?: string;
  label: string | ((param?: MenuParam) => string);
  icon?: string;
  shortcut?: string;
  disabled?: boolean | ((param?: MenuParam) => boolean);
  visible?: boolean | ((param?: MenuParam) => boolean);
  checked?: boolean;
  value?: string;
  handler?: (param?: MenuParam) => void;
  onChange?: (value: string | boolean, param?: MenuParam) => void;
  children?: MenuItemData[];
  type?: 'menu' | 'radio' | 'toggle' | 'separator' | 'option';
}

export interface MenuSelectEventDetail {
  label: string;
  item: HTMLElement;
  menuParam?: MenuParam;
}

export interface MenuBeforeCloseEventDetail {
  reason: 'click-outside' | 'escape' | 'scroll' | 'right-click' | 'menu-select' | 'api';
  cancel: () => void;
}

export interface RadioChangeEventDetail {
  name: string;
  value: string;
  label: string;
}

export interface ToggleChangeEventDetail {
  label: string;
  checked: boolean;
}

export interface OptionChangeEventDetail {
  name: string;
  value: string;
  label: string;
  item: HTMLElement;
}

export interface MenuGroupData {
  label: string;
  items: MenuItemData[];
  groupClass?: string;
  groupStyle?: Record<string, string>;
}

export interface MenuOverlayConfig {
  enable: boolean;
  zIndex: number;
}

export type MenuDirection = 'right' | 'left' | 'bottom' | 'top';

export interface ContextMenuItemElement extends HTMLElement {
  label: string;
  disabled: boolean;
  visible: boolean;
  submenu: ContextMenuElement | null;
  expandTrigger: ExpandTrigger;
  focusItem(): void;
  blurItem(): void;
}

export interface ContextMenuElement extends HTMLElement {
  show(x: number, y: number, param?: MenuParam): void;
  showSubmenu(
    parentRect: { top: number; left: number; width: number; height: number },
    preferredDirection?: Extract<MenuDirection, 'right' | 'left'>,
  ): void;
  open(event: MouseEvent | { x: number; y: number }, param?: MenuParam): void;
  hide(): void;
  close(): void;
  focusFirstItem(): void;
  addItem(data: MenuItemData): void;
  addSeparator(): void;
  getMenuOption(id: string): MenuItemData | null;
  menuParam: MenuParam | null;
  menuDirection: Extract<MenuDirection, 'right' | 'left'>;
  isOpen: boolean;
}

export interface ContextMenuRadioGroupElement extends HTMLElement {
  name: string;
  value: string;
  setRadioValue(value: string): void;
  getRadioValue(): string;
}

export interface ContextMenuToggleItemElement extends HTMLElement {
  label: string;
  checked: boolean;
  disabled: boolean;
}

export interface ContextMenuOptionItemElement extends HTMLElement {
  name: string;
  value: string;
  label: string;
  checked: boolean;
  disabled: boolean;
}
