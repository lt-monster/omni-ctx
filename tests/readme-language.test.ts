import { describe, expect, it } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';

const readmeEnPath = new URL('../README.md', import.meta.url);
const readmeZhPath = new URL('../README_ZH.md', import.meta.url);

describe('bilingual README language switch', () => {
  it('creates the Chinese README file', () => {
    expect(existsSync(readmeZhPath)).toBe(true);
  });

  it('adds a bidirectional language switch below the badges', () => {
    const readmeEn = readFileSync(readmeEnPath, 'utf8');
    const readmeZh = readFileSync(readmeZhPath, 'utf8');

    expect(readmeEn).toContain('<a href="./README.md">English</a>');
    expect(readmeEn).toContain('<a href="./README_ZH.md">简体中文</a>');
    expect(readmeZh).toContain('<a href="./README.md">English</a>');
    expect(readmeZh).toContain('<a href="./README_ZH.md">简体中文</a>');
  });

  it('uses English introductory wording in the primary README', () => {
    const readmeEn = readFileSync(readmeEnPath, 'utf8');

    expect(readmeEn).toContain(
      'OmniCtx is a Web Components-based context menu library',
    );
    expect(readmeEn).not.toContain(
      'OmniCtx 是一个基于 Web Components 的上下文菜单组件库',
    );
  });
});
