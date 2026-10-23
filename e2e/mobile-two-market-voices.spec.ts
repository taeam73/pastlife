import { expect, test } from '@playwright/test';
import type { ResultCore } from '@pastlife/scoring';
import { buildContentStoryResult } from '../apps/api/src/results/story-result.js';

test('shows Benta’s full Recife life and market episode on phone and tablet', async ({ page }) => {
  const backgroundUri = 'asset://stories/v3/two-market-voices-recife-bg-v2.jpg';
  const characterUri = 'asset://stories/v3/two-market-voices-benta.webp';
  const image = {
    sourceType: 'LIBRARY' as const, uri: backgroundUri,
    alt: '1906년 브라질 공화국 헤시피 과일 장수 벤타',
    status: 'READY' as const, attemptCount: 0, matchQuality: 'EXACT' as const,
    layers: [
      { uri: backgroundUri, role: 'BACKGROUND' as const, alt: '상 주제 시장의 과일과 생선 매대' },
      { uri: characterUri, role: 'CHARACTER' as const, alt: '석판을 든 벤타' },
    ],
  };
  const core = { storyId: 'TWO_MARKET_VOICES', storySignals: ['speak'], recordNo: 1 } as ResultCore;
  const result = buildContentStoryResult('two-market-voices-qa', core, image);
  await page.route('**/api/v1/results/*/basic', (route) => route.fulfill({ json: result }));

  await page.goto('/');
  await page.getByRole('button', { name: /나의 전생 찾아보기/ }).click();
  await page.getByRole('button', { name: /질문 시작하기/ }).click();
  for (let stage = 1; stage <= 6; stage += 1) {
    await expect(page).toHaveURL(new RegExp(`/question/${stage}$`));
    await page.getByRole('button').first().click();
  }
  await expect(page).toHaveURL(/\/result$/);
  await expect(page.getByText('벤타', { exact: true })).toBeVisible();

  for (const viewport of [{ width: 320, height: 720 }, { width: 768, height: 1024 }]) {
    await page.setViewportSize(viewport);
    const background = page.getByTestId('result-hero-background').locator('img');
    const character = page.getByRole('img', { name: '전생 인물' });
    await expect.poll(() => background.evaluate((el) => el instanceof HTMLImageElement && el.complete && el.naturalWidth >= 1024)).toBe(true);
    await expect.poll(() => character.evaluate((el) => el instanceof HTMLImageElement && el.complete && el.naturalWidth >= 1024)).toBe(true);
    for (const [pageIndex, phrase] of ['과일', '성격', '아낀 것'].entries()) {
      const summary = page.getByTestId('result-summary-page');
      await expect(summary).toContainText(phrase);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
      const quote = await page.getByTestId('result-signature-quote').boundingBox();
      const panel = await page.getByTestId('result-summary-panel').boundingBox();
      expect(quote!.y + quote!.height).toBeLessThan(panel!.y);
      await page.screenshot({ path: `output/playwright/story-two-market-voices-${viewport.width}-${pageIndex + 1}.png`, fullPage: true });
      if (pageIndex < 2) await page.getByRole('button', { name: '다음 인물 소개 페이지' }).click();
    }
    for (const [chapter, phrase] of [[2, '제카가 큰 소리로 잘못 부른 망고 값'], [3, '1937년'], [4, '제카의 평가']] as const) {
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
    await expect(page.getByTestId('result-summary-page')).toContainText('과일');
  }
});
