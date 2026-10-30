import { expect, test } from '@playwright/test';

test('keeps one scene while the four result chapters change', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '나의 전생 찾아보기' }).click();
  await page.getByRole('button', { name: '질문 시작하기' }).click();
  for (let stage = 1; stage <= 6; stage += 1) {
    await expect(page).toHaveURL(new RegExp(`/question/${stage}$`));
    await page.getByRole('button').first().click();
  }
  await expect(page).toHaveURL(/\/result$/);
  await page.getByRole('button', { name: /^1장 .* 보기$/ }).click();
  await expect(page.getByTestId('result-summary-page')).not.toBeEmpty();
  for (const viewport of [{ width: 320, height: 720 }, { width: 768, height: 1024 }]) {
    await page.setViewportSize(viewport);
    await expect(page.getByTestId('result-summary-page')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
    await expect.poll(async () => page.getByTestId('result-hero-background').locator('img').evaluate((element) => element instanceof HTMLImageElement && element.complete && element.naturalWidth > 0)).toBe(true);
    await page.screenshot({ path: `output/playwright/result-intro-${viewport.width}.png`, fullPage: true });
  }
  await page.setViewportSize({ width: 1280, height: 720 });
  await expect.poll(async () => page.getByTestId('result-hero-background').locator('img').evaluate((element) => element instanceof HTMLImageElement && element.complete && element.naturalWidth > 0)).toBe(true);
  const portrait = page.getByRole('img', { name: '전생 인물' });
  if (await portrait.count()) await expect.poll(async () => portrait.evaluate((element) => element instanceof HTMLImageElement && element.complete && element.naturalWidth > 0)).toBe(true);
  await page.screenshot({ path: 'output/playwright/result-chapter-01.png', fullPage: true });
  const scene = page.getByTestId('result-hero-background').locator('img');
  const background = await scene.getAttribute('src');
  expect(background).toBeTruthy();
  let previousChapterText = '';
  for (const number of [2, 3, 4]) {
    await page.getByRole('button', { name: new RegExp(`^${number}장 .* 보기$`) }).click();
    const reader = await page.getByTestId('chapter-reader-panel').boundingBox();
    expect(reader).not.toBeNull();
    expect(reader!.height).toBeGreaterThan(350);
    expect(reader!.y).toBeLessThan(180);
    const chapterText = await page.getByTestId('chapter-reader-panel').textContent();
    expect(chapterText).not.toBe(previousChapterText);
    previousChapterText = chapterText ?? '';
    expect(await scene.getAttribute('src')).toBe(background);
  }
  for (const viewport of [{ width: 320, height: 720 }, { width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 1024, height: 1366 }, { width: 1440, height: 900 }]) {
    await page.setViewportSize(viewport);
    await page.getByRole('button', { name: /^2장 .* 보기$/ }).click();
    await expect(page.getByTestId('chapter-reader-panel')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
    await page.screenshot({ path: `output/playwright/result-chapter-${viewport.width}.png`, fullPage: true });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  const nextPage = page.getByRole('button', { name: '다음 글 페이지' });
  if (await nextPage.count()) {
    await nextPage.click();
    await expect(page.getByText(/^2 \/ \d+$/)).toBeVisible();
  } else {
    await expect(page.getByTestId('chapter-reader-panel')).not.toBeEmpty();
  }
});
