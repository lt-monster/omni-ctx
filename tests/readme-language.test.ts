import { describe, expect, it } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';

const readmeEnPath = new URL('../README.md', import.meta.url);
const readmeZhPath = new URL('../README_ZH.md', import.meta.url);

function readUtf8(url: URL) {
  return readFileSync(url, 'utf8');
}

function expectLanguageSwitchLinks(readme: string) {
  expect(readme).toContain('<a href="./README.md">English</a>');
  expect(readme).toContain('<a href="./README_ZH.md">简体中文</a>');
}

function expectLanguageSwitchBelowBadges(readme: string) {
  const badgeRowIndex = readme.indexOf('img.shields.io/npm/v/omni-ctx');
  const switchRowIndex = readme.indexOf('<a href="./README_ZH.md">简体中文</a>');
  const firstSectionIndex = readme.indexOf('## ');

  expect(badgeRowIndex).toBeGreaterThanOrEqual(0);
  expect(switchRowIndex).toBeGreaterThan(badgeRowIndex);
  expect(firstSectionIndex).toBeGreaterThan(switchRowIndex);
}

function getPrimaryReadmeHeroAndIntro(readme: string) {
  const firstSectionIndex = readme.indexOf('## ');

  return firstSectionIndex === -1 ? readme : readme.slice(0, firstSectionIndex);
}

function getSection(readme: string, heading: string) {
  const startIndex = readme.indexOf(heading);

  if (startIndex === -1) return '';

  const nextSectionIndex = readme.indexOf('\n## ', startIndex + heading.length);

  return nextSectionIndex === -1
    ? readme.slice(startIndex)
    : readme.slice(startIndex, nextSectionIndex);
}

describe('bilingual README language switch', () => {
  it('creates the dedicated Chinese README file', () => {
    expect(existsSync(readmeZhPath)).toBe(true);
  });

  it('includes bidirectional language switch links in both READMEs, below the badge row', () => {
    expect(existsSync(readmeZhPath)).toBe(true);

    const readmeEn = readUtf8(readmeEnPath);
    const readmeZh = readUtf8(readmeZhPath);

    expectLanguageSwitchLinks(readmeEn);
    expectLanguageSwitchLinks(readmeZh);
    expectLanguageSwitchBelowBadges(readmeEn);
    expectLanguageSwitchBelowBadges(readmeZh);
  });

  it('keeps the primary README introduction English-first', () => {
    const readmeEn = readUtf8(readmeEnPath);
    const heroAndIntro = getPrimaryReadmeHeroAndIntro(readmeEn);

    expect(heroAndIntro).toMatch(/OmniCtx\s+is\b/i);
    expect(heroAndIntro).toMatch(/context menu/i);
    expect(heroAndIntro).toMatch(/declarative|programmatic|browser/i);
    expect(heroAndIntro).not.toMatch(/[\u4e00-\u9fff]/);
  });

  it('shows Chinese installation commands as clear alternatives instead of one chained command', () => {
    const readmeZh = readUtf8(readmeZhPath);
    const installSection = getSection(readmeZh, '## 📦 安装');

    expect(installSection).toContain('任选');
    expect(installSection).toContain('npm install omni-ctx');
    expect(installSection).toContain('yarn add omni-ctx');
    expect(installSection).toContain('pnpm add omni-ctx');
    expect(installSection).not.toContain('npm install omni-ctx && yarn add omni-ctx && pnpm add omni-ctx');
  });
});
