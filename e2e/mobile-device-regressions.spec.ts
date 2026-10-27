import { expect, test } from '@playwright/test';

test('start artwork keeps responsive width on narrow phones and tablets', async ({ page }) => {
  for (const width of [320, 768]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/');
    const button = page.getByRole('button', { name: '나의 전생 찾아보기' });
    const box = await button.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(100);
    expect(box?.width).toBeLessThanOrEqual(width);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  }
});

test('fresh start responds immediately and final-moment back navigation keeps exports unlocked', async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/');

  const start = page.getByRole('button', { name: '나의 전생 찾아보기' });
  const startBox = await start.boundingBox();
  expect(startBox?.height).toBeGreaterThanOrEqual(80);
  await start.click();
  await expect(page).toHaveURL(/\/guide$/, { timeout: 2_000 });

  await expect(page.getByRole('button', { name: '질문 시작하기' })).toHaveCount(0);
  await page.getByRole('button', { name: '질문 시작하기' }).click();
  for (let stage = 1; stage <= 6; stage += 1) {
    await expect(page).toHaveURL(new RegExp(`/question/${stage}$`));
    await page.getByRole('button').first().click();
  }

  await expect(page).toHaveURL(/\/result$/);
  const finalMoment = page.getByRole('button', { name: /마지막 순간 보러 가기/ });
  const finalMomentBox = await finalMoment.boundingBox();
  expect(finalMomentBox?.height).toBeGreaterThanOrEqual(80);
  await finalMoment.click();
  await expect(page).toHaveURL(/\/final-moment\?resultId=/);
  await expect(page.getByText('마지막 순간 마치기')).toBeVisible();

  // Reproduce the Android hardware-back path that previously skipped the
  // explicit finish button and left sharing/download locked.
  await page.goBack();
  await expect(page).toHaveURL(/\/result$/);
  await expect(page.getByRole('button', { name: '이미지 공유' })).toBeEnabled();
  await expect(page.getByRole('button', { name: '전생기록 다운로드' })).toBeEnabled();

  await page.getByRole('button', { name: /마지막 순간 보러 가기/ }).click();
  await page.getByRole('button', { name: '마지막 순간 마치기' }).click();
  await expect(page).toHaveURL(/\/result\?showExports=1$/);
  for (const width of [320, 768]) {
    await page.setViewportSize({ width, height: 800 });
    await page.reload();
    const exportActions = page.getByTestId('result-export-actions').last();
    await expect(exportActions).toBeInViewport();
    await expect.poll(async () => {
      const box = await exportActions.boundingBox();
      return Boolean(box && box.y >= 0 && box.y + box.height <= 800);
    }).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  }
});
