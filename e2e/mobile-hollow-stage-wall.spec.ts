import { expect, test } from '@playwright/test';
import type { ResultCore } from '@pastlife/scoring';
import { buildContentStoryResult } from '../apps/api/src/results/story-result.js';

test('shows Minrok’s full life and separate stage-wall art on phone and tablet', async ({ page }) => {
  const backgroundUri = 'asset://stories/v3/hollow-stage-wall-seon-bg.jpg';
  const characterUri = 'asset://stories/v3/hollow-stage-wall-minrok.webp';
  const image = {
    sourceType: 'LIBRARY' as const, uri: backgroundUri,
    alt: '세온 극장의 숨은 문이 있는 나무 벽과 환상술사 민록',
    status: 'READY' as const, attemptCount: 0, matchQuality: 'EXACT' as const,
    layers: [
      { uri: backgroundUri, role: 'BACKGROUND' as const, alt: '붉은 리본 곁에 문틈과 경첩을 숨긴 이동식 무대 벽' },
      { uri: characterUri, role: 'CHARACTER' as const, alt: '붉은 리본을 들고 벽을 소개하는 환상술사 민록' },
    ],
  };
  const core = { storyId: 'HOLLOW_STAGE_WALL', storySignals: ['speak'], recordNo: 1 } as ResultCore;
  const result = buildContentStoryResult('hollow-stage-wall-qa', core, image);
  await page.route('**/api/v1/results/*/basic', (route) => route.fulfill({ json: result }));

  await page.goto('/');
  await page.getByRole('button', { name: /나의 전생 찾아보기/ }).click();
  await page.getByRole('button', { name: /질문 시작하기/ }).click();
  for (let stage = 1; stage <= 6; stage += 1) {
    await expect(page).toHaveURL(new RegExp(`/question/${stage}$`));
    await page.getByRole('button').first().click();
  }
  await expect(page).toHaveURL(/\/result$/);
  await expect(page.getByText('민록', { exact: true })).toBeVisible();
  await expect(page.getByText('노이르 · 막력 · 라단 순회도시연합 세온 자유시')).toBeVisible();
  const background = page.getByRole('img', { name: image.alt }).first();
  const character = page.getByRole('img', { name: '전생 인물' });
  for (const viewport of [{ width: 320, height: 720 }, { width: 768, height: 1024 }]) {
    await page.setViewportSize(viewport);
    await expect.poll(async () => background.evaluate((el) => el instanceof HTMLImageElement && el.complete && el.naturalWidth >= 1024)).toBe(true);
    await expect.poll(async () => character.evaluate((el) => el instanceof HTMLImageElement && el.complete && el.naturalWidth >= 1024)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
    await page.screenshot({ path: `output/playwright/story-hollow-stage-wall-${viewport.width}.png`, fullPage: true });
    for (const [chapter, phrase] of [[2, '문 안쪽의 경첩'], [3, '76세'], [4, '보현']] as const) {
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
