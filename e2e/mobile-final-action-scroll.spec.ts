import { expect, test } from '@playwright/test';

test('centers the final moment action when the end hint is tapped', async ({ page }) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: '나의 전생 찾아보기' }).click();
  await page.getByRole('button', { name: '질문 시작하기' }).click();
  for (let stage = 1; stage <= 6; stage += 1) {
    await expect(page).toHaveURL(new RegExp(`/question/${stage}$`));
    await page.getByRole('button').first().click();
  }
  await expect(page).toHaveURL(/\/result$/);
  await page.getByRole('button', { name: /^4장 .* 보기$/ }).click();
  const next = page.getByRole('button', { name: '다음 페이지' });
  for (let index = 0; index < 10 && await next.isEnabled(); index += 1) await next.click();
  const hint = page.getByRole('button', { name: '마지막 순간 보기 버튼으로 이동' });
  await expect(hint).toBeVisible();
  await hint.click();
  const action = page.getByRole('button', { name: /마지막 순간 보러 가기/ });
  await expect.poll(async () => {
    const box = await action.boundingBox();
    return box ? Math.abs(box.y + box.height / 2 - 844 / 2) : Infinity;
  }).toBeLessThan(50);
});
