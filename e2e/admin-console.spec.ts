import { expect, test } from '@playwright/test';

test('authenticates and manages the draft publish rollback lifecycle', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: '전생록 콘텐츠 관리자' })).toBeVisible();
  await page.getByLabel('관리자 토큰').fill('e2e-admin-token');
  await page.getByRole('button', { name: '관리자 로그인' }).click();

  await expect(page.getByText('질문 36')).toBeVisible();
  await expect(page.getByText('선택지 216')).toBeVisible();

  await page.getByRole('textbox', { name: 'Q1_01 초안', exact: true }).fill('브라우저 E2E 초안');
  await page.getByRole('button', { name: 'Q1_01 초안 저장' }).click();
  await expect(page.getByRole('status')).toContainText('Q1_01 초안 저장 완료');

  await page.getByRole('button', { name: '초안 게시' }).click();
  await expect(page.getByRole('status')).toContainText('게시 완료: 1건');
  await expect(page.getByRole('row', { name: /2\.0\.0 1/ })).toBeVisible();

  await page.getByRole('button', { name: '게시본 롤백 준비' }).first().click();
  await expect(page.getByRole('status')).toContainText('롤백 준비 완료: 1건');

  await expect(page.getByText('DRAFT_SAVED')).toBeVisible();
  await expect(page.getByText('PUBLISHED')).toBeVisible();
  await expect(page.getByText('ROLLBACK_PREPARED')).toBeVisible();
});
