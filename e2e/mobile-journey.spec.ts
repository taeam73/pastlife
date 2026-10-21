import { expect, test } from '@playwright/test';

test('completes the assessment and unlocks archive, deep, and guide results', async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto('/');

  await expect(page.getByRole('img', { name: '전생록' }).first()).toBeVisible();
  await page.getByRole('button', { name: '나의 전생 찾아보기' }).click();
  await expect(page.getByText('기억은 생각보다 먼저 반응합니다.')).toBeVisible();
  await page.getByRole('button', { name: '질문 시작하기' }).click();

  for (let stage = 1; stage <= 6; stage += 1) {
    await expect(page).toHaveURL(new RegExp(`/question/${stage}$`));
    await expect(page.getByText(`${stage}/6`, { exact: true })).toBeVisible();
    await page.getByRole('button').first().click();
  }

  await expect(page).toHaveURL(/\/result$/);
  await expect(page.getByText('당신의 전생은')).toBeVisible();
  await expect(page.getByText('나의 전생 이야기', { exact: true })).toBeVisible();
  const scene = page.getByRole('img', { name: /historical scene$/ }).first();
  const backgroundSource = await scene.getAttribute('src');
  for (const [number, title] of [[2, '시련'], [3, '선택'], [4, '그리고, 지금']] as const) {
    await page.getByRole('button', { name: `${number}장 ${title}`, exact: true }).click();
    await expect(page.getByText(`나의 전생 이야기 · ${String(number).padStart(2, '0')}`)).toBeVisible();
    await expect(page.getByLabel(`${title} 내용`)).toBeVisible();
    expect(await scene.getAttribute('src')).toBe(backgroundSource);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: '2장 시련', exact: true }).click();
  await expect(page.getByRole('button', { name: '다음 글 페이지' })).toBeVisible();
  await page.getByRole('button', { name: '다음 글 페이지' }).click();
  await expect(page.getByText('2 / 2')).toBeVisible();
  await page.setViewportSize({ width: 768, height: 1024 });
  await expect(page.getByRole('button', { name: '4장 그리고, 지금', exact: true })).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.getByRole('button', { name: '이미지 공유' })).toBeVisible();
  await expect(page.getByRole('tab', { name: '메인' })).toBeVisible();
  await expect(page.getByRole('tab', { name: '나의 전생' })).toBeVisible();
  await expect(page.getByRole('tab', { name: '설정' })).toBeVisible();

  await page.getByRole('button', { name: '아카이브에 저장하기' }).click();
  await expect(page).toHaveURL(/\/login\?resultId=/);
  await expect(page.getByText('Google 계정으로 로그인')).toBeVisible();
  await page.getByRole('button', { name: '테스트 계정으로 계속' }).click();
  await expect(page).toHaveURL(/\/archive$/);
  await expect(page.getByText(/^No\.\d{2}$/)).toBeVisible();
  await page.getByText('기록 열기').click();
  await expect(page).toHaveURL(/\/archive\/[0-9a-f-]+$/);
  await expect(page.getByText(/저장된 전생 기록 No\.\d{2}/)).toBeVisible();
  await expect(page.getByText('탄생 · 당신의 이야기가 시작된 날').last()).toBeVisible();
  await expect(page.getByRole('tab', { name: '메인' })).toBeVisible();
  await page.getByRole('button', { name: '기록 삭제' }).click();
  await expect(page.getByText('이 기록을 아카이브에서 삭제할까요? 현재 결과와 익명 판정 데이터는 삭제되지 않습니다.')).toBeVisible();
  await page.getByRole('button', { name: '삭제 확인' }).click();
  await expect(page).toHaveURL(/\/archive$/);
  await expect(page.getByText('저장된 전생 기록이 없습니다.')).toBeVisible();

  await page.goto('/result');
  await expect(page.getByText('나의 전생 이야기', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '광고 보고 더 자세히 보기' }).click();
  await expect(page).toHaveURL(/\/deep$/);
  await expect(page.getByText('더 자세한 전생 이야기', { exact: true })).toBeVisible();
  await expect(page.getByText('제3장 · 선택 뒤에 남은 대가')).toBeVisible();
  await expect(page.getByRole('tab', { name: '나의 전생' })).toBeVisible();

  await page.getByRole('button', { name: '지금의 나를 위한 팁 보기' }).click();
  await expect(page).toHaveURL(/\/present-guide$/);
  await expect(page.getByText('지금의 나를 위한 가이드', { exact: true })).toBeVisible();
  await expect(page.getByText('제3장 · 잘하는 일을 나누는 방법')).toBeVisible();
  await expect(page.getByRole('tab', { name: '설정' })).toBeVisible();

  await page.reload();
  await expect(page.getByText('지금의 나를 위한 가이드', { exact: true })).toBeVisible();

  await page.goto('/settings');
  await expect(page.getByText('e2e@example.com')).toBeVisible();
  await page.getByRole('button', { name: '로그아웃', exact: true }).click();
  await expect(page.getByText('이 기기의 로그인 정보만 삭제되며 현재 전생 결과는 유지됩니다.')).toBeVisible();
  await page.getByRole('button', { name: '로그아웃 확인' }).click();
  await expect(page.getByText('로그인하면 저장한 전생 기록을 다시 볼 수 있습니다.')).toBeVisible();

  await page.goto('/result');
  await expect(page.getByText('나의 전생 이야기', { exact: true })).toBeVisible();
});
