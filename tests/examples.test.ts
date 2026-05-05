import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../examples/index.html', import.meta.url), 'utf8');

describe('example page layout', () => {
  it('renders four centered right-click targets without the old fixed edge target', () => {
    expect(html).toContain('class="target-grid"');
    expect(html).toContain('id="target-google-light"');
    expect(html).toContain('id="target-edge-light"');
    expect(html).toContain('id="target-google-dark"');
    expect(html).toContain('id="target-edge-dark"');
    expect(html).not.toContain('class="edge-target"');
    expect(html).not.toContain('position: fixed;');
    expect(html).not.toContain('id="target-edge"');
  });

  it('binds each example target to a matching menu style and theme', () => {
    expect(html).toContain('id="google-light-menu" style-type="google" theme="light"');
    expect(html).toContain('id="edge-light-menu" style-type="edge" theme="light"');
    expect(html).toContain('id="google-dark-menu" style-type="google" theme="dark-element"');
    expect(html).toContain('id="edge-dark-menu" style-type="edge" theme="dark-element"');

    expect(html).toContain("setupMenu('google-light-menu', 'target-google-light')");
    expect(html).toContain("setupMenu('edge-light-menu', 'target-edge-light')");
    expect(html).toContain("setupMenu('google-dark-menu', 'target-google-dark')");
    expect(html).toContain("setupMenu('edge-dark-menu', 'target-edge-dark')");
  });

  it('shows a sorting submenu with option items', () => {
    expect(html).toContain('<context-menu-item label="Sort"');
    expect(html).toContain('<context-menu-option-item name="sort" value="asc" label="Ascending"');
    expect(html).toContain('<context-menu-option-item name="sort" value="desc" label="Descending"');
    expect(html).toContain('<context-menu-option-item name="sort" value="none" label="No Sort" checked');
    expect(html).toContain("menu.addEventListener('option-change'");
  });
});
