import { expect, test } from '@playwright/test';

for (const width of [320, 768]) {
  test(`3.0 question exposes six usable choices at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 320 ? 640 : 1024 });
    await page.goto('/');
    await page.getByRole('button', { name: '나의 전생 찾아보기' }).click();
    await page.getByRole('button', { name: '질문 시작하기' }).click();
    await expect(page).toHaveURL(/\/question\/1$/);

    const choices = page.getByRole('button');
    await expect(choices).toHaveCount(6);
    await page.screenshot({ path: `output/playwright/six-choices-${width}-top.png` });
    await choices.nth(5).scrollIntoViewIfNeeded();
    await expect(choices.nth(5)).toBeVisible();
    await page.screenshot({ path: `output/playwright/six-choices-${width}-bottom.png` });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    const last = await choices.nth(5).boundingBox();
    expect(last).not.toBeNull();
    expect(last!.x).toBeGreaterThanOrEqual(0);
    expect(last!.x + last!.width).toBeLessThanOrEqual(width);
    await choices.nth(5).click();
    await expect(page).toHaveURL(/\/question\/2$/);
    await expect(page.getByRole('button')).toHaveCount(6);
  });
}
