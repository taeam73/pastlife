import { expect, test } from '@playwright/test';
import type { ResultCore } from '@pastlife/scoring';
import { buildContentStoryResult } from '../apps/api/src/results/story-result.js';

test('shows Darin’s complete 01–04 life and separate workshop art on phone and tablet', async ({ page }) => {
  const backgroundUri = 'asset://stories/v3/twelve-left-shoes-biel-workshop-bg.jpg';
  const characterUri = 'asset://stories/v3/twelve-left-shoes-darin.webp';
  const image = {
    sourceType: 'LIBRARY' as const, uri: backgroundUri, alt: '비엘 항구 공방의 같은 쪽 춤 신발과 장인 다린',
    status: 'READY' as const, attemptCount: 0, matchQuality: 'EXACT' as const,
    layers: [
      { uri: backgroundUri, role: 'BACKGROUND' as const, alt: '왼발 견본 하나와 같은 쪽 끈이 달린 여러 춤 신발' },
      { uri: characterUri, role: 'CHARACTER' as const, alt: '신발 두 짝과 송곳을 든 비엘의 신발 장인 다린' },
    ],
  };
  const core = { storyId: 'TWELVE_LEFT_SHOES', storySignals: ['repair'], recordNo: 1 } as ResultCore;
  const result = buildContentStoryResult('left-shoes-qa', core, image);
  await page.route('**/api/v1/results/*/basic', (route) => route.fulfill({ json: result }));

  await page.goto('/');
  await page.getByRole('button', { name: /나의 전생 찾아보기/ }).click();
  await page.getByRole('button', { name: /질문 시작하기/ }).click();
  for (let stage = 1; stage <= 6; stage += 1) {
    await expect(page).toHaveURL(new RegExp(`/question/${stage}$`));
    await page.getByRole('button').first().click();
  }
  await expect(page).toHaveURL(/\/result$/);
  await expect(page.getByText('다린', { exact: true })).toBeVisible();
  await expect(page.getByText('미덴 · 행진력 · 미로 상인연맹 비엘 항구 자유시')).toBeVisible();
  const background = page.getByRole('img', { name: image.alt }).first();
  const character = page.getByRole('img', { name: '전생 인물' });
  for (const viewport of [{ width: 320, height: 720 }, { width: 768, height: 1024 }]) {
    await page.setViewportSize(viewport);
    await expect.poll(async () => background.evaluate((el) => el instanceof HTMLImageElement && el.complete && el.naturalWidth >= 1024)).toBe(true);
    await expect.poll(async () => character.evaluate((el) => el instanceof HTMLImageElement && el.complete && el.naturalWidth >= 1024)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
    await page.screenshot({ path: `output/playwright/story-twelve-left-shoes-${viewport.width}.png`, fullPage: true });
    for (const [chapter, phrase] of [[2, '스물네 짝 모두 왼발'], [3, '68세'], [4, '소만']] as const) {
      await page.getByRole('button', { name: new RegExp(`^${chapter}장 .* 보기$`) }).click();
      let found = false;
      for (let pageNo = 0; pageNo < 24; pageNo += 1) {
        const content = await page.getByTestId('chapter-reader-panel').textContent();
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
        if (content?.includes(phrase)) { found = true; break; }
        const next = page.getByRole('button', { name: '다음 글 페이지' });
        if (!await next.isEnabled()) break;
        await next.click();
      }
      expect(found, `chapter ${chapter} should contain ${phrase}`).toBe(true);
    }
    await page.getByRole('button', { name: /^1장 .* 보기$/ }).click();
  }
});
