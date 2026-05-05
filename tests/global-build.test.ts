import { describe, expect, it } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';

const globalEntryPath = new URL('../src/global.ts', import.meta.url);
const buildScriptPath = new URL('../scripts/build.ts', import.meta.url);

describe('global browser build source', () => {
  it('creates a dedicated global entry file', () => {
    expect(existsSync(globalEntryPath)).toBe(true);
  });

  it('assigns exported APIs to window.OmniCtx', () => {
    const source = readFileSync(globalEntryPath, 'utf8');
    expect(source).toContain('window.OmniCtx = OmniCtx');
    expect(source).toContain('openContextMenu');
    expect(source).toContain('ContextMenu');
    expect(source).toContain('ContextMenuItem');
  });

  it('build script emits both esm and global browser outputs', () => {
    const source = readFileSync(buildScriptPath, 'utf8');
    expect(source).toContain("resolve(distDir, 'omni-ctx.js')");
    expect(source).toContain("resolve(distDir, 'omni-ctx.global.js')");
    expect(source).toContain("entrypoints: [resolve(root, 'src/index.ts')]");
    expect(source).toContain("entrypoints: [resolve(root, 'src/global.ts')]");
  });
});
