import { expect, test } from '@playwright/test';
import type { ResultCore } from '@pastlife/scoring';
import { buildContentStoryResult } from '../apps/api/src/results/story-result.js';

test('ends a failed result-artwork load and retries responsively', async ({ page }) => {
  const backgroundUri = 'asset://stories/v3/havana-two-games-bg.jpg';
  const characterUri = 'asset://stories/v3/havana-teresa-rojas.webp';
  const image = {
    sourceType: 'LIBRARY' as const,
    uri: backgroundUri,
    alt: '1949년 아바나의 테레사 로하스',
    status: 'READY' as const,
    attemptCount: 0,
    matchQuality: 'EXACT' as const,
    layers: [
      { uri: backgroundUri, role: 'BACKGROUND' as const, alt: '아바나의 야구장 입구' },
      { uri: characterUri, role: 'CHARACTER' as const, alt: '입장권을 든 테레사' },
    ],
  };
  const core = { storyId: 'TWO_GAMES_ONE_TICKET', storySignals: ['notice'], recordNo: 1 } as ResultCore;
  const result = buildContentStoryResult('story-artwork-retry-qa', core, image);
  await page.route('**/api/v1/results/*/basic', (route) => route.fulfill({ json: result }));

  let failArtwork = true;
  await page.route('**/assets/stories/v3/havana-two-games-bg.jpg', (route) => {
    if (failArtwork) return route.abort('failed');
    return route.continue();
  });

  await page.goto('/');
  await page.getByRole('button', { name: /나의 전생 찾아보기/ }).click();
  await page.getByRole('button', { name: /질문 시작하기/ }).click();
  for (let stage = 1; stage <= 6; stage += 1) {
    await expect(page).toHaveURL(new RegExp(`/question/${stage}$`));
    await page.getByRole('button').first().click();
  }

  await expect(page).toHaveURL(/\/result$/);
  await expect(page.getByTestId('story-artwork-error')).toBeVisible();
  await expect(page.getByText('전생의 장면을 불러오지 못했습니다. 네트워크를 확인하고 다시 시도해 주세요.')).toBeVisible();

  for (const viewport of [{ width: 320, height: 720 }, { width: 768, height: 1024 }]) {
    await page.setViewportSize(viewport);
    const retry = page.getByRole('button', { name: '그림 다시 불러오기' });
    const box = await retry.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(47.5);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
  }

  failArtwork = false;
  await page.getByRole('button', { name: '그림 다시 불러오기' }).click();
  await expect(page.getByTestId('story-artwork-error')).toHaveCount(0);
  const scene = page.getByRole('img', { name: image.alt }).first();
  await expect.poll(() => scene.evaluate((element) => element instanceof HTMLImageElement && element.complete && element.naturalWidth > 0)).toBe(true);
});
