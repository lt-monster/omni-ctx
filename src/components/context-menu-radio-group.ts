import { radioGroupStyles } from '../styles';

const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `<style>${radioGroupStyles}</style><slot></slot>`;

export class ContextMenuRadioGroup extends HTMLElement {
  static get observedAttributes() { return ['name', 'value']; }

  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    root.appendChild(TEMPLATE.content.cloneNode(true));
  }

  connectedCallback() { this.setAttribute('role', 'group'); this._syncItems(); }
  attributeChangedCallback(name: string) { if (name === 'value') this._syncItems(); }

  get name(): string { return this.getAttribute('name') || ''; }
  get value(): string { return this.getAttribute('value') || ''; }

  setRadioValue(value: string): void {
    this.setAttribute('value', value);
    this._syncItems();
    const selectedItem = this.querySelector(`context-menu-radio-item[value="${value}"]`);
    this.dispatchEvent(new CustomEvent('change', {
      bubbles: true, composed: true,
      detail: { name: this.name, value, label: selectedItem?.getAttribute('label') || '' },
    }));
  }

  getRadioValue(): string { return this.value; }

  private _syncItems(): void {
    const currentValue = this.value;
    this.querySelectorAll<HTMLElement & { checked: boolean }>('context-menu-radio-item')
      .forEach((item) => { item.checked = item.getAttribute('value') === currentValue; });
  }
}

if (!customElements.get('context-menu-radio-group')) {
  customElements.define('context-menu-radio-group', ContextMenuRadioGroup);
}
