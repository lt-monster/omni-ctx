import { menuItemStyles } from '../styles';
import type { ExpandTrigger } from '../types';

const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>${menuItemStyles}</style>
  <div class="ctx-menu-item" part="item">
    <span class="ctx-menu-item__icon" part="icon"></span>
    <span class="ctx-menu-item__label" part="label"></span>
    <span class="ctx-menu-item__shortcut" part="shortcut"></span>
    <span class="ctx-menu-item__arrow" part="arrow"></span>
  </div>
  <slot></slot>
`;

export class ContextMenuItem extends HTMLElement {
  static get observedAttributes() {
    return ['label', 'icon', 'shortcut', 'disabled', 'visible', 'expand-trigger'];
  }

  private _submenu: HTMLElement | null = null;
  private _showTimer: ReturnType<typeof setTimeout> | null = null;
  private _hideTimer: ReturnType<typeof setTimeout> | null = null;
  private _visible = true;

  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    root.appendChild(TEMPLATE.content.cloneNode(true));
  }

  connectedCallback() {
    this.setAttribute('role', 'menuitem');
    this.setAttribute('tabindex', '-1');
    this.addEventListener('click', this._handleClick);
    this.addEventListener('mouseenter', this._handleMouseEnter);
    this.addEventListener('mouseleave', this._handleMouseLeave);
    this._findSubmenu();
    this._updateRendering();
  }

  disconnectedCallback() {
    this.removeEventListener('click', this._handleClick);
    this.removeEventListener('mouseenter', this._handleMouseEnter);
    this.removeEventListener('mouseleave', this._handleMouseLeave);
    this._clearTimers();
  }

  attributeChangedCallback(name: string, _old: string | null, _new: string | null) {
    if (['label', 'icon', 'shortcut', 'disabled', 'visible', 'expand-trigger'].includes(name)) {
      this._updateRendering();
    }
  }

  get label(): string {
    return this.getAttribute('label') || '';
  }

  set label(value: string) {
    this.setAttribute('label', value);
  }

  get disabled(): boolean {
    return this.hasAttribute('disabled');
  }

  set disabled(value: boolean) {
    if (value) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
  }

  get visible(): boolean {
    return this._visible;
  }

  set visible(value: boolean) {
    this._visible = value;
    if (value) {
      this.setAttribute('visible', 'true');
    } else {
      this.setAttribute('visible', 'false');
    }
    this._updateRendering();
  }

  get expandTrigger(): ExpandTrigger {
    return (this.getAttribute('expand-trigger') as ExpandTrigger) || 'hover';
  }

  get submenu(): HTMLElement | null {
    return this._submenu;
  }

  focusItem(): void {
    this.focus();
  }

  blurItem(): void {
    this.blur();
  }

  private _findSubmenu(): void {
    this._submenu = this.querySelector('context-menu');
  }

  private _handleClick = (e: Event) => {
    if (this.disabled) {
      e.stopPropagation();
      return;
    }
    if (this._submenu && this.expandTrigger === 'click') {
      e.stopPropagation();
      this._toggleSubmenu();
      return;
    }
    this.dispatchEvent(
      new CustomEvent('menu-select', {
        bubbles: true,
        composed: true,
        detail: { label: this.label, item: this },
      }),
    );
  };

  private _handleMouseEnter = () => {
    if (this.disabled || !this._submenu || this.expandTrigger === 'click') return;
    this._clearTimers();
    this._showTimer = setTimeout(() => {
      this._showSubmenu();
    }, 200);
  };

  private _handleMouseLeave = () => {
    if (!this._submenu || this.expandTrigger === 'click') return;
    this._clearTimers();
    this._hideTimer = setTimeout(() => {
      this._hideSubmenu();
    }, 150);
  };

  private _toggleSubmenu(): void {
    if (!this._submenu) return;
    const subInner = this._submenu.shadowRoot?.querySelector('.ctx-menu');
    if (subInner?.classList.contains('ctx-menu--visible')) {
      this._hideSubmenu();
    } else {
      this._showSubmenu();
    }
  }

  private _showSubmenu(): void {
    if (!this._submenu) return;
    const rect = this.getBoundingClientRect();
    const parentMenu = this.closest('context-menu') as HTMLElement & { menuDirection?: 'right' | 'left' } & { showSubmenu?: Function };
    const preferredDirection = parentMenu?.menuDirection || 'right';
    (this._submenu as any).showSubmenu(
      { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
      preferredDirection,
      parentMenu,
    );
  }

  private _hideSubmenu(): void {
    if (!this._submenu) return;
    (this._submenu as any).hide();
  }

  private _clearTimers(): void {
    if (this._showTimer) {
      clearTimeout(this._showTimer);
      this._showTimer = null;
    }
    if (this._hideTimer) {
      clearTimeout(this._hideTimer);
      this._hideTimer = null;
    }
  }

  private _updateRendering(): void {
    if (!this.shadowRoot) return;

    const inner = this.shadowRoot.querySelector('.ctx-menu-item');
    const iconEl = this.shadowRoot.querySelector('.ctx-menu-item__icon') as HTMLElement;
    const labelEl = this.shadowRoot.querySelector('.ctx-menu-item__label') as HTMLElement;
    const shortcutEl = this.shadowRoot.querySelector('.ctx-menu-item__shortcut') as HTMLElement;
    const arrowEl = this.shadowRoot.querySelector('.ctx-menu-item__arrow') as HTMLElement;

    if (!inner || !iconEl || !labelEl || !shortcutEl || !arrowEl) return;

    const visibleAttr = this.getAttribute('visible');
    this._visible = visibleAttr !== 'false';

    this.style.display = this._visible ? '' : 'none';

    labelEl.textContent = this.getAttribute('label') || '';
    iconEl.textContent = this.getAttribute('icon') || '';
    iconEl.style.display = this.hasAttribute('icon') ? '' : 'none';
    shortcutEl.textContent = this.getAttribute('shortcut') || '';
    shortcutEl.style.display = this.hasAttribute('shortcut') ? '' : 'none';
    arrowEl.textContent = '▶';
    arrowEl.style.display = this._submenu ? '' : 'none';

    if (this.disabled) {
      inner.classList.add('ctx-menu-item--disabled');
      this.setAttribute('aria-disabled', 'true');
    } else {
      inner.classList.remove('ctx-menu-item--disabled');
      this.removeAttribute('aria-disabled');
    }

    if (this._submenu) {
      this.setAttribute('aria-haspopup', 'true');
    } else {
      this.removeAttribute('aria-haspopup');
    }
  }
}

if (!customElements.get('context-menu-item')) {
  customElements.define('context-menu-item', ContextMenuItem);
}
