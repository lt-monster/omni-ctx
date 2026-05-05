import { describe, expect, it } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';

const runtimePath = new URL('../src/runtime/open-context-menu.ts', import.meta.url);

describe('openContextMenu runtime source', () => {
  it('creates a dedicated runtime module', () => {
    expect(existsSync(runtimePath)).toBe(true);
  });

  it('defines a cache keyed by cacheKey', () => {
    const source = readFileSync(runtimePath, 'utf8');
    expect(source).toContain('new Map<string, ContextMenu>()');
    expect(source).toContain('cacheKey');
  });

  it('reuses ContextMenu.open for runtime rendering', () => {
    const source = readFileSync(runtimePath, 'utf8');
    expect(source).toContain("menu.open({ x, y }, { items, param, replace: true })");
  });

  it('returns close and destroy handle methods', () => {
    const source = readFileSync(runtimePath, 'utf8');
    expect(source).toContain('close: () =>');
    expect(source).toContain('destroy: () =>');
  });

  it('creates and reuses runtime menus through helper functions', () => {
    const source = readFileSync(runtimePath, 'utf8');
    expect(source).toContain('function createRuntimeContextMenu()');
    expect(source).toContain('function getOrCreateRuntimeContextMenu(cacheKey?: string)');
    expect(source).toContain('runtimeMenuCache.get(cacheKey)');
    expect(source).toContain('runtimeMenuCache.set(cacheKey, menu)');
  });

  it('keeps cached menus and removes one-off menus on hide', () => {
    const source = readFileSync(runtimePath, 'utf8');
    expect(source).toContain('const originalHide = menu.hide.bind(menu)');
    expect(source).toContain('menu.hide = () => {');
    expect(source).toContain('if (!cacheKey) {');
    expect(source).toContain('menu.remove();');
  });

  it('destroys cached menus explicitly', () => {
    const source = readFileSync(runtimePath, 'utf8');
    expect(source).toContain('runtimeMenuCache.delete(cacheKey)');
    expect(source).toContain('destroyRuntimeContextMenu(menu, cacheKey)');
  });
});
