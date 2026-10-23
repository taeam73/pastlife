import { expect, test } from '@playwright/test';
import { findStoryCard, findStoryManuscript, renderStoryEpisode } from '@pastlife/content';

test('reads all four rewritten 3.0 sections at narrow width', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/');
  await page.getByRole('button', { name: '나의 전생 찾아보기' }).click();
  await page.getByRole('button', { name: '질문 시작하기' }).click();
  for (let stage = 1; stage <= 6; stage += 1) {
    await page.getByRole('button').first().click();
  }
  await expect(page.getByText('전생의 나', { exact: true }).first()).toBeVisible();
  await expect.poll(async () => page.getByTestId('result-hero-background').locator('img').evaluate((element) => element instanceof HTMLImageElement && element.complete && element.naturalWidth > 0)).toBe(true);
  const summary = page.getByTestId('result-summary-panel');
  await expect(summary).toContainText('~');
  await page.screenshot({ path: 'output/playwright/manuscript-01-320.png', fullPage: true });

  await page.getByRole('button', { name: /^2장 .* 보기$/ }).click();
  const reader = page.getByTestId('chapter-reader-panel');
  await expect(reader).toContainText('02 에피소드');
  await expect(page.getByRole('button', { name: '다음 글 페이지' })).toBeVisible();
  await page.screenshot({ path: 'output/playwright/manuscript-02-320.png', fullPage: true });

  await page.getByRole('button', { name: /^3장 .* 보기$/ }).click();
  await expect(reader).toContainText('03 삶의 기록');
  await expect(reader).toContainText('출생');
  await expect(reader).toContainText('생을 마침');
  await page.screenshot({ path: 'output/playwright/manuscript-03-320.png', fullPage: true });

  await page.getByRole('button', { name: /^4장 .* 보기$/ }).click();
  await expect(reader).toContainText('04 전생의 기억');
  const fitsPage = () => reader.getByTestId('chapter-text-page').evaluate((element) => {
    const pageRect = element.getBoundingClientRect();
    const textRect = element.firstElementChild?.getBoundingClientRect();
    return Boolean(textRect && textRect.left >= pageRect.left && textRect.right <= pageRect.right && textRect.bottom <= pageRect.bottom);
  });
  expect(await fitsPage()).toBe(true);
  await page.screenshot({ path: 'output/playwright/manuscript-04-320.png', fullPage: true });
  const memoryPageCount = await reader.getByText(/^1 \/ \d+$/).textContent();
  const memoryPages = Number(memoryPageCount?.split(' / ')[1] ?? 1);
  for (let index = 1; index < memoryPages; index += 1) await page.getByRole('button', { name: '다음 글 페이지' }).click();
  await expect(reader).toContainText('평가');
  expect(await fitsPage()).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  await page.setViewportSize({ width: 768, height: 1024 });
  await expect(reader).toContainText('04 전생의 기억');
  expect(await fitsPage()).toBe(true);
  await page.screenshot({ path: 'output/playwright/manuscript-04-768.png', fullPage: true });
  await page.getByRole('button', { name: /^3장 .* 보기$/ }).click();
  await expect(reader).toContainText('03 삶의 기록');
  await page.screenshot({ path: 'output/playwright/manuscript-03-768.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(768);
});

test('keeps the longest Orr episode readable through its last page', async ({ page }) => {
  const card = findStoryCard('DRAGON_DREAM')!;
  const manuscript = findStoryManuscript(card.id)!;
  await page.route('**/api/v1/results/*/basic', async (route) => {
    const response = await route.fetch();
    const body = await response.json();
    body.presentation.chapters[1].body = renderStoryEpisode(manuscript, card.signals[0]!);
    await route.fulfill({ response, json: body });
  });
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/');
  await page.getByRole('button', { name: '나의 전생 찾아보기' }).click();
  await page.getByRole('button', { name: '질문 시작하기' }).click();
  for (let stage = 1; stage <= 6; stage += 1) await page.getByRole('button').first().click();
  await page.getByRole('button', { name: /^2장 .* 보기$/ }).click();
  const reader = page.getByTestId('chapter-reader-panel');
  const pageCount = page.getByText(/^1 \/ \d+$/);
  await expect(pageCount).toBeVisible();
  const total = Number((await pageCount.textContent())?.split(' / ')[1]);
  expect(total).toBeGreaterThan(8);
  await page.screenshot({ path: 'output/playwright/manuscript-orr-first-320.png', fullPage: true });
  for (let index = 1; index < total; index += 1) await page.getByRole('button', { name: '다음 글 페이지' }).click();
  await expect(page.getByText(`${total} / ${total}`)).toBeVisible();
  await expect(reader.getByTestId('chapter-text-page')).toContainText('훗날 사람들은 오르를');
  const lastPageFits = await reader.getByTestId('chapter-text-page').evaluate((element) => {
    const pageRect = element.getBoundingClientRect();
    const textRect = element.firstElementChild?.getBoundingClientRect();
    return Boolean(textRect && textRect.left >= pageRect.left && textRect.right <= pageRect.right && textRect.bottom <= pageRect.bottom);
  });
  expect(lastPageFits).toBe(true);
  await page.screenshot({ path: 'output/playwright/manuscript-orr-last-320.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  await page.setViewportSize({ width: 768, height: 1024 });
  await expect(reader.getByTestId('chapter-text-page')).toContainText('훗날 사람들은 오르를');
  await page.screenshot({ path: 'output/playwright/manuscript-orr-last-768.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(768);
});
