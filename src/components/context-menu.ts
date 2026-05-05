import { menuBaseStyles, overlayStyles } from '../styles';
import { calculateMenuPosition } from '../utils/position';
import { handleMenuKeyboard } from '../utils/keyboard';
import { applyTheme } from '../themes';
import type { MenuParam, MenuStyle, MenuTheme, MenuSize, MenuItemData, MenuDirection } from '../types';

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
    return ['style-type', 'theme', 'size', 'overlay', 'width', 'max-width', 'height', 'max-height', 'no-inherit-height'];
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
  private _menuDirection: Extract<MenuDirection, 'right' | 'left'> = 'right';

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
    this._applySizeConstraints();
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
      let val = _new || '';
      if (val && /^\d+$/.test(val)) val += 'px';
      (this._menuEl.style as any)[prop] = val;
      if (name === 'height' || name === 'max-height') {
        this._menuEl.style.overflowY = val ? 'auto' : '';
        this._menuEl.style.setProperty('--ctx-menu-max-height', val || 'none');
      }
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
    const wasVisible = this._menuEl.classList.contains('ctx-menu--visible');
    if (!wasVisible) {
      this._menuEl.style.visibility = 'hidden';
      this._menuEl.classList.add('ctx-menu--visible');
    }
    const pos = calculateMenuPosition(this._menuEl, x, y, window.innerWidth, window.innerHeight);
    this._menuEl.style.top = `${pos.top}px`;
    this._menuEl.style.left = `${pos.left}px`;
    this._menuDirection = pos.left < x ? 'left' : 'right';
    this._applyViewportMaxHeight(pos.top);
    this._menuEl.style.visibility = '';
    this._menuEl.classList.add('ctx-menu--visible');
    if (this._overlayEl && this.hasAttribute('overlay')) {
      this._overlayEl.hidden = false;
    }
  }

  showSubmenu(
    parentRect: { top: number; left: number; width: number; height: number },
    preferredDirection: Extract<MenuDirection, 'right' | 'left'> = 'right',
    parentMenu?: ContextMenu,
  ): void {
    if (!this._menuEl) return;
    const wasVisible = this._menuEl.classList.contains('ctx-menu--visible');
    if (!wasVisible) {
      this._menuEl.style.visibility = 'hidden';
      this._menuEl.classList.add('ctx-menu--visible');
    }
    if (parentMenu) {
      this._inheritParentHeight(parentMenu);
    }
    const pos = calculateMenuPosition(this._menuEl, 0, 0, window.innerWidth, window.innerHeight, {
      direction: preferredDirection,
      parentRect,
    });
    this._menuEl.style.top = `${pos.top}px`;
    this._menuEl.style.left = `${pos.left}px`;
    this._menuDirection = pos.left < parentRect.left ? 'left' : 'right';
    this._applyViewportMaxHeight(pos.top);
    this._menuEl.style.visibility = '';
    this._menuEl.classList.add('ctx-menu--visible');
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

  get menuDirection(): Extract<MenuDirection, 'right' | 'left'> { return this._menuDirection; }

  get isOpen(): boolean {
    return this._menuEl?.classList.contains('ctx-menu--visible') ?? false;
  }

  addItem(data: MenuItemData): void {
    if (data.type === 'separator') {
      this.addSeparator();
      return;
    }

    const el = document.createElement(
      data.type === 'option' ? 'context-menu-option-item' : 'context-menu-item',
    );
    const label = typeof data.label === 'function' ? data.label(this._menuParam || undefined) : data.label;
    el.setAttribute('label', label);
    if (data.id) { el.setAttribute('data-id', data.id); this._itemMap.set(data.id, data); }
    if (data.name) el.setAttribute('name', data.name);
    if (data.value) el.setAttribute('value', data.value);
    if (data.icon) el.setAttribute('icon', data.icon);
    if (data.shortcut) el.setAttribute('shortcut', data.shortcut);
    if (data.disabled) el.setAttribute('disabled', '');
    if (data.checked) el.setAttribute('checked', '');
    if (data.type === 'option' && data.onChange) {
      el.addEventListener('option-change', (event) => {
        data.onChange?.((event as CustomEvent).detail.value, this._menuParam || undefined);
      });
    }
    if (data.handler && data.type !== 'option') {
      el.addEventListener('menu-select', () => {
        data.handler!(this._menuParam || undefined);
      });
    }
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

  removeItem(id: string): void {
    const data = this._itemMap.get(id);
    if (!data) return;
    this._itemMap.delete(id);
    const el = this.querySelector(`[data-id="${id}"]`);
    el?.remove();
  }

  clearItems(): void {
    this._itemMap.clear();
    while (this.firstChild) this.removeChild(this.firstChild);
  }

  private _applySizeConstraints(): void {
    if (!this._menuEl) return;
    ['width', 'max-width', 'height', 'max-height'].forEach((attr) => {
      const val = this.getAttribute(attr);
      if (val != null) {
        let cssVal: string = val;
        if (/^\d+$/.test(cssVal)) cssVal += 'px';
        const prop = attr.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
        (this._menuEl!.style as any)[prop] = cssVal;
        if (attr === 'height' || attr === 'max-height') {
          this._menuEl!.style.overflowY = cssVal ? 'auto' : '';
          this._menuEl!.style.setProperty('--ctx-menu-max-height', cssVal || 'none');
        }
      }
    });
  }

  private _applyViewportMaxHeight(top: number): void {
    if (!this._menuEl) return;
    if (this.hasAttribute('height') || this.hasAttribute('max-height')) return;
    if (this._menuEl.style.height || this._menuEl.style.maxHeight) return;

    const rect = this._menuEl.getBoundingClientRect();
    const menuHeight = rect.height || 0;
    const availableHeight = Math.max(0, window.innerHeight - Math.max(0, top));
    if (!menuHeight || menuHeight <= availableHeight) return;

    const cssVal = `${availableHeight}px`;
    this._menuEl.style.maxHeight = cssVal;
    this._menuEl.style.overflowY = 'auto';
    this._menuEl.style.setProperty('--ctx-menu-max-height', cssVal);
  }

  private _inheritParentHeight(parentMenu: ContextMenu): void {
    if (!this._menuEl) return;
    if (this.hasAttribute('no-inherit-height')) {
      this._menuEl.style.maxHeight = '';
      this._menuEl.style.height = '';
      this._menuEl.style.overflowY = '';
      this._menuEl.style.removeProperty('--ctx-menu-max-height');
      // 在 host element 上显式覆盖从父 DOM 继承的 CSS 变量，确保不截断
      this.style.setProperty('--ctx-menu-max-height', 'none');
      return;
    }
    ['height', 'max-height'].forEach((attr) => {
      if (this.hasAttribute(attr)) return;
      const parentVal = parentMenu.getAttribute(attr);
      if (parentVal != null) {
        let cssVal = parentVal;
        if (/^\d+$/.test(cssVal)) cssVal += 'px';
        const prop = attr.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
        (this._menuEl!.style as any)[prop] = cssVal;
        this._menuEl!.style.overflowY = 'auto';
        this._menuEl!.style.setProperty('--ctx-menu-max-height', cssVal);
      }
    });
  }

  private _applyStyleTheme(): void {
    const style = this.getAttribute('style-type') || this.getAttribute('style');
    const theme = this.getAttribute('theme');
    const size = this.getAttribute('size');
    // Only apply if at least one attribute is explicitly set, otherwise
    // let CSS custom properties inherit from the parent menu.
    if (!style && !theme && !size) return;
    applyTheme(this,
      (style || 'google') as MenuStyle,
      (theme || 'light') as MenuTheme,
      (size || 'normal') as MenuSize,
    );
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
