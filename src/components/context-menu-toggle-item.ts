import { menuItemStyles, toggleItemStyles } from '../styles';

const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>${menuItemStyles}${toggleItemStyles}</style>
  <div class="ctx-menu-item ctx-menu-toggle-item" part="item">
    <span class="ctx-menu-item__icon" part="icon"></span>
    <span class="ctx-menu-item__label ctx-menu-toggle-item__label" part="label"></span>
    <div class="ctx-menu-toggle-item__switch" part="switch">
      <div class="ctx-menu-toggle-item__track" part="switch-track">
        <div class="ctx-menu-toggle-item__thumb" part="switch-thumb"></div>
      </div>
    </div>
    <span class="ctx-menu-item__arrow" style="display:none"></span>
  </div>
`;

export class ContextMenuToggleItem extends HTMLElement {
  static get observedAttributes() { return ['label', 'checked', 'disabled']; }

  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    root.appendChild(TEMPLATE.content.cloneNode(true));
  }

  connectedCallback() {
    this.setAttribute('role', 'menuitemcheckbox');
    this.setAttribute('tabindex', '-1');
    this.addEventListener('click', this._handleClick);
    this._updateRendering();
  }

  disconnectedCallback() { this.removeEventListener('click', this._handleClick); }

  attributeChangedCallback(name: string) {
    if (['label', 'checked', 'disabled'].includes(name)) this._updateRendering();
  }

  get label(): string { return this.getAttribute('label') || ''; }
  set label(v: string) { this.setAttribute('label', v); }
  get checked(): boolean { return this.hasAttribute('checked'); }
  set checked(v: boolean) { v ? this.setAttribute('checked', '') : this.removeAttribute('checked'); }
  get disabled(): boolean { return this.hasAttribute('disabled'); }
  set disabled(v: boolean) { v ? this.setAttribute('disabled', '') : this.removeAttribute('disabled'); }

  private _handleClick = () => {
    if (this.disabled) return;
    this.checked = !this.checked;
    this.dispatchEvent(new CustomEvent('toggle-change', {
      bubbles: true, composed: true,
      detail: { label: this.label, checked: this.checked },
    }));
  };

  private _updateRendering(): void {
    if (!this.shadowRoot) return;
    const inner = this.shadowRoot.querySelector('.ctx-menu-toggle-item');
    const labelEl = this.shadowRoot.querySelector('.ctx-menu-toggle-item__label') as HTMLElement;
    const trackEl = this.shadowRoot.querySelector('.ctx-menu-toggle-item__track') as HTMLElement;
    if (!inner || !labelEl || !trackEl) return;

    labelEl.textContent = this.getAttribute('label') || '';
    this.checked ? trackEl.classList.add('ctx-menu-toggle-item__track--on')
                 : trackEl.classList.remove('ctx-menu-toggle-item__track--on');

    if (this.disabled) {
      inner.classList.add('ctx-menu-toggle-item--disabled');
      this.setAttribute('aria-disabled', 'true');
    } else {
      inner.classList.remove('ctx-menu-toggle-item--disabled');
      this.removeAttribute('aria-disabled');
    }
    this.setAttribute('aria-checked', String(this.checked));
  }
}

if (!customElements.get('context-menu-toggle-item')) {
  customElements.define('context-menu-toggle-item', ContextMenuToggleItem);
}
