import { describe, expect, it } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';

const readmeEnPath = new URL('../README.md', import.meta.url);
const readmeZhPath = new URL('../README_ZH.md', import.meta.url);
const logoPath = new URL('../assets/logo/omni-ctx-logo.svg', import.meta.url);

describe('README hero logo', () => {
  it('creates the svg logo asset in assets/logo', () => {
    expect(existsSync(logoPath)).toBe(true);
  });

  it('references the svg logo from both readme hero areas', () => {
    const readmeEn = readFileSync(readmeEnPath, 'utf8');
    const readmeZh = readFileSync(readmeZhPath, 'utf8');

    expect(readmeEn).toContain('assets/logo/omni-ctx-logo.svg');
    expect(readmeZh).toContain('assets/logo/omni-ctx-logo.svg');
    expect(readmeEn).toContain('<p align="center">');
    expect(readmeZh).toContain('<p align="center">');
    expect(readmeEn).toContain('<h1 align="center">OmniCtx</h1>');
    expect(readmeZh).toContain('<h1 align="center">OmniCtx</h1>');
  });

  it('centers the badge block below the title in both readmes', () => {
    const readmeEn = readFileSync(readmeEnPath, 'utf8');
    const readmeZh = readFileSync(readmeZhPath, 'utf8');

    expect(readmeEn).toContain('img.shields.io/npm/v/omni-ctx');
    expect(readmeZh).toContain('img.shields.io/npm/v/omni-ctx');
    expect(readmeEn).toContain('img.shields.io/badge/license-MIT-blue.svg');
    expect(readmeZh).toContain('img.shields.io/badge/license-MIT-blue.svg');
    expect(readmeEn).toContain('img.shields.io/badge/runtime-Web%20Components-orange.svg');
    expect(readmeZh).toContain('img.shields.io/badge/runtime-Web%20Components-orange.svg');
    expect(readmeEn).toContain('</p>');
    expect(readmeZh).toContain('</p>');
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
