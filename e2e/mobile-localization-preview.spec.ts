import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { calculateResult } from '../packages/scoring/src/result';

type Session = { sessionId: string; seed: string; contentVersion: string; viewMode: string };
type Question = { id: string; text: string; choices: { id: string; text: string }[] };

test('runs an English preview from guide through six questions and the CLOWN story', async ({ page }) => {
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
    session = await call<Session>('/sessions', 'POST', { locale: 'en', deviceId: `english-flow-${attempt}-${Date.now()}` });
    questions = [];
    for (let stage = 1; stage <= 6; stage++) {
      const question = await call<Question>(`/sessions/${session.sessionId}/questions/${stage}`);
      expect(question.text).not.toMatch(/[가-힣]/u);
      question.choices.forEach((choice) => expect(choice.text).not.toMatch(/[가-힣]/u));
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
    localStorage.setItem('pastlife.locale.v1', 'en');
    localStorage.setItem('pastlife.preferences.v1', JSON.stringify({ bgmEnabled: false, effectsEnabled: false, reduceMotion: true }));
  }, session!);
  await mkdir('output/english-pagination', { recursive: true });
  for (const width of [320]) {
    await page.setViewportSize({ width, height: width === 320 ? 720 : 1024 });
    await page.goto('/');
    await expect(page.getByText('Discover my past life')).toBeVisible();
    expect(await page.locator('body').innerText()).not.toMatch(/[가-힣]/u);
    await page.getByRole('tab', { name: 'Settings' }).click();
    await expect(page.getByText('Language')).toBeVisible();
    await expect(page.getByRole('button', { name: /English$/u })).toBeVisible();
    expect(await page.locator('body').innerText()).not.toMatch(/[가-힣]/u);
    await page.goto('/guide');
    await page.getByText('Start the questions').click();
    for (let index = 0; index < 6; index++) {
      await expect(page.getByText(questions[index]!.text)).toBeVisible();
      expect(await page.locator('body').innerText()).not.toMatch(/[가-힣]/u);
      await page.getByRole('button', { name: questions[index]!.choices[selected![index]!]!.text }).click();
    }
    await expect(page.getByText(`Your past life No.`, { exact: false }).first()).toBeVisible({ timeout: 40_000 });
    await expect(page.getByText('My past life story')).toBeVisible();
    expect(await page.locator('body').innerText()).not.toMatch(/[가-힣]/u);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await expect(page.getByRole('img', { name: /Lubo.*Windvale Market/u }).first()).toBeVisible();
    await page.waitForTimeout(1000); // Let the cover image finish its reveal before capturing the visual artifact.
    await page.screenshot({ path: `output/english-pagination/full-flow-${width}.png`, fullPage: true });
  }
  await page.getByRole('button', { name: 'Watch an ad to read the final moment' }).click();
  await expect(page).toHaveURL(/\/final-moment\?resultId=/u);
  await expect(page.getByText(/Lubo.s\s+final moment/u)).toBeVisible();
  expect(await page.locator('body').innerText()).not.toMatch(/[가-힣]/u);
  await page.screenshot({ path: 'output/english-pagination/final-moment-320.png', fullPage: true });
  await page.setViewportSize({ width: 768, height: 1024 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(768);
  await page.getByRole('button', { name: 'Finish the final moment' }).click();
  await expect(page).toHaveURL(/\/result\?showExports=1$/u);
  const pdfDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download story PDF' }).click();
  const pdf = await pdfDownload;
  expect(pdf.suggestedFilename()).toMatch(/^past-life-record.*\.pdf$/u);
  await pdf.saveAs('output/english-pagination/clown-en.pdf');
  const imageDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Share image' }).click();
  const share = await imageDownload;
  expect(share.suggestedFilename()).toMatch(/^past-life-archive.*\.png$/u);
  await share.saveAs('output/english-pagination/clown-en-share.png');
  await expect(page.getByRole('button', { name: 'Save to archive' })).toHaveCount(0);
  expect(await page.locator('body').innerText()).not.toMatch(/[가-힣]/u);
});
