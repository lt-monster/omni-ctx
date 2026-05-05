import { describe, expect, it } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';

const readmePath = new URL('../README.md', import.meta.url);
const licensePath = new URL('../LICENSE', import.meta.url);

describe('README npm-safe asset links', () => {
  it('creates a root MIT license file', () => {
    expect(existsSync(licensePath)).toBe(true);
  });

  it('uses an absolute github raw url for the logo', () => {
    const readme = readFileSync(readmePath, 'utf8');
    expect(readme).toContain('https://raw.githubusercontent.com/lt-monster/omni-ctx/master/assets/logo/omni-ctx-logo.svg');
  });

  it('uses an absolute github url for the license link', () => {
    const readme = readFileSync(readmePath, 'utf8');
    expect(readme).toContain('https://github.com/lt-monster/omni-ctx/blob/master/LICENSE');
  });

  it('keeps the centered hero block intact', () => {
    const readme = readFileSync(readmePath, 'utf8');
    expect(readme).toContain('<p align="center">');
    expect(readme).toContain('<h1 align="center">OmniCtx</h1>');
  });
});
