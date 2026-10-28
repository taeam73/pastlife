import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { calculateResult } from '../packages/scoring/src/result';

type Session = { sessionId: string; seed: string; contentVersion: string; viewMode: string };
type Question = { id: string; text: string; choices: { id: string; text: string }[] };

test('runs Thai questions, the CLOWN story, final moment, and PDF preview', async ({ page }) => {
  test.setTimeout(180_000);
  const base = process.env.E2E_API_URL ?? 'http://127.0.0.1:4001/api/v1';
  async function call<T>(path: string, method = 'GET', body?: object): Promise<T> {
    const response = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
    expect(response.ok, `${method} ${path}`).toBe(true);
    return response.json() as Promise<T>;
  }
  let session: Session | undefined;
  let selected: number[] | undefined;
  let questions: Question[] = [];
  for (let attempt = 1; attempt <= 20 && !selected; attempt++) {
    session = await call<Session>('/sessions', 'POST', { locale: 'th', deviceId: `thai-flow-${attempt}-${Date.now()}` });
    questions = [];
    for (let stage = 1; stage <= 6; stage++) {
      const question = await call<Question>(`/sessions/${session.sessionId}/questions/${stage}`);
      expect(question.text).toMatch(/[ก-๙]/u);
      expect(JSON.stringify(question)).not.toMatch(/[가-힣]/u);
      questions.push(question);
    }
    for (let number = 0; number < 46656; number++) {
      let cursor = number;
      const indices = Array.from({ length: 6 }, () => { const value = cursor % 6; cursor = Math.floor(cursor / 6); return value; });
      const answers = questions.map((question, index) => ({ stage: (index + 1) as 1 | 2 | 3 | 4 | 5 | 6, questionId: question.id, choiceId: question.choices[indices[index]!]!.id }));
      const core = calculateResult({ answers, contentVersion: '3.0.0' });
      const signals = core.storySignals ?? [];
      if (core.storyId === 'CLOWN' && signals.filter((signal) => signal === 'speak').length >= Math.max(signals.filter((signal) => signal === 'connect').length, signals.filter((signal) => signal === 'release').length)) { selected = indices; break; }
    }
  }
  expect(session).toBeDefined();
  expect(selected).toBeDefined();
  await page.addInitScript((value) => {
    localStorage.setItem('pastlife.session.v1', JSON.stringify(value));
    localStorage.setItem('pastlife.locale.v1', 'th');
    localStorage.setItem('pastlife.preferences.v1', JSON.stringify({ bgmEnabled: false, effectsEnabled: false, reduceMotion: true }));
  }, session!);
  await mkdir('output/thai-pagination', { recursive: true });
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/');
  await expect(page.getByText('ค้นพบชาติที่แล้วของฉัน')).toBeVisible();
  expect(await page.locator('body').innerText()).not.toMatch(/[가-힣]/u);
  await page.getByRole('tab', { name: 'ตั้งค่า' }).click();
  await expect(page.getByRole('button', { name: /ไทย$/u })).toBeVisible();
  expect(await page.locator('body').innerText()).not.toMatch(/[가-힣]/u);
  await page.goto('/guide');
  await page.getByText('เริ่มตอบคำถาม').click();
  for (let index = 0; index < 6; index++) {
    await expect(page.getByText(questions[index]!.text)).toBeVisible();
    expect(await page.locator('body').innerText()).not.toMatch(/[가-힣]/u);
    await page.getByRole('button', { name: questions[index]!.choices[selected![index]!]!.text }).click();
  }
  await expect(page.getByText('เรื่องราวชาติที่แล้วของฉัน')).toBeVisible({ timeout: 40_000 });
  expect(await page.locator('body').innerText()).not.toMatch(/[가-힣]/u);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  await page.screenshot({ path: 'output/thai-pagination/result-320.png', fullPage: true });
  const resultId = await page.evaluate(() => JSON.parse(localStorage.getItem('pastlife.session.v1') ?? '{}').resultId as string);
  const result = await call<{ presentation: { chapters: { body: string; profilePages?: { title: string; body: string }[] }[] } }>(`/results/${resultId}/basic`);
  for (const width of [320, 768]) {
    await page.setViewportSize({ width, height: width === 320 ? 720 : 1024 });
    for (const [index, expected] of result.presentation.chapters.entries()) {
      await page.getByRole('button', { name: new RegExp(`^ดูบทที่ ${index + 1}:`) }).click();
      const frame = page.getByTestId(index === 0 ? 'result-summary-page' : 'chapter-text-page');
      await expect(frame.getByTestId('measured-visible-page')).toBeVisible();
      let visible = '';
      for (let pageIndex = 0; pageIndex < 90; pageIndex++) {
        await assertPageFits(frame);
        visible += await frame.getByTestId('measured-visible-page').textContent() ?? '';
        const next = page.getByRole('button', { name: index === 0 ? 'หน้าข้อมูลตัวละครถัดไป' : 'หน้าเรื่องถัดไป' });
        if (!await next.isEnabled()) break;
        await next.click();
      }
      const sources = index === 0 ? expected.profilePages?.map((item) => item.body) ?? [expected.body] : [expected.body];
      const bodyText = (expected.profilePages ?? []).reduce((text, profile) => text.replaceAll(compact(profile.title), ''), compact(visible));
      for (const source of sources) expect(bodyText).toContain(compact(source));
      expect(visible).not.toMatch(/[가-힣]/u);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    if (width === 768) await page.screenshot({ path: 'output/thai-pagination/result-768.png', fullPage: true });
  }
  await page.getByRole('button', { name: 'ดูโฆษณาเพื่ออ่านช่วงสุดท้าย' }).click();
  await expect(page).toHaveURL(/\/final-moment$/u);
  await expect(page.getByText('ช่วงสุดท้าย', { exact: true })).toBeVisible();
  expect(await page.locator('body').innerText()).not.toMatch(/[가-힣]/u);
  await page.screenshot({ path: 'output/thai-pagination/final-moment-320.png', fullPage: true });
  await page.getByRole('button', { name: 'อ่านช่วงสุดท้ายจบ' }).click();
  const pdfDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'ดาวน์โหลด PDF' }).click();
  const pdf = await pdfDownload;
  expect(pdf.suggestedFilename()).toMatch(/^past-life-record.*\.pdf$/u);
  await pdf.saveAs('output/thai-pagination/clown-th.pdf');
  const imageDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'แชร์ภาพ' }).click();
  const image = await imageDownload;
  expect(image.suggestedFilename()).toMatch(/^past-life-archive.*\.png$/u);
  await image.saveAs('output/thai-pagination/clown-th-share.png');
  await expect(page.getByRole('button', { name: 'บันทึกในคลัง' })).toHaveCount(0);
  expect(await page.locator('body').innerText()).not.toMatch(/[가-힣]/u);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(768);
});

function compact(value: string) { return value.replace(/[\s·]/gu, ''); }

async function assertPageFits(locator: import('@playwright/test').Locator) {
  await expect.poll(async () => locator.evaluate((element) => {
    const frame = element.getBoundingClientRect();
    const content = element.querySelector('[data-testid="measured-visible-page"]')?.getBoundingClientRect();
    return Boolean(content && content.bottom <= frame.bottom + 2 && content.right <= frame.right + 2);
  })).toBe(true);
}
