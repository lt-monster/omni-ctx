import { mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dir, '..');
const distDir = resolve(root, 'dist');

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });

const esmDebugResult = await Bun.build({
  entrypoints: [resolve(root, 'src/index.ts')],
  target: 'browser',
  format: 'esm',
  minify: false,
});

const esmMinResult = await Bun.build({
  entrypoints: [resolve(root, 'src/index.ts')],
  target: 'browser',
  format: 'esm',
  minify: true,
});

const globalDebugResult = await Bun.build({
  entrypoints: [resolve(root, 'src/global.ts')],
  target: 'browser',
  format: 'iife',
  minify: false,
});

const globalMinResult = await Bun.build({
  entrypoints: [resolve(root, 'src/global.ts')],
  target: 'browser',
  format: 'iife',
  minify: true,
});

for (const result of [esmDebugResult, esmMinResult, globalDebugResult, globalMinResult]) {
  if (!result.success) {
    for (const log of result.logs) console.error(log);
    process.exit(1);
  }
}

const esmDebugOutput = esmDebugResult.outputs[0];
const esmMinOutput = esmMinResult.outputs[0];
const globalDebugOutput = globalDebugResult.outputs[0];
const globalMinOutput = globalMinResult.outputs[0];

if (!esmDebugOutput || !esmMinOutput || !globalDebugOutput || !globalMinOutput) {
  console.error('Build succeeded without emitting all expected output files.');
  process.exit(1);
}

await writeFile(resolve(distDir, 'omni-ctx.js'), await esmDebugOutput.text());
await writeFile(resolve(distDir, 'omni-ctx.min.js'), await esmMinOutput.text());
await writeFile(resolve(distDir, 'omni-ctx.global.js'), await globalDebugOutput.text());
await writeFile(resolve(distDir, 'omni-ctx.global.min.js'), await globalMinOutput.text());

await writeFile(
  resolve(distDir, 'index.d.ts'),
  `export interface Position {
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

export interface MenuOpenConfig {
  items: MenuItemData[];
  param?: MenuParam;
  replace?: boolean;
}

export type MenuOpenInput = MenuParam | MenuItemData[] | MenuOpenConfig;

export interface OpenContextMenuOptions {
  x: number;
  y: number;
  items: MenuItemData[];
  param?: MenuParam;
  cacheKey?: string;
}

export interface ContextMenuHandle {
  element: ContextMenuElement;
  close(): void;
  destroy(): void;
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
  open(event: MouseEvent | { x: number; y: number }, input?: MenuOpenInput): void;
  hide(): void;
  close(): void;
  focusFirstItem(): void;
  addItem(data: MenuItemData): void;
  addSeparator(): void;
  getMenuOption(id: string): MenuItemData | null;
  menuParam: MenuParam | null;
  menuDirection: Extract<MenuDirection, 'right' | 'left'>;
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

export declare class ContextMenu extends HTMLElement implements ContextMenuElement {
  open(event: MouseEvent | { x: number; y: number }, input?: MenuOpenInput): void;
  show(x: number, y: number, param?: MenuParam): void;
  showSubmenu(
    parentRect: { top: number; left: number; width: number; height: number },
    preferredDirection?: Extract<MenuDirection, 'right' | 'left'>,
  ): void;
  hide(): void;
  close(): void;
  focusFirstItem(): void;
  addItem(data: MenuItemData): void;
  addSeparator(): void;
  getMenuOption(id: string): MenuItemData | null;
  get menuParam(): MenuParam | null;
  get menuDirection(): Extract<MenuDirection, 'right' | 'left'>;
}

export declare class ContextMenuItem extends HTMLElement implements ContextMenuItemElement {
  label: string;
  disabled: boolean;
  visible: boolean;
  readonly submenu: ContextMenuElement | null;
  readonly expandTrigger: ExpandTrigger;
  focusItem(): void;
  blurItem(): void;
}

export declare class ContextMenuSeparator extends HTMLElement {}

export declare class ContextMenuGroup extends HTMLElement {}

export declare class ContextMenuRadioGroup extends HTMLElement implements ContextMenuRadioGroupElement {
  readonly name: string;
  readonly value: string;
  setRadioValue(value: string): void;
  getRadioValue(): string;
}

export declare class ContextMenuRadioItem extends HTMLElement {
  readonly value: string;
  readonly label: string;
  readonly disabled: boolean;
  checked: boolean;
}

export declare class ContextMenuToggleItem extends HTMLElement implements ContextMenuToggleItemElement {
  label: string;
  checked: boolean;
  disabled: boolean;
}

export declare class ContextMenuOptionItem extends HTMLElement implements ContextMenuOptionItemElement {
  readonly name: string;
  readonly value: string;
  readonly label: string;
  checked: boolean;
  disabled: boolean;
}

export declare function openContextMenu(options: OpenContextMenuOptions): ContextMenuHandle;

export declare function calculateMenuPosition(
  menu: HTMLElement,
  mouseX: number,
  mouseY: number,
  vpWidth: number,
  vpHeight: number,
  submenuCtx?: {
    direction: 'right' | 'left';
    parentRect: { top: number; left: number; width: number; height: number };
  },
): Position;

export declare function handleMenuKeyboard(
  event: KeyboardEvent,
  menu: HTMLElement,
  activeEl?: HTMLElement | null,
): boolean;

export declare function getThemeVariables(
  style?: MenuStyle,
  theme?: MenuTheme,
  size?: MenuSize,
): Record<string, string>;

export declare function applyTheme(
  element: HTMLElement,
  style?: MenuStyle,
  theme?: MenuTheme,
  size?: MenuSize,
): void;
`,
);

console.log('Built dist/omni-ctx.js, dist/omni-ctx.min.js, dist/omni-ctx.global.js, and dist/omni-ctx.global.min.js.');
