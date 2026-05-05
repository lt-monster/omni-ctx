import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';

const packageJsonPath = new URL('../package.json', import.meta.url);
const readmePath = new URL('../README.md', import.meta.url);

describe('package entrypoints for dual builds', () => {
  it('points the default package entry to the minified ESM build', () => {
    const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    expect(pkg.main).toBe('./dist/omni-ctx.min.js');
    expect(pkg.exports['.'].import).toBe('./dist/omni-ctx.min.js');
    expect(pkg.types).toBe('./dist/index.d.ts');
  });

  it('documents both production and debug browser files in the readme', () => {
    const readme = readFileSync(readmePath, 'utf8');
    expect(readme).toContain('dist/omni-ctx.global.min.js');
    expect(readme).toContain('dist/omni-ctx.global.js');
    expect(readme).toContain('dist/omni-ctx.min.js');
    expect(readme).toContain('dist/omni-ctx.js');
  });
});
