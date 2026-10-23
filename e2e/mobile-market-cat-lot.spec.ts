import { expect, test } from '@playwright/test';
import type { ResultCore } from '@pastlife/scoring';
import { buildContentStoryResult } from '../apps/api/src/results/story-result.js';

test('shows the complete Mojin result with its own identity and layered art at phone and tablet widths', async ({ page }) => {
  const backgroundUri = 'asset://stories/v3/market-cat-lot-toram-bg-v2.jpg';
  const characterUri = 'asset://stories/v3/market-cat-lot-mojin.webp';
  const image = {
    sourceType: 'LIBRARY' as const,
    uri: backgroundUri,
    alt: '토람 강가 장터의 다섯 바구니와 추첨 진행자 모진',
    status: 'READY' as const,
    attemptCount: 0,
    matchQuality: 'EXACT' as const,
    layers: [
      { uri: backgroundUri, role: 'BACKGROUND' as const, alt: '햇볕 든 바구니의 회색 고양이와 목제 번호표 함' },
      { uri: characterUri, role: 'CHARACTER' as const, alt: '같은 모양의 번호표를 들고 설명하는 시장 진행자 모진' },
    ],
  };
  const core = { storyId: 'MARKET_CAT_LOT', storySignals: ['notice'], recordNo: 1 } as ResultCore;
  const result = buildContentStoryResult('market-cat-qa', core, image);
  await page.route('**/api/v1/results/*/basic', (route) => route.fulfill({ json: result }));

  await page.goto('/');
  await page.getByRole('button', { name: /나의 전생 찾아보기/ }).click();
  await page.getByRole('button', { name: /질문 시작하기/ }).click();
  for (let stage = 1; stage <= 6; stage += 1) {
    await expect(page).toHaveURL(new RegExp(`/question/${stage}$`));
    await page.getByRole('button').first().click();
  }
  await expect(page).toHaveURL(/\/result$/);
  await expect(page.getByText('모진', { exact: true })).toBeVisible();
  await expect(page.getByText('하민 · 나루력 · 여산 강연맹 토람 자유시장')).toBeVisible();
  const background = page.getByRole('img', { name: image.alt }).first();
  const character = page.getByRole('img', { name: '전생 인물' });
  for (const viewport of [{ width: 320, height: 720 }, { width: 768, height: 1024 }]) {
    await page.setViewportSize(viewport);
    await expect.poll(async () => background.evaluate((el) => el instanceof HTMLImageElement && el.complete && el.naturalWidth >= 1024)).toBe(true);
    await expect.poll(async () => character.evaluate((el) => el instanceof HTMLImageElement && el.complete && el.naturalWidth >= 1024)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
    await page.screenshot({ path: `output/playwright/story-market-cat-lot-actual-${viewport.width}.png`, fullPage: true });
    for (const [chapter, phrase] of [[2, '고도'], [3, '72세'], [4, '도희']] as const) {
      await page.getByRole('button', { name: new RegExp(`^${chapter}장 .* 보기$`) }).click();
      let found = false;
      for (let pageNo = 0; pageNo < 20; pageNo += 1) {
        const reader = page.getByTestId('chapter-reader-panel');
        const content = await reader.textContent();
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
        if (content?.includes(phrase)) {
          found = true;
          break;
        }
        const next = page.getByRole('button', { name: '다음 글 페이지' });
        if (!await next.isEnabled()) break;
        await next.click();
      }
      expect(found, `chapter ${chapter} should contain ${phrase}`).toBe(true);
    }
    await page.getByRole('button', { name: /^1장 .* 보기$/ }).click();
  }
});
