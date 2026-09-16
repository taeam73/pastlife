import { expect, test } from '@playwright/test';

test('completes the assessment and unlocks archive, deep, and guide results', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('전생록', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '내 전생 찾아보기' }).click();
  await expect(page.getByText('기억은 생각보다 먼저 반응합니다.')).toBeVisible();
  await page.getByRole('button', { name: '질문 시작하기' }).click();

  for (let stage = 1; stage <= 6; stage += 1) {
    await expect(page).toHaveURL(new RegExp(`/question/${stage}$`));
    await expect(page.getByText(`${stage}/6`, { exact: true })).toBeVisible();
    await page.getByRole('button').first().click();
  }

  await expect(page).toHaveURL(/\/result$/);
  await expect(page.getByText(/전생 기록 No\.\d{2}/)).toBeVisible();
  await expect(page.getByText('나는 어떤 사람이었는가')).toBeVisible();
  await expect(page.getByText('현생에 남은 흔적')).toBeVisible();
  await expect(page.getByText(/창작 스토리텔링입니다/)).toBeVisible();
  await expect(page.getByRole('button', { name: '결과 공유하기' })).toBeVisible();

  await page.getByRole('button', { name: '아카이브에 저장하기' }).click();
  await expect(page).toHaveURL(/\/login\?resultId=/);
  await expect(page.getByText('Google 계정으로 로그인')).toBeVisible();
  await page.getByRole('button', { name: '테스트 계정으로 계속' }).click();
  await expect(page).toHaveURL(/\/archive$/);
  await expect(page.getByText('나의 아카이브')).toBeVisible();
  await expect(page.getByText(/^No\.\d{2}$/)).toBeVisible();

  await page.goto('/result');
  await expect(page.getByText(/전생 기록 No\.\d{2}/)).toBeVisible();
  await page.getByRole('button', { name: '광고 보고 심화 내용 보기' }).click();
  await expect(page).toHaveURL(/\/deep$/);
  await expect(page.getByText('심화 내용', { exact: true })).toBeVisible();
  await expect(page.getByText('운명의 갈림길')).toBeVisible();

  await page.getByRole('button', { name: '광고 보고 현생 가이드 보기' }).click();
  await expect(page).toHaveURL(/\/present-guide$/);
  await expect(page.getByText('현생 가이드', { exact: true })).toBeVisible();
  await expect(page.getByText('일과 재능')).toBeVisible();

  await page.reload();
  await expect(page.getByText('현생 가이드', { exact: true })).toBeVisible();
});
