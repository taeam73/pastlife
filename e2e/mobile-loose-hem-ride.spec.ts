import { expect, test } from '@playwright/test';
import type { ResultCore } from '@pastlife/scoring';
import { buildContentStoryResult } from '../apps/api/src/results/story-result.js';

test('shows Mabel’s Melbourne life and dressmaking episode on phone and tablet', async ({ page }) => {
  const backgroundUri = 'asset://stories/v3/loose-hem-melbourne-bg.jpg';
  const characterUri = 'asset://stories/v3/loose-hem-mabel.webp';
  const image = {
    sourceType: 'LIBRARY' as const, uri: backgroundUri,
    alt: '1897년 멜버른 재단실과 양재사 메이벨',
    status: 'READY' as const, attemptCount: 0, matchQuality: 'EXACT' as const,
    layers: [
      { uri: backgroundUri, role: 'BACKGROUND' as const, alt: '자전거와 청록색 치마가 놓인 멜버른 재단실' },
      { uri: characterUri, role: 'CHARACTER' as const, alt: '재단 가위와 치맛단을 든 메이벨 코너' },
    ],
  };
  const core = { storyId: 'LOOSE_HEM_RIDE', storySignals: ['notice'], recordNo: 1 } as ResultCore;
  const result = buildContentStoryResult('loose-hem-qa', core, image);
  await page.route('**/api/v1/results/*/basic', (route) => route.fulfill({ json: result }));

  await page.goto('/');
  await page.getByRole('button', { name: /나의 전생 찾아보기/ }).click();
  await page.getByRole('button', { name: /질문 시작하기/ }).click();
  for (let stage = 1; stage <= 6; stage += 1) {
    await expect(page).toHaveURL(new RegExp(`/question/${stage}$`));
    await page.getByRole('button').first().click();
  }
  await expect(page).toHaveURL(/\/result$/);
  await expect(page.getByText('메이벨 코너', { exact: true })).toBeVisible();

  for (const viewport of [{ width: 320, height: 720 }, { width: 768, height: 1024 }]) {
    await page.setViewportSize(viewport);
    const background = page.getByTestId('result-hero-background').locator('img');
    const character = page.getByRole('img', { name: '전생 인물' });
    await expect.poll(() => background.evaluate((el) => el instanceof HTMLImageElement && el.complete && el.naturalWidth >= 1024)).toBe(true);
    await expect.poll(() => character.evaluate((el) => el instanceof HTMLImageElement && el.complete && el.naturalWidth >= 1024)).toBe(true);
    for (const [pageIndex, phrase] of ['두 아이를 키웠고', '손님 앞에서는', '재단 가위'].entries()) {
      const summary = page.getByTestId('result-summary-page');
      await expect(summary).toContainText(phrase);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
      const quote = await page.getByTestId('result-signature-quote').boundingBox();
      const panel = await page.getByTestId('result-summary-panel').boundingBox();
      expect(quote!.y + quote!.height).toBeLessThan(panel!.y);
      await page.screenshot({ path: `output/playwright/story-loose-hem-${viewport.width}-${pageIndex + 1}.png`, fullPage: true });
      if (pageIndex < 2) await page.getByRole('button', { name: '다음 인물 소개 페이지' }).click();
    }
    for (const [chapter, phrase] of [[2, '치맛단'], [3, '1943년'], [4, '메리의 평가']] as const) {
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
    await expect(page.getByTestId('result-summary-page')).toContainText('두 아이를 키웠고');
  }
});
