import { expect, test } from '@playwright/test';

test('changes and keeps the selected language when session sync is temporarily offline', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '나의 전생 찾아보기' }).click();
  await expect(page.getByRole('button', { name: '질문 시작하기' })).toBeVisible();

  await page.route('**/sessions/*/locale', (route) => route.abort('internetdisconnected'));
  await page.goto('/settings');
  await page.getByRole('button', { name: 'English' }).click();

  await expect(page.getByText('Settings', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: '✓ English' })).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);

  await page.reload();
  await expect(page.getByText('Settings', { exact: true })).toBeVisible();

  await page.unroute('**/sessions/*/locale');
  await page.goto('/guide');
  await expect(page.getByRole('button', { name: 'Start the questions' })).toBeVisible();
});
