import { expect, test } from '@playwright/test';

test('shows only icon navigation and keeps the settings reachable on small and large screens', async ({ page }) => {
  for (const width of [320, 768]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const nav = page.getByRole('tablist');
    await expect(nav.getByRole('tab')).toHaveCount(2);
    await expect(nav.getByRole('tab', { name: '메인' })).toBeVisible();
    await expect(nav.getByRole('tab', { name: '설정' })).toBeVisible();
    await expect(nav).not.toContainText('나의 전생');
    await expect(nav).not.toContainText('메인');
    await expect(nav).not.toContainText('설정');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await nav.getByRole('tab', { name: '설정' }).click();
    await expect(page).toHaveURL(/\/settings$/u);
    await expect(page.getByRole('tablist').getByRole('tab')).toHaveCount(2);
    await expect(page.getByText('계정', { exact: true })).toHaveCount(0);
  }
});
