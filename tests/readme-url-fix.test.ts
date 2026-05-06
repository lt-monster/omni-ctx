import { describe, expect, it } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';

const readmeEnPath = new URL('../README.md', import.meta.url);
const readmeZhPath = new URL('../README_ZH.md', import.meta.url);
const licensePath = new URL('../LICENSE', import.meta.url);

describe('README npm-safe asset links', () => {
  it('creates a root MIT license file', () => {
    expect(existsSync(licensePath)).toBe(true);
  });

  it('uses an absolute github raw url for the logo in both readmes', () => {
    const readmeEn = readFileSync(readmeEnPath, 'utf8');
    const readmeZh = readFileSync(readmeZhPath, 'utf8');

    expect(readmeEn).toContain('https://raw.githubusercontent.com/lt-monster/omni-ctx/master/assets/logo/omni-ctx-logo.svg');
    expect(readmeZh).toContain('https://raw.githubusercontent.com/lt-monster/omni-ctx/master/assets/logo/omni-ctx-logo.svg');
  });

  it('uses an absolute github url for the license link in both readmes', () => {
    const readmeEn = readFileSync(readmeEnPath, 'utf8');
    const readmeZh = readFileSync(readmeZhPath, 'utf8');

    expect(readmeEn).toContain('https://github.com/lt-monster/omni-ctx/blob/master/LICENSE');
    expect(readmeZh).toContain('https://github.com/lt-monster/omni-ctx/blob/master/LICENSE');
  });

  it('keeps the centered hero block intact in both readmes', () => {
    const readmeEn = readFileSync(readmeEnPath, 'utf8');
    const readmeZh = readFileSync(readmeZhPath, 'utf8');

    expect(readmeEn).toContain('<p align="center">');
    expect(readmeZh).toContain('<p align="center">');
    expect(readmeEn).toContain('<h1 align="center">OmniCtx</h1>');
    expect(readmeZh).toContain('<h1 align="center">OmniCtx</h1>');
  });
});
