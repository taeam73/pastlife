import { expect, test } from '@playwright/test';

test('does not show a stored 2.5 result or 2.5-only screens', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('pastlife.session.v1', JSON.stringify({
    sessionId: 'old-session', seed: 'old', contentVersion: '2.5.0', viewMode: 'TEXT', resultId: 'old-result',
  })));
  await page.goto('/result');
  await expect(page.getByText('결과 기록을 찾을 수 없습니다.')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('pastlife.session.v1'))).toBeNull();
  await page.goto('/deep');
  await expect(page).toHaveURL(/\/$/);
  await page.goto('/present-guide');
  await expect(page).toHaveURL(/\/$/);
});

test('has no archive or login route in the mobile release', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('tablist').getByRole('tab')).toHaveCount(2);
});
