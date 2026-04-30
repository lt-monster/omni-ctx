import { groupStyles } from '../styles';

const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>${groupStyles}</style>
  <context-menu-separator></context-menu-separator>
  <div class="ctx-menu-group__label" part="group-label"></div>
  <div class="ctx-menu-group__items">
    <slot></slot>
  </div>
`;

export class ContextMenuGroup extends HTMLElement {
  static get observedAttributes() {
    return ['label'];
  }

  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    root.appendChild(TEMPLATE.content.cloneNode(true));
  }

  connectedCallback() {
    this.setAttribute('role', 'group');
    this._updateLabel();
    this._checkVisibility();
    this.addEventListener('slotchange', this._checkVisibility);
  }

  disconnectedCallback() {
    this.removeEventListener('slotchange', this._checkVisibility);
  }

  attributeChangedCallback(name: string, _old: string | null, _new: string | null) {
    if (name === 'label') {
      this._updateLabel();
    }
  }

  private _updateLabel(): void {
    const labelEl = this.shadowRoot?.querySelector('.ctx-menu-group__label');
    if (labelEl) {
      labelEl.textContent = this.getAttribute('label') || '';
    }
  }

  private _checkVisibility = (): void => {
    const children = Array.from(this.children) as HTMLElement[];
    const hasVisible = children.some(
      (child) => child.style.display !== 'none' && !child.hasAttribute('hidden'),
    );
    this.style.display = hasVisible ? '' : 'none';
  };
}

if (!customElements.get('context-menu-group')) {
  customElements.define('context-menu-group', ContextMenuGroup);
}
