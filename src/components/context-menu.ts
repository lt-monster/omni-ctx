import { menuBaseStyles, overlayStyles } from '../styles';
import { calculateMenuPosition } from '../utils/position';
import { handleMenuKeyboard } from '../utils/keyboard';
import { applyTheme } from '../themes';
import type { MenuParam, MenuStyle, MenuTheme, MenuSize, MenuItemData } from '../types';

const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>${menuBaseStyles}${overlayStyles}</style>
  <div class="ctx-menu-overlay" hidden></div>
  <div class="ctx-menu" part="menu" role="menu">
    <slot name="header"></slot>
    <slot></slot>
    <slot name="footer"></slot>
  </div>
`;

export class ContextMenu extends HTMLElement {
  static get observedAttributes() {
    return ['style-type', 'theme', 'size', 'overlay', 'width', 'max-width', 'height', 'max-height'];
  }

  private _menuEl: HTMLElement | null = null;
  private _overlayEl: HTMLElement | null = null;
  private _menuParam: MenuParam | null = null;
  private _boundKeydown: ((e: Event) => void) | null = null;
  private _boundClickOutside: ((e: Event) => void) | null = null;
  private _boundMenuSelect: ((e: Event) => void) | null = null;
  private _boundScroll: ((e: Event) => void) | null = null;
  private _boundRightClick: ((e: Event) => void) | null = null;
  private _itemMap: Map<string, MenuItemData> = new Map();

  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    root.appendChild(TEMPLATE.content.cloneNode(true));
    this._menuEl = root.querySelector('.ctx-menu');
    this._overlayEl = root.querySelector('.ctx-menu-overlay');
  }

  connectedCallback() {
    this.setAttribute('role', 'menu');
    this.setAttribute('aria-orientation', 'vertical');
    this._boundKeydown = this._handleKeydown.bind(this);
    this._boundClickOutside = this._handleClickOutside.bind(this);
    this._boundMenuSelect = this._handleMenuSelect.bind(this);
    this._boundScroll = this._handleScroll.bind(this);
    this._boundRightClick = this._handleRightClick.bind(this);
    document.addEventListener('keydown', this._boundKeydown);
    document.addEventListener('click', this._boundClickOutside, true);
    document.addEventListener('scroll', this._boundScroll, true);
    document.addEventListener('contextmenu', this._boundRightClick, true);
    this.addEventListener('menu-select', this._boundMenuSelect);
    this._applyStyleTheme();
  }

  disconnectedCallback() {
    if (this._boundKeydown) document.removeEventListener('keydown', this._boundKeydown);
    if (this._boundClickOutside) document.removeEventListener('click', this._boundClickOutside, true);
    if (this._boundScroll) document.removeEventListener('scroll', this._boundScroll, true);
    if (this._boundRightClick) document.removeEventListener('contextmenu', this._boundRightClick, true);
    if (this._boundMenuSelect) this.removeEventListener('menu-select', this._boundMenuSelect);
  }

  attributeChangedCallback(name: string, _old: string | null, _new: string | null) {
    if (['style-type', 'theme', 'size'].includes(name)) this._applyStyleTheme();
    if (['width', 'max-width', 'height', 'max-height'].includes(name) && this._menuEl) {
      const prop = name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      (this._menuEl.style as any)[prop] = _new || '';
    }
  }

  open(event: MouseEvent | { x: number; y: number }, param?: MenuParam): void {
    this._menuParam = param || null;
    if ('clientX' in event) {
      this.show(event.clientX, event.clientY);
    } else {
      this.show(event.x, event.y);
    }
  }

  show(x: number, y: number, _param?: MenuParam): void {
    if (!this._menuEl) return;
    this._menuParam = _param || null;
    const pos = calculateMenuPosition(this._menuEl, x, y, window.innerWidth, window.innerHeight);
    this._menuEl.style.top = `${pos.top}px`;
    this._menuEl.style.left = `${pos.left}px`;
    this._menuEl.classList.add('ctx-menu--visible');
    if (this._overlayEl && this.hasAttribute('overlay')) {
      this._overlayEl.hidden = false;
    }
  }

  hide(): void {
    if (!this._menuEl) return;
    this._menuEl.classList.remove('ctx-menu--visible');
    if (this._overlayEl) this._overlayEl.hidden = true;
  }

  close(): void {
    const event = new CustomEvent('before-close', {
      bubbles: true, cancelable: true, composed: true,
      detail: { reason: 'api', cancel: () => {} },
    });
    this.dispatchEvent(event);
    if (!event.defaultPrevented) this.hide();
  }

  focusFirstItem(): void {
    this.querySelector<HTMLElement>('context-menu-item:not([disabled])')?.focus();
  }

  get menuParam(): MenuParam | null { return this._menuParam; }

  addItem(data: MenuItemData): void {
    const el = document.createElement('context-menu-item');
    const label = typeof data.label === 'function' ? data.label(this._menuParam || undefined) : data.label;
    el.setAttribute('label', label);
    if (data.id) { el.setAttribute('data-id', data.id); this._itemMap.set(data.id, data); }
    if (data.icon) el.setAttribute('icon', data.icon);
    if (data.shortcut) el.setAttribute('shortcut', data.shortcut);
    if (data.disabled) el.setAttribute('disabled', '');
    if (data.children) {
      const sub = document.createElement('context-menu');
      data.children.forEach((child) => (sub as any).addItem(child));
      el.appendChild(sub);
    }
    this.appendChild(el);
  }

  addSeparator(): void {
    this.appendChild(document.createElement('context-menu-separator'));
  }

  getMenuOption(id: string): MenuItemData | null {
    return this._itemMap.get(id) || null;
  }

  private _applyStyleTheme(): void {
    if (!this._menuEl) return;
    const style = (this.getAttribute('style-type') || this.getAttribute('style') || 'google') as MenuStyle;
    const theme = (this.getAttribute('theme') || 'light') as MenuTheme;
    const size = (this.getAttribute('size') || 'normal') as MenuSize;
    applyTheme(this._menuEl, style, theme, size);
  }

  private _tryClose(reason: string): boolean {
    if (!this._menuEl?.classList.contains('ctx-menu--visible')) return false;
    const event = new CustomEvent('before-close', {
      bubbles: true, cancelable: true, composed: true,
      detail: { reason, cancel: () => {} },
    });
    this.dispatchEvent(event);
    if (event.defaultPrevented) return false;
    this.hide();
    return true;
  }

  private _handleKeydown(e: Event): void {
    const event = e as KeyboardEvent;
    if (!this._menuEl?.classList.contains('ctx-menu--visible')) return;
    if (event.key === 'Escape') { this._tryClose('escape'); return; }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const current = document.activeElement;
      if (!current || !this._menuEl.contains(current)) {
        this.focusFirstItem();
        return;
      }
    }
    handleMenuKeyboard(event, this._menuEl);
  }

  private _handleClickOutside(e: Event): void {
    if (!this._menuEl?.classList.contains('ctx-menu--visible')) return;
    const target = e.target as Node;
    if (!this._menuEl.contains(target) && !this.contains(target)) {
      this._tryClose('click-outside');
    }
  }

  private _handleScroll(e: Event): void {
    if (!this._menuEl?.classList.contains('ctx-menu--visible')) return;
    const target = e.target as Node;
    if (!this._menuEl.contains(target) && !this.contains(target)) {
      this._tryClose('scroll');
    }
  }

  private _handleRightClick(e: Event): void {
    if (!this._menuEl?.classList.contains('ctx-menu--visible')) return;
    const target = e.target as Node;
    if (!this._menuEl.contains(target) && !this.contains(target)) {
      this._tryClose('right-click');
    }
  }

  private _handleMenuSelect(_e: Event): void {
    this._tryClose('menu-select');
  }
}

if (!customElements.get('context-menu')) {
  customElements.define('context-menu', ContextMenu);
}
