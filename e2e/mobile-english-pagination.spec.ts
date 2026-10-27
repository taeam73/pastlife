import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { calculateResult } from '../packages/scoring/src/result';
import { findEnglishStoryTranslation } from '../packages/content/src/translations/en/catalog';
import { buildContentStoryResult } from '../apps/api/src/results/story-result';

type Session = { sessionId: string; seed: string; contentVersion: string; viewMode: string; resultId?: string };
type Question = { id: string; choices: { id: string }[] };

test('shows a translated 3.0 story on parchment without clipping or lost text', async ({ page }) => {
  test.setTimeout(120_000);
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
    session = await call<Session>('/sessions', 'POST', { locale: 'ko', deviceId: `english-clown-${attempt}-${Date.now()}` });
    questions = [];
    for (let stage = 1; stage <= 6; stage++) questions.push(await call<Question>(`/sessions/${session.sessionId}/questions/${stage}`));
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
  for (let index = 0; index < 6; index++) await call(`/sessions/${session!.sessionId}/answers/${index + 1}`, 'PUT', { questionId: questions[index]!.id, choiceId: questions[index]!.choices[selected![index]!]!.id });
  const completed = await call<{ resultId: string }>(`/sessions/${session!.sessionId}/complete`, 'POST');
  const original = await call<any>(`/results/${completed.resultId}/basic`);
  expect(original.presentation.version).toBe(3);
  expect(original.presentation.chapters[1].body).toContain('저 신발은 인사도 안 받겠는데');
  const englishStory = findEnglishStoryTranslation('CLOWN')!;
  const answers = questions.map((question, index) => ({ stage: (index + 1) as 1 | 2 | 3 | 4 | 5 | 6, questionId: question.id, choiceId: question.choices[selected![index]!]!.id }));
  const core = calculateResult({ answers, contentVersion: '3.0.0' });
  const translated = buildContentStoryResult(completed.resultId, core, original.image, false, 'en');
  expect(JSON.stringify(translated)).not.toMatch(/[가-힣]/u);
  await page.route('**/api/v1/results/*/basic', (route) => route.fulfill({ json: translated }));
  await page.addInitScript((value) => {
    localStorage.setItem('pastlife.session.v1', JSON.stringify(value));
    localStorage.setItem('pastlife.preferences.v1', JSON.stringify({ bgmEnabled: false, effectsEnabled: false, reduceMotion: true }));
  }, { ...session, resultId: completed.resultId });
  await mkdir('output/english-pagination', { recursive: true });

  for (const width of [320, 768]) {
    await page.setViewportSize({ width, height: width === 320 ? 720 : 1024 });
    await page.goto('/result');
    await expect(page.getByRole('button', { name: '표지 보기' })).toBeVisible();
    await page.getByRole('button', { name: /^1장 .* 보기$/ }).click();
    await expect(page.getByTestId('result-summary-page').getByTestId('measured-visible-page')).toBeVisible();
    await page.screenshot({ path: `output/english-pagination/clown-profile-${width}.png`, fullPage: true });
    let profileText = '';
    for (let index = 0; index < 30; index++) {
      const frame = page.getByTestId('result-summary-page');
      await assertPageFits(frame);
      profileText += await frame.getByTestId('measured-visible-page').evaluate((element) => element.children[1]?.textContent ?? '');
      const next = page.getByRole('button', { name: '다음 인물 소개 페이지' });
      if (!await next.isEnabled()) break;
      await next.click();
    }
    for (const source of englishStory.manuscript.identity.profilePages!) expect(compact(profileText)).toContain(compact(source.body));

    const episode = [englishStory.manuscript.episode.beforeSignal, englishStory.manuscript.episode.signalMoments.speak!, englishStory.manuscript.episode.afterSignal].join('\n\n');
    const timeline = englishStory.manuscript.timeline.map(({ when, event }) => `${when} · ${event}`).join('\n');
    const memories = englishStory.manuscript.memories.map(({ label, detail }) => `${label}\n${detail}`).join('\n\n');
    for (const [chapter, expected] of [[2, episode], [3, timeline], [4, memories]] as const) {
      await page.getByRole('button', { name: new RegExp(`^${chapter}장 .* 보기$`) }).click();
      const frame = page.getByTestId('chapter-text-page');
      await expect(frame.getByTestId('measured-visible-page')).toBeVisible();
      if (chapter === 2) await page.screenshot({ path: `output/english-pagination/clown-episode-${width}.png`, fullPage: true });
      let visibleText = '';
      for (let index = 0; index < 90; index++) {
        await assertPageFits(frame);
        visibleText += await frame.getByTestId('measured-visible-page').textContent() ?? '';
        const next = page.getByRole('button', { name: '다음 글 페이지' });
        if (!await next.isEnabled()) break;
        await next.click();
      }
      expect(compact(visibleText)).toBe(compact(expected));
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  }
});

function compact(text: string) { return text.replace(/[\s·]/gu, ''); }

async function assertPageFits(locator: import('@playwright/test').Locator) {
  await expect.poll(async () => locator.evaluate((element) => {
    const frame = element.getBoundingClientRect();
    const content = element.querySelector('[data-testid="measured-visible-page"]')?.getBoundingClientRect();
    return Boolean(content && content.bottom <= frame.bottom + 2 && content.right <= frame.right + 2);
  })).toBe(true);
}
