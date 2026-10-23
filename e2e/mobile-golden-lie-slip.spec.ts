import { expect, test } from '@playwright/test';
import type { ResultCore } from '@pastlife/scoring';
import { buildContentStoryResult } from '../apps/api/src/results/story-result.js';

test('shows Yeodam’s full life and separate market art on phone and tablet', async ({ page }) => {
  const backgroundUri = 'asset://stories/v3/golden-lie-slip-nasel-bg.jpg';
  const characterUri = 'asset://stories/v3/golden-lie-slip-yeodam.webp';
  const image = {
    sourceType: 'LIBRARY' as const, uri: backgroundUri,
    alt: '나셀 시장의 금빛 종이 가게와 빵 좌판 앞의 여담',
    status: 'READY' as const, attemptCount: 0, matchQuality: 'EXACT' as const,
    layers: [
      { uri: backgroundUri, role: 'BACKGROUND' as const, alt: '금빛 종이가 걸린 가게와 맞은편 빵 좌판이 있는 늦여름 나셀 시장' },
      { uri: characterUri, role: 'CHARACTER' as const, alt: '금빛 종이를 손에 쥔 가게 주인 여담' },
    ],
  };
  const core = { storyId: 'GOLDEN_LIE_SLIP', storySignals: ['notice'], recordNo: 1 } as ResultCore;
  const result = buildContentStoryResult('golden-lie-slip-qa', core, image);
  await page.route('**/api/v1/results/*/basic', (route) => route.fulfill({ json: result }));

  await page.goto('/');
  await page.getByRole('button', { name: /나의 전생 찾아보기/ }).click();
  await page.getByRole('button', { name: /질문 시작하기/ }).click();
  for (let stage = 1; stage <= 6; stage += 1) {
    await expect(page).toHaveURL(new RegExp(`/question/${stage}$`));
    await page.getByRole('button').first().click();
  }
  await expect(page).toHaveURL(/\/result$/);
  await expect(page.getByText('여담', { exact: true })).toBeVisible();
  const background = page.getByRole('img', { name: image.alt }).first();
  const character = page.getByRole('img', { name: '전생 인물' });
  for (const viewport of [{ width: 320, height: 720 }, { width: 768, height: 1024 }]) {
    await page.setViewportSize(viewport);
    await expect.poll(async () => background.evaluate((el) => el instanceof HTMLImageElement && el.complete && el.naturalWidth >= 1024)).toBe(true);
    await expect.poll(async () => character.evaluate((el) => el instanceof HTMLImageElement && el.complete && el.naturalWidth >= 1024)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
    await page.screenshot({ path: `output/playwright/story-golden-lie-slip-${viewport.width}.png`, fullPage: true });
    for (const [chapter, phrase] of [[2, '그냥 찢을 수도 있었잖아요'], [3, '76세'], [4, '빵 장수 소미']] as const) {
      await page.getByRole('button', { name: new RegExp(`^${chapter}장 .* 보기$`) }).click();
      let found = false;
      for (let pageNo = 0; pageNo < 30; pageNo += 1) {
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
