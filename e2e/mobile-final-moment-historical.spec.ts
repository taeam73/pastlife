import { expect, test } from '@playwright/test';
import { calculateResult } from '../packages/scoring/src/result';

type Question = { id: string; choices: { id: string }[] };
async function createStoryResult(storyId: string, title: string, devicePrefix: string) {
  const base = process.env.E2E_API_URL ?? 'http://127.0.0.1:4001/api/v1';
  async function call(path: string, method = 'GET', body?: object) {
    const response = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
    const json = await response.json();
    if (!response.ok) throw new Error(`${path}: ${response.status} ${JSON.stringify(json)}`);
    return json;
  }
  for (let attempt = 1; attempt <= 20; attempt++) {
    const session = await call('/sessions', 'POST', { locale: 'ko', deviceId: `${devicePrefix}-web-e2e-${attempt}-${Date.now()}` });
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
    const basic = await call(`/results/${completed.resultId}/basic`);
    expect(basic.presentation.hero.title).toBe(title);
    return { sessionId: session.sessionId, seed: session.seed, contentVersion: session.contentVersion, viewMode: session.viewMode, resultId: completed.resultId };
  }
  throw new Error(`No ${storyId} answer path in 20 sessions`);
}

for (const story of [
  { id: 'WIRE_OUTSIDE_THE_DOOR', title: '문밖까지 닿은 소리', name: '코피', finalName: '코피 멘사', slug: 'accra-kofi' },
  { id: 'PIPA_BEFORE_THE_RAIN', title: '빗방울보다 먼저 울린 비파', name: '유란', slug: 'changan-yulan' },
  { id: 'NAIL_IN_THE_FOG_WHISTLE', title: '안개 호루라기 속의 못 하나', name: '엘리어스 워드', slug: 'manitou-elias' },
  { id: 'TWO_WRONG_TILE_WALLS', title: '배 밑에서 나온 빵 바구니', name: '주앙 마르케스', slug: 'lisbon-joao' },
  { id: 'NAME_BESIDE_THE_NOTICE', title: '부고 옆의 이름 한 줄', name: '말리아 케알로하', slug: 'honolulu-malia' },
  { id: 'FIRST_GARDEN_FLOOD', title: '첫 밭에 물을 보낸 날', name: '라마나', slug: 'vijayanagara-ramana' },
  { id: 'TWO_WAYS_TO_THE_FLOWER_MARKET', title: '꽃 시장으로 가는 두 물길', name: '소치틀', slug: 'xochimilco-xochitl' },
  { id: 'THE_PIGEON_WITHOUT_A_RING', title: '발찌가 없어진 비둘기', name: '라피크', slug: 'shahjahanabad-rafiq' },
  { id: 'THE_TWO_TRUNKS_AT_LEVUKA', title: '상자 둘이 바뀐 아침', name: '루이사', slug: 'levuka-luisa' },
  { id: 'THE_QUIET_BRIDE_BATH', title: '노래를 멈춘 목욕탕', name: '제이네프', slug: 'istanbul-zeynep' },
  { id: 'TWO_GAMES_ONE_TICKET', title: '그날의 두 경기', name: '테레사 로하스', slug: 'havana-teresa' },
  { id: 'ONE_BEAT_LATE_CIRCLE', title: '한 박자 늦은 원', name: '나피사', slug: 'zanzibar-nafisa' },
  { id: 'THE_TILE_WITH_NO_TWIN', title: '짝이 없는 타일', name: '유수프', slug: 'samarkand-yusuf' },
  { id: 'THREE_DOLLARS_AT_DAWN', title: '새벽의 3달러', name: '로사 베가', slug: 'columbia-rosa' },
  { id: 'THE_MOON_ON_THE_STAIRS', title: '계단에 선 달', name: '마누엘 이바라', slug: 'valparaiso-manuel' },
  { id: 'THE_SHADE_NO_ONE_OWNED', title: '아무도 자기 것이라 하지 않은 그늘', name: '조수', slug: 'abomey-zossou' },
  { id: 'COCHINEAL_SCALE', title: '두 번째 저울', name: '마누엘', slug: 'manuel' },
  { id: 'CRACKED_PIGEON_TOWER', title: '탑이 날아오른 날', name: '유수프', slug: 'yusuf' },
  { id: 'OTHER_BALLOT', title: '다른 표', name: '마거릿 홀', slug: 'margaret' },
  { id: 'RIVER_WITH_ONE_LESS_OAR', title: '배에 남은 빈자리', name: '마리아나 데 라 크루스', slug: 'mariana' },
  { id: 'THE_UNSENT_INVITATION', title: '보내지 못한 초대장', name: '데메트리오스', slug: 'demetrios' },
  { id: 'THE_OX_AND_THE_HEMP', title: '소 앞에 펼친 삼베', name: '연화', slug: 'yeonhwa' },
  { id: 'THE_DOG_IN_THE_PORTRAIT', title: '가족사진에 들어온 개', name: '아스타 욘스도티르', slug: 'asta' },
  { id: 'THE_WALL_FOR_TWO_DAYS', title: '이틀 동안의 벽', name: '하심 이븐 유수프', slug: 'hasim' },
  { id: 'THE_CORD_BEFORE_THE_BRIDGE', title: '다리 앞의 한 올', name: '키야', slug: 'killa' },
  { id: 'THE_QUIET_REHEARSAL', title: '소리 없는 밤의 박자', name: '쩐반호아', slug: 'hoa' },
  { id: 'THE_DONKEY_TURNED_BACK', title: '당나귀가 돌아간 골목', name: '유수프', slug: 'fez-yusuf' },
  { id: 'THE_BIRTHDAY_WITHOUT_CAKE', title: '케이크가 없던 생일', name: '로테 노이만', slug: 'berlin-lotte' },
  { id: 'THE_NAME_LEFT_BLANK', title: '지운 이름 옆의 빈칸', name: '잉가 라르센', slug: 'oslo-inga' },
  { id: 'THE_FACE_ON_THE_SALON_SIGN', title: '간판 속 다른 얼굴', name: '비시', slug: 'lagos-bisi' },
]) test(`${story.title} / ${story.name}: six-answer result, final moment, PDF, and share image on 320px and tablet`, async ({ page }) => {
  test.setTimeout(120000);
  const session = await createStoryResult(story.id, story.title, story.slug);
  await page.addInitScript((value) => localStorage.setItem('pastlife.session.v1', JSON.stringify(value)), session);
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/result');
  await expect(page.getByText(story.name, { exact: true }).first()).toBeVisible({ timeout: 30000 });
  await expect(page.getByRole('button', { name: '전생기록 다운로드' })).toBeDisabled();
  await page.screenshot({ path: `output/playwright/${story.slug}-result-320.png`, fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  await page.getByRole('button', { name: '광고 보고 마지막 순간 보러 가기' }).click();
  await expect(page).toHaveURL(/\/final-moment$/);
  await expect(page.getByText(`${story.finalName ?? story.name}의 마지막 순간`)).toBeVisible();
  await expect.poll(async () => page.getByRole('img', { name: new RegExp(story.finalName ?? story.name) }).first().evaluate((element) => element instanceof HTMLImageElement && element.complete && element.naturalWidth >= 1024)).toBe(true);
  await page.screenshot({ path: `output/playwright/${story.slug}-final-320.png`, fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.screenshot({ path: `output/playwright/${story.slug}-final-768.png`, fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(768);
  await page.getByRole('button', { name: '마지막 순간 마치기' }).click();
  await expect(page).toHaveURL(/\/result$/);
  await expect(page.getByRole('button', { name: '전생기록 다운로드' })).toBeEnabled();
  await expect(page.getByRole('button', { name: '이미지 공유' })).toBeEnabled();
  const pdfDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: '전생기록 다운로드' }).click();
  const pdf = await pdfDownload;
  await pdf.saveAs(`output/playwright/${story.slug}-record.pdf`);
  expect(pdf.suggestedFilename()).toMatch(/\.pdf$/);
  const imageDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: '이미지 공유' }).click();
  const image = await imageDownload;
  await image.saveAs(`output/playwright/${story.slug}-share.png`);
  expect(image.suggestedFilename()).toMatch(/\.png$/);
  await page.screenshot({ path: `output/playwright/${story.slug}-unlocked-768.png`, fullPage: true });
});
