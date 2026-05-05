import { describe, expect, it } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';

const readmePath = new URL('../README.md', import.meta.url);
const logoPath = new URL('../assets/logo/omni-ctx-logo.svg', import.meta.url);

describe('README hero logo', () => {
  it('creates the svg logo asset in assets/logo', () => {
    expect(existsSync(logoPath)).toBe(true);
  });

  it('references the svg logo from the readme hero area', () => {
    const readme = readFileSync(readmePath, 'utf8');
    expect(readme).toContain('assets/logo/omni-ctx-logo.svg');
    expect(readme).toContain('<p align="center">');
    expect(readme).toContain('<h1 align="center">OmniCtx</h1>');
  });

  it('centers the badge block below the title', () => {
    const readme = readFileSync(readmePath, 'utf8');
    expect(readme).toContain('img.shields.io/npm/v/omni-ctx');
    expect(readme).toContain('img.shields.io/badge/license-MIT-blue.svg');
    expect(readme).toContain('img.shields.io/badge/runtime-Web%20Components-orange.svg');
    expect(readme).toContain('</p>');
  });

  it('keeps the logo svg transparent and menu-oriented', () => {
    const svg = readFileSync(logoPath, 'utf8');
    expect(svg).toContain('<svg');
    expect(svg).toContain('viewBox=');
    expect(svg).toContain('rect');
    expect(svg).toContain('line');
    expect(svg).not.toContain('<text');
  });
});
