import { radioItemStyles } from '../styles';

const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>${radioItemStyles}</style>
  <div class="ctx-menu-radio-item" part="radio-item">
    <span class="ctx-menu-radio-item__mark" part="radio-mark"></span>
    <span class="ctx-menu-radio-item__label" part="radio-label"></span>
  </div>
`;

export class ContextMenuRadioItem extends HTMLElement {
  static get observedAttributes() { return ['label', 'value', 'disabled']; }

  private _checked = false;

  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    root.appendChild(TEMPLATE.content.cloneNode(true));
  }

  connectedCallback() {
    this.setAttribute('role', 'menuitemradio');
    this.setAttribute('tabindex', '-1');
    this.addEventListener('click', this._handleClick);
    this._updateRendering();
  }

  disconnectedCallback() { this.removeEventListener('click', this._handleClick); }

  attributeChangedCallback(name: string) {
    if (['label', 'value', 'disabled'].includes(name)) this._updateRendering();
  }

  get value(): string { return this.getAttribute('value') || ''; }
  get label(): string { return this.getAttribute('label') || ''; }
  get disabled(): boolean { return this.hasAttribute('disabled'); }
  get checked(): boolean { return this._checked; }
  set checked(value: boolean) { this._checked = value; this._updateRendering(); }

  private _handleClick = () => {
    if (this.disabled) return;
    const group = this.closest('context-menu-radio-group');
    if (group) (group as any).setRadioValue(this.value);
  };

  private _updateRendering(): void {
    if (!this.shadowRoot) return;
    const inner = this.shadowRoot.querySelector('.ctx-menu-radio-item');
    const mark = this.shadowRoot.querySelector('.ctx-menu-radio-item__mark') as HTMLElement;
    const label = this.shadowRoot.querySelector('.ctx-menu-radio-item__label') as HTMLElement;
    if (!inner || !mark || !label) return;

    label.textContent = this.getAttribute('label') || '';
    mark.textContent = this._checked ? '●' : '';

    if (this.disabled) {
      inner.classList.add('ctx-menu-radio-item--disabled');
      this.setAttribute('aria-disabled', 'true');
    } else {
      inner.classList.remove('ctx-menu-radio-item--disabled');
      this.removeAttribute('aria-disabled');
    }
    this.setAttribute('aria-checked', String(this._checked));
  }
}

if (!customElements.get('context-menu-radio-item')) {
  customElements.define('context-menu-radio-item', ContextMenuRadioItem);
}
