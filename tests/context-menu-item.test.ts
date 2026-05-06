import { describe, expect, it } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';

const componentPath = new URL('../src/components/context-menu-item.ts', import.meta.url);
const stylesPath = new URL('../src/styles.ts', import.meta.url);

describe('context-menu-item source', () => {
  it('supports icon slot markup and icon-size attribute', () => {
    expect(existsSync(componentPath)).toBe(true);

    const source = readFileSync(componentPath, 'utf8');

    expect(source).toContain("'icon-size'");
    expect(source).toContain('<slot name="icon"></slot>');
    expect(source).toContain('ctx-menu-item__icon-text');
  });

  it('prefers slot icon content over icon attribute in rendering logic', () => {
    const source = readFileSync(componentPath, 'utf8');

    expect(source).toContain(`querySelector('slot[name="icon"]')`);
    expect(source).toContain('assignedNodes({ flatten: true })');
    expect(source).toContain('hasSlottedIcon');
    expect(source).toContain("iconTextEl.style.display = hasSlottedIcon ? 'none' : icon ? '' : 'none'");
    expect(source).toContain("iconEl.style.display = hasSlottedIcon || icon ? '' : 'none'");
  });

  it('applies icon-size through a host-level css variable override', () => {
    const source = readFileSync(componentPath, 'utf8');

    expect(source).toContain("const iconSize = this.getAttribute('icon-size')");
    expect(source).toContain("this.style.setProperty('--_item-icon-size', iconSize)");
    expect(source).toContain("this.style.removeProperty('--_item-icon-size')");
  });

  it('adds slotted icon sizing styles', () => {
    const source = readFileSync(stylesPath, 'utf8');

    expect(source).toContain('.ctx-menu-item__icon ::slotted(*)');
    expect(source).toContain('.ctx-menu-item__icon ::slotted(svg)');
    expect(source).toContain('.ctx-menu-item__icon ::slotted(img)');
    expect(source).toContain('max-width: 100%');
    expect(source).toContain('max-height: 100%');
  });
});
