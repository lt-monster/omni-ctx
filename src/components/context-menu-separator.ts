import { separatorStyles } from '../styles';

const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>${separatorStyles}</style>
  <div class="ctx-menu-separator"></div>
`;

export class ContextMenuSeparator extends HTMLElement {
  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    root.appendChild(TEMPLATE.content.cloneNode(true));
  }

  connectedCallback() {
    this.setAttribute('role', 'separator');
  }
}

if (!customElements.get('context-menu-separator')) {
  customElements.define('context-menu-separator', ContextMenuSeparator);
}
