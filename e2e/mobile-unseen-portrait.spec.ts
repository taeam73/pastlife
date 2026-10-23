import { expect, test } from '@playwright/test';
import type { ResultCore } from '@pastlife/scoring';
import { buildContentStoryResult } from '../apps/api/src/results/story-result.js';

test('shows Doyun’s complete 01–04 life and separate portrait art on phone and tablet', async ({ page }) => {
  const backgroundUri = 'asset://stories/v3/unseen-portrait-lumi-studio-bg.jpg';
  const characterUri = 'asset://stories/v3/unseen-portrait-doyun.webp';
  const image = {
    sourceType: 'LIBRARY' as const, uri: backgroundUri, alt: '루미 초상 공방의 세 칸 그림과 초상화가 도윤',
    status: 'READY' as const, attemptCount: 0, matchQuality: 'EXACT' as const,
    layers: [
      { uri: backgroundUri, role: 'BACKGROUND' as const, alt: '파란·붉은 천과 서로 다른 시절의 미완성 초상' },
      { uri: characterUri, role: 'CHARACTER' as const, alt: '안료 묻은 앞치마를 입고 붓을 든 초상화가 도윤' },
    ],
  };
  const core = { storyId: 'UNSEEN_PORTRAIT', storySignals: ['connect'], recordNo: 1 } as ResultCore;
  const result = buildContentStoryResult('unseen-portrait-qa', core, image);
  await page.route('**/api/v1/results/*/basic', (route) => route.fulfill({ json: result }));

  await page.goto('/');
  await page.getByRole('button', { name: /나의 전생 찾아보기/ }).click();
  await page.getByRole('button', { name: /질문 시작하기/ }).click();
  for (let stage = 1; stage <= 6; stage += 1) {
    await expect(page).toHaveURL(new RegExp(`/question/${stage}$`));
    await page.getByRole('button').first().click();
  }
  await expect(page).toHaveURL(/\/result$/);
  await expect(page.getByText('도윤', { exact: true })).toBeVisible();
  await expect(page.getByText('오벨 · 화랑력 · 세하 도시연합 루미 자유시')).toBeVisible();
  const background = page.getByRole('img', { name: image.alt }).first();
  const character = page.getByRole('img', { name: '전생 인물' });
  for (const viewport of [{ width: 320, height: 720 }, { width: 768, height: 1024 }]) {
    await page.setViewportSize(viewport);
    await expect.poll(async () => background.evaluate((el) => el instanceof HTMLImageElement && el.complete && el.naturalWidth >= 1024)).toBe(true);
    await expect.poll(async () => character.evaluate((el) => el instanceof HTMLImageElement && el.complete && el.naturalWidth >= 1024)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
    await page.screenshot({ path: `output/playwright/story-unseen-portrait-${viewport.width}.png`, fullPage: true });
    for (const [chapter, phrase] of [[2, '세 칸으로 나누자고'], [3, '79세'], [4, '하리']] as const) {
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
