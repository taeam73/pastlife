import { expect, test } from '@playwright/test';
import type { ResultCore } from '@pastlife/scoring';
import { buildContentStoryResult } from '../apps/api/src/results/story-result.js';

test('shows Halil’s life and ferry encounter on phone and tablet', async ({ page }) => {
  const backgroundUri = 'asset://stories/v3/ottoman-besiktas-ferry-bg.jpg';
  const characterUri = 'asset://stories/v3/ottoman-halil.webp';
  const image = {
    sourceType: 'LIBRARY' as const, uri: backgroundUri,
    alt: '1892년 오스만 제국 이스탄불의 할릴',
    status: 'READY' as const, attemptCount: 0, matchQuality: 'EXACT' as const,
    layers: [
      { uri: backgroundUri, role: 'BACKGROUND' as const, alt: '보스포루스 선착장과 증기선' },
      { uri: characterUri, role: 'CHARACTER' as const, alt: '대패와 쪽지를 든 할릴' },
    ],
  };
  const core = { storyId: 'PIER_BEFORE_WORK', storySignals: ['speak'], recordNo: 1 } as ResultCore;
  const result = buildContentStoryResult('pier-before-work-qa', core, image);
  await page.route('**/api/v1/results/*/basic', (route) => route.fulfill({ json: result }));

  await page.goto('/');
  await page.getByRole('button', { name: /나의 전생 찾아보기/ }).click();
  await page.getByRole('button', { name: /질문 시작하기/ }).click();
  for (let stage = 1; stage <= 6; stage += 1) {
    await expect(page).toHaveURL(new RegExp(`/question/${stage}$`));
    await page.getByRole('button').first().click();
  }
  await expect(page).toHaveURL(/\/result$/);
  await expect(page.getByText('할릴', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '다음 페이지' }).click();

  for (const viewport of [{ width: 320, height: 720 }, { width: 768, height: 1024 }]) {
    await page.setViewportSize(viewport);
    const background = page.getByTestId('result-hero-background').locator('img');
    await expect(background).toBeVisible();
    await expect(page.getByTestId('result-summary-page')).toContainText('이야기를 열며');
    await expect(page.getByTestId('result-summary-page')).toContainText('이제 옆으로 넘겨');
    await page.getByRole('button', { name: '다음 인물 소개 페이지' }).click();
    for (const [pageIndex, phrase] of ['할릴', '성격', '아낀 것'].entries()) {
      await expect(page.getByTestId('result-summary-page')).toContainText(phrase);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
      await page.screenshot({ path: `output/playwright/story-pier-before-work-${viewport.width}-${pageIndex + 1}.png`, fullPage: true });
      if (pageIndex < 2) await page.getByRole('button', { name: '다음 인물 소개 페이지' }).click();
    }
    for (const chapter of [2, 3, 4] as const) {
      await page.getByRole('button', { name: new RegExp(`^${chapter}장 .* 보기$`) }).click();
      await expect(page.getByTestId('chapter-reader-panel')).toBeVisible();
      expect((await page.getByTestId('chapter-reader-panel').textContent())?.trim().length).toBeGreaterThan(30);
    }
    await page.getByRole('button', { name: /^1장 .* 보기$/ }).click();
    await expect(page.getByTestId('result-summary-page')).toContainText('이야기를 열며');
  }
});
