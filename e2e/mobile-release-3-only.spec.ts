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

test('opens an archived 3.0 result with its cover and chapters', async ({ page }) => {
  test.setTimeout(90_000);
  const base = process.env.E2E_API_URL ?? 'http://127.0.0.1:4001/api/v1';
  async function call<T>(path: string, method = 'GET', body?: object): Promise<T> {
    const response = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
    expect(response.ok, `${method} ${path}`).toBe(true);
    return response.json() as Promise<T>;
  }
  const session = await call<{ sessionId: string; seed: string; contentVersion: string; viewMode: string }>('/sessions', 'POST', { locale: 'ko', deviceId: `archive-3-${Date.now()}` });
  expect(session.contentVersion).toBe('3.0.0');
  for (let stage = 1; stage <= 6; stage++) {
    const question = await call<{ id: string; choices: { id: string }[] }>(`/sessions/${session.sessionId}/questions/${stage}`);
    await call(`/sessions/${session.sessionId}/answers/${stage}`, 'PUT', { questionId: question.id, choiceId: question.choices[0]!.id });
  }
  const completed = await call<{ resultId: string }>(`/sessions/${session.sessionId}/complete`, 'POST');
  await page.addInitScript((value) => localStorage.setItem('pastlife.session.v1', JSON.stringify(value)), { ...session, resultId: completed.resultId });
  await page.goto('/result');
  await expect(page.getByRole('button', { name: '표지 보기' })).toBeVisible();
  await page.getByRole('button', { name: '아카이브에 저장하기' }).click();
  await page.getByRole('button', { name: '테스트 계정으로 계속' }).click();
  await expect(page).toHaveURL(/\/archive$/);
  await page.getByText('기록 열기').click();
  await expect(page).toHaveURL(/\/archive\//);
  await expect(page.getByRole('button', { name: '표지 보기' })).toBeVisible();
  await expect(page.getByRole('button', { name: /^1장 .* 보기$/ })).toBeVisible();
});
