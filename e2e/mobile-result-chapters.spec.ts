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
  await expect(page.getByText('당신의 전생은')).toBeVisible();
  await expect.poll(async () => page.getByRole('img', { name: /historical scene$/ }).first().evaluate((element) => element instanceof HTMLImageElement && element.complete && element.naturalWidth > 0)).toBe(true);
  const portrait = page.getByRole('img', { name: '전생 인물' });
  if (await portrait.count()) await expect.poll(async () => portrait.evaluate((element) => element instanceof HTMLImageElement && element.complete && element.naturalWidth > 0)).toBe(true);
  await page.screenshot({ path: 'output/playwright/result-chapter-01.png', fullPage: true });
  const scene = page.getByRole('img', { name: /historical scene$/ }).first();
  const background = await scene.getAttribute('src');
  expect(background).toBeTruthy();
  for (const [number, title] of [[2, '시련'], [3, '선택'], [4, '그리고, 지금']] as const) {
    await page.getByRole('button', { name: `${number}장 ${title}`, exact: true }).click();
    await expect(page.getByLabel(`${title} 내용`)).toBeVisible();
    const reader = await page.getByTestId('chapter-reader-panel').boundingBox();
    expect(reader).not.toBeNull();
    expect(reader!.height).toBeGreaterThan(350);
    expect(reader!.y).toBeLessThan(180);
    expect(await scene.getAttribute('src')).toBe(background);
  }
  for (const viewport of [{ width: 320, height: 720 }, { width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 1024, height: 1366 }, { width: 1440, height: 900 }]) {
    await page.setViewportSize(viewport);
    await page.getByRole('button', { name: '2장 시련', exact: true }).click();
    await expect(page.getByLabel('시련 내용')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
    await page.screenshot({ path: `output/playwright/result-chapter-${viewport.width}.png`, fullPage: true });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('button', { name: '다음 글 페이지' })).toBeVisible();
  await page.getByRole('button', { name: '다음 글 페이지' }).click();
  await expect(page.getByText('2 / 2')).toBeVisible();
});
