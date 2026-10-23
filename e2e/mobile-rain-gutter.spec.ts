import { expect, test } from '@playwright/test';
import type { ResultCore } from '@pastlife/scoring';
import { buildContentStoryResult } from '../apps/api/src/results/story-result.js';

test('shows Serin’s complete 01–04 life and separate rain-route art on phone and tablet', async ({ page }) => {
  const backgroundUri = 'asset://stories/v3/rain-gutter-rebon-bg-v2.jpg';
  const characterUri = 'asset://stories/v3/rain-gutter-serin.webp';
  const image = {
    sourceType: 'LIBRARY' as const, uri: backgroundUri, alt: '레본 공동 지붕의 갈라진 빗물길과 지붕지기 세린',
    status: 'READY' as const, attemptCount: 0, matchQuality: 'EXACT' as const,
    layers: [
      { uri: backgroundUri, role: 'BACKGROUND' as const, alt: '상단에서는 넘치고 하단에는 닿지 않는 첫비의 Y자 물길' },
      { uri: characterUri, role: 'CHARACTER' as const, alt: '나무 갈고리와 안전줄을 갖춘 지붕지기 세린' },
    ],
  };
  const core = { storyId: 'RAIN_GUTTER', storySignals: ['speak'], recordNo: 1 } as ResultCore;
  const result = buildContentStoryResult('rain-gutter-qa', core, image);
  await page.route('**/api/v1/results/*/basic', (route) => route.fulfill({ json: result }));

  await page.goto('/');
  await page.getByRole('button', { name: /나의 전생 찾아보기/ }).click();
  await page.getByRole('button', { name: /질문 시작하기/ }).click();
  for (let stage = 1; stage <= 6; stage += 1) {
    await expect(page).toHaveURL(new RegExp(`/question/${stage}$`));
    await page.getByRole('button').first().click();
  }
  await expect(page).toHaveURL(/\/result$/);
  await expect(page.getByText('세린', { exact: true })).toBeVisible();
  await expect(page.getByText('루안 · 빗길력 · 테란 고원연맹 남단 레본 자치시')).toBeVisible();
  const background = page.getByRole('img', { name: image.alt }).first();
  const character = page.getByRole('img', { name: '전생 인물' });
  for (const viewport of [{ width: 320, height: 720 }, { width: 768, height: 1024 }]) {
    await page.setViewportSize(viewport);
    await expect.poll(async () => background.evaluate((el) => el instanceof HTMLImageElement && el.complete && el.naturalWidth >= 1024)).toBe(true);
    await expect.poll(async () => character.evaluate((el) => el instanceof HTMLImageElement && el.complete && el.naturalWidth >= 1024)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
    await page.screenshot({ path: `output/playwright/story-rain-gutter-${viewport.width}.png`, fullPage: true });
    for (const [chapter, phrase] of [[2, '하단 저장조에 첫 물소리'], [3, '73세'], [4, '보람']] as const) {
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
