import { expect, test } from '@playwright/test';

type Session = { sessionId: string; seed: string; contentVersion: string; viewMode: string; resultId?: string };
type Question = { id: string; choices: { id: string }[] };

test('fits every visible parchment page at phone and tablet widths', async ({ page }) => {
  test.setTimeout(120_000);
  const base = process.env.E2E_API_URL ?? 'http://127.0.0.1:4001/api/v1';
  async function call<T>(path: string, method = 'GET', body?: object): Promise<T> {
    const response = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
    expect(response.ok, `${method} ${path}`).toBe(true);
    return response.json() as Promise<T>;
  }
  const session = await call<Session>('/sessions', 'POST', { locale: 'ko', deviceId: `pagination-${Date.now()}` });
  for (let stage = 1; stage <= 6; stage++) {
    const question = await call<Question>(`/sessions/${session.sessionId}/questions/${stage}`);
    await call(`/sessions/${session.sessionId}/answers/${stage}`, 'PUT', { questionId: question.id, choiceId: question.choices[0]!.id });
  }
  const completed = await call<{ resultId: string }>(`/sessions/${session.sessionId}/complete`, 'POST');
  const result = await call<{ presentation: { chapters: { body: string }[] } }>(`/results/${completed.resultId}/basic`);
  await page.addInitScript((value) => localStorage.setItem('pastlife.session.v1', JSON.stringify(value)), { ...session, resultId: completed.resultId });

  for (const width of [320, 768]) {
    await page.setViewportSize({ width, height: width === 320 ? 720 : 1024 });
    await page.goto('/result');
    await page.getByRole('button', { name: /^1장 .* 보기$/ }).click();
    await expect(page.getByTestId('result-summary-page').getByTestId('measured-visible-page')).toBeVisible();
    await assertVisiblePageFits(page.getByTestId('result-summary-page'));
    await page.getByRole('button', { name: '다음 인물 소개 페이지' }).click();
    await assertVisiblePageFits(page.getByTestId('result-summary-page'));

    for (const chapter of [2, 3, 4]) {
      await page.getByRole('button', { name: new RegExp(`^${chapter}장 .* 보기$`) }).click();
      await expect(page.getByTestId('chapter-text-page').getByTestId('measured-visible-page')).toBeVisible();
      if (chapter === 2) {
        await expect(page.getByRole('button', { name: '다음 글 페이지' })).toBeEnabled();
        await expect(page.getByRole('button', { name: '다음 페이지' })).toBeEnabled();
        await page.getByRole('button', { name: '다음 페이지' }).click();
        await page.getByRole('button', { name: '이전 페이지' }).click();
      }
      let visibleText = '';
      for (let index = 0; index < 80; index++) {
        await assertVisiblePageFits(page.getByTestId('chapter-text-page'));
        visibleText += await page.getByTestId('chapter-text-page').getByTestId('measured-visible-page').textContent() ?? '';
        const next = page.getByRole('button', { name: '다음 글 페이지' });
        if (!await next.isEnabled()) break;
        await next.click();
      }
      if (chapter === 2) expect(visibleText.replace(/\s/gu, '')).toBe(result.presentation.chapters[1]!.body.replace(/\s/gu, ''));
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  }
});

async function assertVisiblePageFits(locator: import('@playwright/test').Locator) {
  await expect.poll(async () => locator.evaluate((element) => {
    const page = element.getBoundingClientRect();
    const content = element.querySelector('[data-testid="measured-visible-page"]')?.getBoundingClientRect();
    return Boolean(content && content.bottom <= page.bottom + 2 && content.right <= page.right + 2);
  })).toBe(true);
}
