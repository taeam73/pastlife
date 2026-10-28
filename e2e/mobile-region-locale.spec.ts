import { expect, test } from '@playwright/test';

for (const { region, locale, label } of [
  { region: 'ko-KR', locale: 'ko', label: '나의 전생 찾아보기' },
  { region: 'th-TH', locale: 'th', label: 'ค้นพบชาติที่แล้วของฉัน' },
  { region: 'ja-JP', locale: 'ja', label: '私の前世を探す' },
  { region: 'de-DE', locale: 'en', label: 'Discover my past life' },
] as const) {
  test.describe(`${region} first launch`, () => {
    test.use({ locale: region });
    test(`starts in ${locale}`, async ({ page }) => {
      await page.goto('/');
      await expect(page.getByRole('button', { name: label })).toBeVisible();
    });
  });
}

test.describe('saved language choice', () => {
  test.use({ locale: 'th-TH' });
  test('takes priority over the device region', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('pastlife.locale.v1', 'ja'));
    await page.goto('/');
    await expect(page.getByRole('button', { name: '私の前世を探す' })).toBeVisible();
  });
});
