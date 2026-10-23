import { expect, test } from '@playwright/test';
import type { ResultCore } from '@pastlife/scoring';
import { buildContentStoryResult } from '../apps/api/src/results/story-result.js';

test('shows Ajeong’s full life and separate river art on phone and tablet', async ({ page }) => {
  const backgroundUri = 'asset://stories/v3/two-final-ferries-durim-bg-v2.jpg';
  const characterUri = 'asset://stories/v3/two-final-ferries-ajeong.webp';
  const image = {
    sourceType: 'LIBRARY' as const, uri: backgroundUri,
    alt: '두림과 모렌의 두 종탑, 가운데 나루 등불과 통역사 아정',
    status: 'READY' as const, attemptCount: 0, matchQuality: 'EXACT' as const,
    layers: [
      { uri: backgroundUri, role: 'BACKGROUND' as const, alt: '강 양편의 종탑과 등불이 켜진 공동 나루, 마지막 나무배' },
      { uri: characterUri, role: 'CHARACTER' as const, alt: '시각을 적은 수첩을 든 통역사 아정' },
    ],
  };
  const core = { storyId: 'TWO_FINAL_FERRIES', storySignals: ['notice'], recordNo: 1 } as ResultCore;
  const result = buildContentStoryResult('two-final-ferries-qa', core, image);
  await page.route('**/api/v1/results/*/basic', (route) => route.fulfill({ json: result }));

  await page.goto('/');
  await page.getByRole('button', { name: /나의 전생 찾아보기/ }).click();
  await page.getByRole('button', { name: /질문 시작하기/ }).click();
  for (let stage = 1; stage <= 6; stage += 1) {
    await expect(page).toHaveURL(new RegExp(`/question/${stage}$`));
    await page.getByRole('button').first().click();
  }
  await expect(page).toHaveURL(/\/result$/);
  await expect(page.getByText('아정', { exact: true })).toBeVisible();
  const background = page.getByRole('img', { name: image.alt }).first();
  const character = page.getByRole('img', { name: '전생 인물' });
  for (const viewport of [{ width: 320, height: 720 }, { width: 768, height: 1024 }]) {
    await page.setViewportSize(viewport);
    await expect.poll(async () => background.evaluate((el) => el instanceof HTMLImageElement && el.complete && el.naturalWidth >= 1024)).toBe(true);
    await expect.poll(async () => character.evaluate((el) => el instanceof HTMLImageElement && el.complete && el.naturalWidth >= 1024)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
    await page.screenshot({ path: `output/playwright/story-two-final-ferries-${viewport.width}.png`, fullPage: true });
    for (const [chapter, phrase] of [[2, '아직 한 줄이 비어 있었습니다'], [3, '78세'], [4, '루오']] as const) {
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
