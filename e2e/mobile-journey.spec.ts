import { expect, test } from '@playwright/test';

test('completes the assessment and unlocks archive, deep, and guide results', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('전생록', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '나의 전생 찾아보기' }).click();
  await expect(page.getByText('기억은 생각보다 먼저 반응합니다.')).toBeVisible();
  await page.getByRole('button', { name: '질문 시작하기' }).click();

  for (let stage = 1; stage <= 6; stage += 1) {
    await expect(page).toHaveURL(new RegExp(`/question/${stage}$`));
    await expect(page.getByText(`${stage}/6`, { exact: true })).toBeVisible();
    await page.getByRole('button').first().click();
  }

  await expect(page).toHaveURL(/\/result$/);
  await expect(page.getByText(/전생 기록 No\.\d{2}/)).toBeVisible();
  await expect(page.getByRole('tab', { name: '이미지와 텍스트' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tab', { name: /영상으로 보기/ })).toBeDisabled();
  await expect(page.getByText('당신의 전생 이야기')).toBeVisible();
  await expect(page.getByText(/당신의 \d+번째 전생은/)).toBeVisible();
  await expect(page.getByText('탄생 · 세상에 처음 닿은 날')).toBeVisible();
  await expect(page.getByText('죽음 · 마지막으로 떠오른 장면')).toBeVisible();
  await expect(page.getByText('이 삶에서 가장 깊게 남은 것들')).toBeVisible();
  await expect(page.getByText('가장 중요한 인연')).toBeVisible();
  await expect(page.getByText(/창작 스토리텔링입니다/)).toBeVisible();
  await expect(page.getByRole('button', { name: '영상 공유 · 출시 예정' })).toBeDisabled();
  await expect(page.getByRole('button', { name: '이미지 공유' })).toBeVisible();

  await page.getByRole('button', { name: '아카이브에 저장하기' }).click();
  await expect(page).toHaveURL(/\/login\?resultId=/);
  await expect(page.getByText('Google 계정으로 로그인')).toBeVisible();
  await page.getByRole('button', { name: '테스트 계정으로 계속' }).click();
  await expect(page).toHaveURL(/\/archive$/);
  await expect(page.getByText(/^No\.\d{2}$/)).toBeVisible();
  await page.getByText('기록 열기').click();
  await expect(page).toHaveURL(/\/archive\/[0-9a-f-]+$/);
  await expect(page.getByText(/저장된 전생 기록 No\.\d{2}/)).toBeVisible();
  await expect(page.getByText('탄생 · 세상에 처음 닿은 날')).toBeVisible();
  await page.getByRole('button', { name: '기록 삭제' }).click();
  await expect(page.getByText('이 기록을 아카이브에서 삭제할까요? 현재 결과와 익명 판정 데이터는 삭제되지 않습니다.')).toBeVisible();
  await page.getByRole('button', { name: '삭제 확인' }).click();
  await expect(page).toHaveURL(/\/archive$/);
  await expect(page.getByText('저장된 전생 기록이 없습니다.')).toBeVisible();

  await page.goto('/result');
  await expect(page.getByText(/전생 기록 No\.\d{2}/)).toBeVisible();
  await page.getByRole('button', { name: '광고 시청 후 심화 보기' }).click();
  await expect(page).toHaveURL(/\/deep$/);
  await expect(page.getByText('심화 내용', { exact: true })).toBeVisible();
  await expect(page.getByText('운명의 갈림길')).toBeVisible();

  await page.getByRole('button', { name: '현생 가이드 보기' }).click();
  await expect(page).toHaveURL(/\/present-guide$/);
  await expect(page.getByText('현생 가이드', { exact: true })).toBeVisible();
  await expect(page.getByText('일과 재능')).toBeVisible();

  await page.reload();
  await expect(page.getByText('현생 가이드', { exact: true })).toBeVisible();

  await page.goto('/settings');
  await expect(page.getByText('e2e@example.com')).toBeVisible();
  await page.getByRole('button', { name: '로그아웃', exact: true }).click();
  await expect(page.getByText('이 기기의 로그인 정보만 삭제되며 현재 전생 결과는 유지됩니다.')).toBeVisible();
  await page.getByRole('button', { name: '로그아웃 확인' }).click();
  await expect(page.getByText('로그인하면 저장한 전생 기록을 다시 볼 수 있습니다.')).toBeVisible();

  await page.goto('/result');
  await expect(page.getByText(/전생 기록 No\.\d{2}/)).toBeVisible();
});
