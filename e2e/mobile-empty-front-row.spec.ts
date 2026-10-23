import { expect, test } from '@playwright/test';
import type { ResultCore } from '@pastlife/scoring';
import { buildContentStoryResult } from '../apps/api/src/results/story-result.js';

test('shows Farida’s full Cairo life and theatre episode on phone and tablet', async ({ page }) => {
  const backgroundUri = 'asset://stories/v3/empty-front-row-cairo-bg.jpg';
  const characterUri = 'asset://stories/v3/empty-front-row-farida.webp';
  const image = {
    sourceType: 'LIBRARY' as const, uri: backgroundUri,
    alt: '1927년 이집트 왕국 카이로 식료품점 주인 파리다',
    status: 'READY' as const, attemptCount: 0, matchQuality: 'EXACT' as const,
    layers: [
      { uri: backgroundUri, role: 'BACKGROUND' as const, alt: '카이로 식료품점과 거리의 극장' },
      { uri: characterUri, role: 'CHARACTER' as const, alt: '장부와 공연 표를 든 파리다' },
    ],
  };
  const core = { storyId: 'EMPTY_FRONT_ROW', storySignals: ['speak'], recordNo: 1 } as ResultCore;
  const result = buildContentStoryResult('empty-front-row-qa', core, image);
  await page.route('**/api/v1/results/*/basic', (route) => route.fulfill({ json: result }));

  await page.goto('/');
  await page.getByRole('button', { name: /나의 전생 찾아보기/ }).click();
  await page.getByRole('button', { name: /질문 시작하기/ }).click();
  for (let stage = 1; stage <= 6; stage += 1) {
    await expect(page).toHaveURL(new RegExp(`/question/${stage}$`));
    await page.getByRole('button').first().click();
  }
  await expect(page).toHaveURL(/\/result$/);
  await expect(page.getByText('파리다', { exact: true })).toBeVisible();

  for (const viewport of [{ width: 320, height: 720 }, { width: 768, height: 1024 }]) {
    await page.setViewportSize(viewport);
    const background = page.getByTestId('result-hero-background').locator('img');
    const character = page.getByRole('img', { name: '전생 인물' });
    await expect.poll(() => background.evaluate((el) => el instanceof HTMLImageElement && el.complete && el.naturalWidth >= 1024)).toBe(true);
    await expect.poll(() => character.evaluate((el) => el instanceof HTMLImageElement && el.complete && el.naturalWidth >= 1024)).toBe(true);
    for (const [pageIndex, phrase] of ['가게', '성격', '아낀 것'].entries()) {
      const summary = page.getByTestId('result-summary-page');
      await expect(summary).toContainText(phrase);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
      const quote = await page.getByTestId('result-signature-quote').boundingBox();
      const panel = await page.getByTestId('result-summary-panel').boundingBox();
      expect(quote!.y + quote!.height).toBeLessThan(panel!.y);
      await page.screenshot({ path: `output/playwright/story-empty-front-row-${viewport.width}-${pageIndex + 1}.png`, fullPage: true });
      if (pageIndex < 2) await page.getByRole('button', { name: '다음 인물 소개 페이지' }).click();
    }
    for (const [chapter, phrase] of [[2, '두 사람이 그 일을 같은 마음으로'], [3, '1962년'], [4, '나빌라의 평가']] as const) {
      await page.getByRole('button', { name: new RegExp(`^${chapter}장 .* 보기$`) }).click();
      let found = false;
      for (let i = 0; i < 30; i += 1) {
        const content = await page.getByTestId('chapter-reader-panel').textContent();
        if (content?.includes(phrase)) { found = true; break; }
        const next = page.getByRole('button', { name: '다음 글 페이지' });
        if (!await next.isEnabled()) break;
        await next.click();
      }
      expect(found, `chapter ${chapter} should contain ${phrase}`).toBe(true);
    }
    await page.getByRole('button', { name: /^1장 .* 보기$/ }).click();
    await expect(page.getByTestId('result-summary-page')).toContainText('가게');
  }
});
