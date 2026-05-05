import { optionItemStyles } from '../styles';

const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>${optionItemStyles}</style>
  <div class="ctx-menu-option-item" part="option-item">
    <span class="ctx-menu-option-item__mark" part="option-mark"></span>
    <span class="ctx-menu-option-item__label" part="option-label"></span>
  </div>
`;

export class ContextMenuOptionItem extends HTMLElement {
  static get observedAttributes() {
    return ['name', 'value', 'label', 'checked', 'disabled'];
  }

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

  disconnectedCallback() {
    this.removeEventListener('click', this._handleClick);
  }

  attributeChangedCallback() {
    this._updateRendering();
  }

  get name(): string {
    return this.getAttribute('name') || '';
  }

  get value(): string {
    return this.getAttribute('value') || '';
  }

  get label(): string {
    return this.getAttribute('label') || '';
  }

  get checked(): boolean {
    return this.hasAttribute('checked');
  }

  set checked(value: boolean) {
    if (value) {
      this.setAttribute('checked', '');
    } else {
      this.removeAttribute('checked');
    }
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

  private _handleClick = (event: Event) => {
    if (this.disabled) {
      event.stopPropagation();
      return;
    }

    this._setExclusiveChecked();
    this.dispatchEvent(new CustomEvent('option-change', {
      bubbles: true,
      composed: true,
      detail: { name: this.name, value: this.value, label: this.label, item: this },
    }));
    this.dispatchEvent(new CustomEvent('menu-select', {
      bubbles: true,
      composed: true,
      detail: { label: this.label, item: this },
    }));
  };

  private _setExclusiveChecked(): void {
    const menu = this.closest('context-menu');
    const scope = menu || this.parentElement;
    if (!scope) {
      this.checked = true;
      return;
    }

    scope.querySelectorAll<ContextMenuOptionItem>('context-menu-option-item')
      .forEach((item) => {
        if (item.name === this.name) item.checked = item === this;
      });
  }

  private _updateRendering(): void {
    if (!this.shadowRoot) return;

    const inner = this.shadowRoot.querySelector('.ctx-menu-option-item');
    const mark = this.shadowRoot.querySelector('.ctx-menu-option-item__mark') as HTMLElement;
    const label = this.shadowRoot.querySelector('.ctx-menu-option-item__label') as HTMLElement;

    if (!inner || !mark || !label) return;

    label.textContent = this.label;
    mark.textContent = this.checked ? '●' : '';
    this.setAttribute('aria-checked', String(this.checked));

    if (this.disabled) {
      inner.classList.add('ctx-menu-option-item--disabled');
      this.setAttribute('aria-disabled', 'true');
    } else {
      inner.classList.remove('ctx-menu-option-item--disabled');
      this.removeAttribute('aria-disabled');
    }
  }
}

if (!customElements.get('context-menu-option-item')) {
  customElements.define('context-menu-option-item', ContextMenuOptionItem);
}
