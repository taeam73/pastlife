import { expect, test } from '@playwright/test';

test('shows the complete parchment page after a tap during the line reveal', async ({ page }) => {
  test.setTimeout(90_000);
  await page.addInitScript(() => {
    localStorage.setItem('pastlife.preferences.v1', JSON.stringify({ bgmEnabled: false, effectsEnabled: false, reduceMotion: false }));
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: '나의 전생 찾아보기' }).click();
  await page.getByRole('button', { name: '질문 시작하기' }).click();
  for (let stage = 1; stage <= 6; stage += 1) {
    await expect(page).toHaveURL(new RegExp(`/question/${stage}$`));
    await page.getByRole('button').first().click();
  }
  await expect(page).toHaveURL(/\/result$/);
  await page.getByRole('button', { name: /^2장 .* 보기$/ }).click();
  const reader = page.getByTestId('chapter-reader-panel');
  await expect(reader).toBeVisible();
  const reveal = reader.getByTestId('parchment-line-reveal');
  await expect(reveal).toBeVisible();
  await reveal.click();
  await expect(reader.getByTestId('measured-visible-page')).toBeVisible();
  expect((await reveal.textContent())?.trim().length).toBeGreaterThan(50);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});
