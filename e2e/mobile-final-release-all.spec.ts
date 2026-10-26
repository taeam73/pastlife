import { expect, test } from '@playwright/test';
import { mkdir, stat } from 'node:fs/promises';
import { findStoryFinalMoment, storyCards } from '../packages/content/src/index';
import { calculateResult } from '../packages/scoring/src/result';

type Question = { id: string; choices: { id: string }[] };

test.describe.configure({ mode: 'parallel' });

const selectedStoryNumbers = new Set(
  (process.env.E2E_STORY_NUMBERS ?? '')
    .split(',')
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isInteger(value) && value >= 1 && value <= 120),
);

async function createStoryResult(storyId: string, devicePrefix: string) {
  const base = process.env.E2E_API_URL ?? 'http://127.0.0.1:4001/api/v1';
  async function call(path: string, method = 'GET', body?: object) {
    const response = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
    const json = await response.json();
    if (!response.ok) throw new Error(`${path}: ${response.status} ${JSON.stringify(json)}`);
    return json;
  }
  for (let attempt = 1; attempt <= 20; attempt++) {
    const session = await call('/sessions', 'POST', { locale: 'ko', deviceId: `${devicePrefix}-${attempt}-${Date.now()}` });
    const questions: Question[] = [];
    for (let stage = 1; stage <= 6; stage++) questions.push(await call(`/sessions/${session.sessionId}/questions/${stage}`));
    let selected: number[] | undefined;
    for (let number = 0; number < 46656; number++) {
      let cursor = number;
      const indices = Array.from({ length: 6 }, () => { const value = cursor % 6; cursor = Math.floor(cursor / 6); return value; });
      const answers = questions.map((question, index) => ({ stage: (index + 1) as 1 | 2 | 3 | 4 | 5 | 6, questionId: question.id, choiceId: question.choices[indices[index]!]!.id }));
      if (calculateResult({ answers, contentVersion: '3.0.0' }).storyId === storyId) { selected = indices; break; }
    }
    if (!selected) continue;
    for (let index = 0; index < 6; index++) await call(`/sessions/${session.sessionId}/answers/${index + 1}`, 'PUT', { questionId: questions[index]!.id, choiceId: questions[index]!.choices[selected[index]!]!.id });
    const completed = await call(`/sessions/${session.sessionId}/complete`, 'POST');
    await call(`/sessions/${session.sessionId}/ads/1/complete`, 'POST', { providerEventId: `fake-ad-1-${session.sessionId}` });
    return { sessionId: session.sessionId, seed: session.seed, contentVersion: session.contentVersion, viewMode: session.viewMode, resultId: completed.resultId };
  }
  throw new Error(`No ${storyId} answer path in 20 sessions`);
}

test.beforeAll(async () => {
  await mkdir('output/final-release/pdf', { recursive: true });
  await mkdir('output/final-release/share', { recursive: true });
});

for (const [index, card] of storyCards.entries()) {
  if (selectedStoryNumbers.size > 0 && !selectedStoryNumbers.has(index + 1)) continue;
  const moment = findStoryFinalMoment(card.id);
  if (!moment) throw new Error(`Missing final moment: ${card.id}`);
  const slug = `${String(index + 1).padStart(3, '0')}-${card.id.toLowerCase().replaceAll('_', '-')}`;
  test(`${index + 1}/120 ${card.id}: final release flow, PDF, and share image`, async ({ page }) => {
    test.setTimeout(180_000);
    const session = await createStoryResult(card.id, `release-${slug}`);
    await page.addInitScript((value) => localStorage.setItem('pastlife.session.v1', JSON.stringify(value)), session);
    await page.setViewportSize({ width: 320, height: 720 });
    await page.goto('/result');
    await expect(page.getByText(card.name, { exact: true }).first()).toBeVisible({ timeout: 30_000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
    await page.getByRole('button', { name: '광고 보고 마지막 순간 보러 가기' }).click();
    await expect(page).toHaveURL(/\/final-moment$/);
    await expect(page.getByText(new RegExp(`${moment.protagonist}의\\s*마지막 순간`))).toBeVisible();
    await expect(page.getByRole('img', { name: moment.artAlt, exact: true })).toBeVisible({ timeout: 30_000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
    await page.setViewportSize({ width: 768, height: 1024 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(768);
    await page.getByRole('button', { name: '마지막 순간 마치기' }).click();
    await expect(page).toHaveURL(/\/result$/);
    await expect(page.getByRole('button', { name: '전생기록 다운로드' })).toBeEnabled();
    await expect(page.getByRole('button', { name: '이미지 공유' })).toBeEnabled();

    const pdfPath = `output/final-release/pdf/${slug}.pdf`;
    const pdfDownload = page.waitForEvent('download');
    await page.getByRole('button', { name: '전생기록 다운로드' }).click();
    await (await pdfDownload).saveAs(pdfPath);
    expect((await stat(pdfPath)).size).toBeGreaterThan(100_000);

    const sharePath = `output/final-release/share/${slug}.png`;
    const imageDownload = page.waitForEvent('download');
    await page.getByRole('button', { name: '이미지 공유' }).click();
    await (await imageDownload).saveAs(sharePath);
    expect((await stat(sharePath)).size).toBeGreaterThan(100_000);
  });
}
