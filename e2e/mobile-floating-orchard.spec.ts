import { expect, test } from '@playwright/test';
import type { ResultCore } from '@pastlife/scoring';
import { buildContentStoryResult } from '../apps/api/src/results/story-result.js';

test('shows Ryeowon’s full life and separate orchard art on phone and tablet', async ({ page }) => {
  const backgroundUri = 'asset://stories/v3/floating-orchard-belo-bg.jpg';
  const characterUri = 'asset://stories/v3/floating-orchard-ryeowon.webp';
  const image = {
    sourceType: 'LIBRARY' as const, uri: backgroundUri,
    alt: '벨로 하늘 과수원의 두 부유섬과 밧줄지기 려원',
    status: 'READY' as const, attemptCount: 0, matchQuality: 'EXACT' as const,
    layers: [
      { uri: backgroundUri, role: 'BACKGROUND' as const, alt: '배나무가 자라는 두 부유섬, 밧줄 감개와 멀리 보이는 검은 절벽' },
      { uri: characterUri, role: 'CHARACTER' as const, alt: '밧줄과 감개 손잡이를 든 려원' },
    ],
  };
  const core = { storyId: 'FLOATING_ORCHARD', storySignals: ['protect'], recordNo: 1 } as ResultCore;
  const result = buildContentStoryResult('floating-orchard-qa', core, image);
  await page.route('**/api/v1/results/*/basic', (route) => route.fulfill({ json: result }));

  await page.goto('/');
  await page.getByRole('button', { name: /나의 전생 찾아보기/ }).click();
  await page.getByRole('button', { name: /질문 시작하기/ }).click();
  for (let stage = 1; stage <= 6; stage += 1) {
    await expect(page).toHaveURL(new RegExp(`/question/${stage}$`));
    await page.getByRole('button').first().click();
  }
  await expect(page).toHaveURL(/\/result$/);
  await expect(page.getByText('려원', { exact: true })).toBeVisible();
  const background = page.getByRole('img', { name: image.alt }).first();
  const character = page.getByRole('img', { name: '전생 인물' });
  for (const viewport of [{ width: 320, height: 720 }, { width: 768, height: 1024 }]) {
    await page.setViewportSize(viewport);
    await expect.poll(async () => background.evaluate((el) => el instanceof HTMLImageElement && el.complete && el.naturalWidth >= 1024)).toBe(true);
    await expect.poll(async () => character.evaluate((el) => el instanceof HTMLImageElement && el.complete && el.naturalWidth >= 1024)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
    await page.screenshot({ path: `output/playwright/story-floating-orchard-${viewport.width}.png`, fullPage: true });
    for (const [chapter, phrase] of [[2, '묘목섬은 절벽에 닿지 않았습니다'], [3, '71세'], [4, '한솔']] as const) {
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
