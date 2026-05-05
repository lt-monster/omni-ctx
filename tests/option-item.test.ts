import { describe, expect, it } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';

const componentPath = new URL('../src/components/context-menu-option-item.ts', import.meta.url);

describe('context-menu-option-item source', () => {
  it('defines a Windows-style option item component', () => {
    expect(existsSync(componentPath)).toBe(true);

    const source = readFileSync(componentPath, 'utf8');
    expect(source).toContain('ContextMenuOptionItem');
    expect(source).toContain("customElements.define('context-menu-option-item'");
    expect(source).toContain("role', 'menuitemradio'");
    expect(source).toContain('option-change');
    expect(source).toContain('menu-select');
    expect(source).toContain("mark.textContent = this.checked ? '●' : ''");
  });

  it('is exported from the package entry and type model', () => {
    const indexSource = readFileSync(new URL('../src/index.ts', import.meta.url), 'utf8');
    const typesSource = readFileSync(new URL('../src/types.ts', import.meta.url), 'utf8');

    expect(indexSource).toContain("export { ContextMenuOptionItem } from './components/context-menu-option-item'");
    expect(indexSource).toContain('OptionChangeEventDetail');
    expect(indexSource).toContain('ContextMenuOptionItemElement');
    expect(typesSource).toContain("type?: 'menu' | 'radio' | 'toggle' | 'separator' | 'option'");
    expect(typesSource).toContain('interface OptionChangeEventDetail');
    expect(typesSource).toContain('interface ContextMenuOptionItemElement');
  });
});
