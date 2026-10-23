import { expect, test } from '@playwright/test';

test('shows a named past life and place without overlapping the summary', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /나의 전생 찾아보기/ }).click();
  await page.getByRole('button', { name: /질문 시작하기/ }).click();
  for (let stage = 1; stage <= 6; stage += 1) {
    await expect(page).toHaveURL(new RegExp(`/question/${stage}$`));
    await page.getByRole('button').first().click();
  }
  await expect(page).toHaveURL(/\/result$/);
  await expect(page.getByText('이야기 속 당신', { exact: true })).toHaveCount(0);
  for (const viewport of [{ width: 320, height: 720 }, { width: 768, height: 1024 }]) {
    await page.setViewportSize(viewport);
    await expect(page.getByText('당신의 전생은')).toBeVisible();
    await expect.poll(async () => page.getByRole('img').first().evaluate(
      (element) => element instanceof HTMLImageElement && element.complete && element.naturalWidth > 0,
    )).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
    const quote = await page.getByTestId('result-signature-quote').boundingBox();
    const summary = await page.getByTestId('result-summary-panel').boundingBox();
    expect(quote).not.toBeNull();
    expect(summary).not.toBeNull();
    expect(quote!.y + quote!.height).toBeLessThan(summary!.y);
    await page.screenshot({ path: `output/playwright/story-identity-${viewport.width}.png`, fullPage: true });
  }
});

test('keeps the dragon library bell and dream recorder visible on phone and tablet', async ({ page }) => {
  await page.route('**/api/v1/results/*/basic', async (route) => {
    const response = await route.fetch();
    const body = await response.json();
    const backgroundUri = 'asset://stories/v3/dragon-dream-library-bg.jpg';
    const characterUri = 'asset://stories/v3/dragon-dream-orr.webp';
    body.image = { sourceType: 'LIBRARY', uri: backgroundUri, alt: '잠든 용의 도서관과 꿈 기록자 오르', status: 'READY', attemptCount: 0,
      matchQuality: 'EXACT', layers: [
        { uri: backgroundUri, role: 'BACKGROUND', alt: '종과 빈 기록장이 있는 도서관' },
        { uri: characterUri, role: 'CHARACTER', alt: '꿈 기록자 오르' },
      ] };
    body.character.name = '오르';
    body.character.occupation = '꿈 기록자';
    body.character.favoritePlace = '잠든 용의 도서관';
    body.presentation.hero.title = '용의 꿈에서 지워진 이름';
    body.presentation.hero.signatureQuote = '잠든 용의 꿈을 적던 날, 책에서 당신 이름만 사라졌습니다.';
    body.presentation.hero.lifeSummary = '그 삶에서 당신은 잠든 용의 도서관에 살던 꿈 기록자 오르였습니다.';
    body.presentation.hero.backgroundUri = backgroundUri;
    body.presentation.hero.characterUri = characterUri;
    await route.fulfill({ response, json: body });
  });

  await page.goto('/');
  await page.getByRole('button', { name: /나의 전생 찾아보기/ }).click();
  await page.getByRole('button', { name: /질문 시작하기/ }).click();
  for (let stage = 1; stage <= 6; stage += 1) {
    await expect(page).toHaveURL(new RegExp(`/question/${stage}$`));
    await page.getByRole('button').first().click();
  }
  await expect(page).toHaveURL(/\/result$/);
  const background = page.getByRole('img', { name: '잠든 용의 도서관과 꿈 기록자 오르' }).first();
  const character = page.getByRole('img', { name: '전생 인물' });
  for (const viewport of [{ width: 320, height: 720 }, { width: 768, height: 1024 }]) {
    await page.setViewportSize(viewport);
    await expect.poll(async () => background.evaluate((element) => element instanceof HTMLImageElement && element.complete && element.naturalWidth >= 1024)).toBe(true);
    await expect.poll(async () => character.evaluate((element) => element instanceof HTMLImageElement && element.complete && element.naturalWidth >= 1024)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
    const quote = await page.getByTestId('result-signature-quote').boundingBox();
    const summary = await page.getByTestId('result-summary-panel').boundingBox();
    expect(quote!.y + quote!.height).toBeLessThan(summary!.y);
    await page.screenshot({ path: `output/playwright/story-dragon-dream-layered-${viewport.width}.png`, fullPage: true });
  }
});

test('keeps the Yeoulho signal and archivist visible on phone and tablet', async ({ page }) => {
  await page.route('**/api/v1/results/*/basic', async (route) => {
    const response = await route.fetch();
    const body = await response.json();
    const backgroundUri = 'asset://stories/v3/last-signal-yeoulho-bg.jpg';
    const characterUri = 'asset://stories/v3/last-signal-hangyeol.webp';
    body.image = { sourceType: 'LIBRARY', uri: backgroundUri, alt: '여울호 통신실과 기록관 한결', status: 'READY', attemptCount: 0,
      matchQuality: 'EXACT', layers: [
        { uri: backgroundUri, role: 'BACKGROUND', alt: '되돌아온 신호가 보이는 통신실' },
        { uri: characterUri, role: 'CHARACTER', alt: '통신 기록관 한결' },
      ] };
    body.character.name = '한결';
    body.character.occupation = '통신 기록관';
    body.character.favoritePlace = '여울호 우주선';
    body.presentation.hero.title = '오지 않은 답장';
    body.presentation.hero.signatureQuote = '당신은 도착하지 않은 답장을 매일 정리하는 기록관이었습니다.';
    body.presentation.hero.lifeSummary = '그 삶에서 당신은 여울호 우주선의 통신 기록관 한결이었습니다.';
    body.presentation.hero.backgroundUri = backgroundUri;
    body.presentation.hero.characterUri = characterUri;
    await route.fulfill({ response, json: body });
  });

  await page.goto('/');
  await page.getByRole('button', { name: /나의 전생 찾아보기/ }).click();
  await page.getByRole('button', { name: /질문 시작하기/ }).click();
  for (let stage = 1; stage <= 6; stage += 1) {
    await expect(page).toHaveURL(new RegExp(`/question/${stage}$`));
    await page.getByRole('button').first().click();
  }
  await expect(page).toHaveURL(/\/result$/);
  const background = page.getByRole('img', { name: '여울호 통신실과 기록관 한결' }).first();
  const character = page.getByRole('img', { name: '전생 인물' });
  for (const viewport of [{ width: 320, height: 720 }, { width: 768, height: 1024 }]) {
    await page.setViewportSize(viewport);
    await expect.poll(async () => background.evaluate((element) => element instanceof HTMLImageElement && element.complete && element.naturalWidth >= 1024)).toBe(true);
    await expect.poll(async () => character.evaluate((element) => element instanceof HTMLImageElement && element.complete && element.naturalWidth >= 1024)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
    const quote = await page.getByTestId('result-signature-quote').boundingBox();
    const summary = await page.getByTestId('result-summary-panel').boundingBox();
    expect(quote!.y + quote!.height).toBeLessThan(summary!.y);
    await page.screenshot({ path: `output/playwright/story-last-signal-layered-${viewport.width}.png`, fullPage: true });
  }
});

test('keeps the seven-hole shade tent and courier visible on phone and tablet', async ({ page }) => {
  await page.route('**/api/v1/results/*/basic', async (route) => {
    const response = await route.fetch();
    const body = await response.json();
    const backgroundUri = 'asset://stories/v3/shade-tent-daystar-bg.jpg';
    const characterUri = 'asset://stories/v3/shade-tent-iro.webp';
    body.image = { sourceType: 'LIBRARY', uri: backgroundUri, alt: '낮별 행성의 그늘 천막과 배달자 이로', status: 'READY', attemptCount: 0,
      matchQuality: 'EXACT', layers: [
        { uri: backgroundUri, role: 'BACKGROUND', alt: '빛이 새는 그늘 천막' },
        { uri: characterUri, role: 'CHARACTER', alt: '천막 배달자 이로' },
      ] };
    body.character.name = '이로';
    body.character.occupation = '그늘 천막 배달자';
    body.character.favoritePlace = '낮별 행성';
    body.presentation.hero.title = '구멍 난 그늘';
    body.presentation.hero.signatureQuote = '밤이 오지 않는 별에서, 당신은 잠들 시간을 배달했습니다.';
    body.presentation.hero.lifeSummary = '그 삶에서 당신은 낮별 행성의 그늘 천막 배달자 이로였습니다.';
    body.presentation.hero.backgroundUri = backgroundUri;
    body.presentation.hero.characterUri = characterUri;
    await route.fulfill({ response, json: body });
  });
  await page.goto('/');
  await page.getByRole('button', { name: /나의 전생 찾아보기/ }).click();
  await page.getByRole('button', { name: /질문 시작하기/ }).click();
  for (let stage = 1; stage <= 6; stage += 1) {
    await expect(page).toHaveURL(new RegExp(`/question/${stage}$`));
    await page.getByRole('button').first().click();
  }
  await expect(page).toHaveURL(/\/result$/);
  const background = page.getByRole('img', { name: '낮별 행성의 그늘 천막과 배달자 이로' }).first();
  const character = page.getByRole('img', { name: '전생 인물' });
  for (const viewport of [{ width: 320, height: 720 }, { width: 768, height: 1024 }]) {
    await page.setViewportSize(viewport);
    await expect.poll(async () => background.evaluate((element) => element instanceof HTMLImageElement && element.complete && element.naturalWidth >= 1024)).toBe(true);
    await expect.poll(async () => character.evaluate((element) => element instanceof HTMLImageElement && element.complete && element.naturalWidth >= 1024)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
    const quote = await page.getByTestId('result-signature-quote').boundingBox();
    const summary = await page.getByTestId('result-summary-panel').boundingBox();
    expect(quote!.y + quote!.height).toBeLessThan(summary!.y);
    await page.screenshot({ path: `output/playwright/story-shade-tent-layered-${viewport.width}.png`, fullPage: true });
  }
});

for (const story of [
  { id: 'reverse-map', label: '물방울 바다의 항로와 길잡이 누리', name: '누리', role: '바다 길잡이', home: '물방울 바다', title: '거꾸로 든 지도', quote: '바다 위에서 길을 잃은 사람은 지도가 아니라 당신이었습니다.', background: 'reverse-map-droplet-sea-bg.jpg', character: 'reverse-map-nuri.webp' },
  { id: 'shore-rock', label: '바람턱 해안과 갈라진 바위 파도틈', name: '파도틈', role: '해안가의 바위', home: '바람턱 해안', title: '해안가 바위의 마지막 웅덩이', quote: '당신은 수백 해 동안 같은 자리에서 파도를 맞은 바위였습니다.', background: 'shore-rock-baramteok-bg.jpg', character: 'shore-rock-padoteum.webp' },
  { id: 'festival-king', label: '돌빛성 축제의 빈 의자와 하루짜리 왕 도겸', name: '도겸', role: '축제의 왕 대역', home: '돌빛성', title: '하루짜리 왕의 오래된 약속', quote: '하루짜리 왕이 된 당신에게 한 아이가 진짜 왕도 못 지킨 약속을 부탁했습니다.', background: 'festival-king-dolbit-castle-bg-v2.jpg', character: 'festival-king-dogyeom.webp' },
  { id: 'snow-referee', label: '눈언덕 마을의 결승선과 경주 심판 미루', name: '미루', role: '눈길 경주 심판', home: '눈언덕 마을', title: '시작 전의 발자국', quote: '경주가 시작되기도 전에 결승선 뒤에 발자국이 찍혀 있었습니다.', background: 'snow-referee-snowhill-bg-v3.jpg', character: 'snow-referee-miru.webp' },
  { id: 'shadow-tailor', label: '달실 골목의 그림자 작업대와 재단사 나린', name: '나린', role: '그림자 재단사', home: '달실 골목', title: '한 뼘씩 짧아진 그림자', quote: '손님의 그림자는 길어지는데 당신의 것만 밤마다 한 뼘씩 짧아졌습니다.', background: 'shadow-tailor-moonthread-bg.jpg', character: 'shadow-tailor-narin.webp' },
  { id: 'underwater-scale', label: '푸른샘 수중 장터의 기운 빈 저울과 저울지기 아람', name: '아람', role: '수중 장터의 저울지기', home: '푸른샘 수중 장터', title: '아무것도 없는 저울', quote: '빈 저울 한쪽이 툭 내려가자 장터 사람들은 보이지 않는 도둑을 찾기 시작했습니다.', background: 'underwater-scale-bluespring-bg.jpg', character: 'underwater-scale-aram.webp' },
  { id: 'doorless-keeper', label: '유리숲의 문 없는 유리집과 문지기 서후', name: '서후', role: '유리집 문지기', home: '유리숲', title: '문 없는 집의 문지기', quote: '오래 지킨 집에 문이 없다는 걸 길 잃은 아이가 먼저 발견했습니다.', background: 'doorless-keeper-glass-forest-bg.jpg', character: 'doorless-keeper-seohoo.webp' },
  { id: 'lost-autumn', label: '사계 마을의 빠진 가을 달력과 달력지기 온', name: '온', role: '마을 달력지기', home: '사계 마을', title: '사라진 가을 한 장', quote: '달력에서 가을 한 장이 빠지자 마을은 아직 더운데 겨울 준비를 시작했습니다.', background: 'lost-autumn-four-seasons-bg.jpg', character: 'lost-autumn-on.webp' },
  { id: 'theatre-villain', label: '검은장막 극단의 빈 무대와 객석에 앉은 악역 배우 비안', name: '비안', role: '극단의 악역 배우', home: '검은장막 극단', title: '악역이 객석에 앉은 밤', quote: '막이 올랐는데 악역인 당신은 무대가 아니라 객석 맨 앞에 앉아 있었습니다.', background: 'theatre-villain-black-curtain-bg.jpg', character: 'theatre-villain-bian.webp' },
  { id: 'windmill', label: '아르하 칼렌 고원의 공동 풍차와 풍차지기 로아', name: '로아', role: '풍차지기', home: '메마른 들판', title: '팔지 않은 밤바람', quote: '한 집이 밤바람을 모두 사겠다고 한 날, 다른 집의 불이 하나씩 꺼졌습니다.', background: 'windmill-kallen-plateau-bg.jpg', character: 'windmill-roa.webp' },
  { id: 'heavy-box', label: '자갈나루 수레 극장의 빈 잔상목 상자와 짐꾼 해민', name: '해민', role: '수레 극단의 짐꾼', home: '자갈나루', title: '가장 무거운 빈 상자', quote: '비어 있는 상자 하나가 극장의 어떤 소품보다 무거웠습니다.', background: 'heavy-box-jagalnaru-stage-bg.jpg', character: 'heavy-box-haemin.webp' },
  { id: 'gravity-seeds', label: '라모 궤도 발아실의 씨앗과 종자 보관사 미라', name: '미라', role: '종자 보관사', home: '고리 4구역', title: '중력이 돌아온 세 분', quote: '정거장에 중력이 돌아온 세 분 동안, 씨앗 두 봉지 중 하나만 흙에 닿을 수 있었습니다.', background: 'gravity-seeds-ramo-station-bg.jpg', character: 'gravity-seeds-mira.webp' },
  { id: 'paid-loss', label: '레도스 돌판 경기장과 선수 아델의 마지막 돌', name: '아델', role: '돌판 경기 선수', home: '레도스 자유시', title: '돈을 받고 져야 했던 결승', quote: '결승을 앞둔 밤, 당신은 처음으로 이기지 말라는 돈을 받았습니다.', background: 'paid-loss-ledos-arena-bg.jpg', character: 'paid-loss-adel.webp' },
  { id: 'warm-stones', label: '늦봄 눈길의 빵집과 돌·빵 꾸러미를 든 심부름꾼 단우', name: '단우', role: '공동 빵집 심부름꾼', home: '솔마루 골짜기', title: '빵 대신 온 돌', quote: '늦봄에 눈이 내린 아침, 당신은 빵을 기다리던 집에 따뜻한 돌을 배달했습니다.', background: 'warm-stones-solmaru-bg.jpg', character: 'warm-stones-danu.webp' },
  { id: 'apology-courier', label: '라메르 운하의 올라간 다리와 사과 편지 두 통을 전하는 테오', name: '테오', role: '사과 배달부', home: '라메르 운하', title: '서로에게 보낸 두 통의 사과', quote: '해가 지면 다리가 올라갑니다. 그런데 양쪽 둑에서 두 사람이 서로에게 사과를 전해 달라며 당신을 찾았어요.', background: 'apology-courier-lamer-bg.jpg', character: 'apology-courier-theo.webp' },
  { id: 'moon-signal-window', label: '1969년 파크스 마을 회관의 텔레비전과 수리공 메이', name: '메이', role: '텔레비전 수리공', home: '파크스 마을', title: '화면 밖의 첫걸음', quote: '회관에 모인 사람들이 달을 기다리는 사이, 텔레비전 화면이 한 줄로 접혀 버렸습니다.', background: 'moon-signal-parkes-hall-bg.jpg', character: 'moon-signal-may.webp' },
  { id: 'tide-mark', label: '칠물문 장터의 물높이 눈금과 표지 관리인 라오', name: '라오', role: '물높이 표지 관리인', home: '칠물문 자유시', title: '물고기가 삼킨 파란 선', quote: '장터 벽에 그린 커다란 물고기가, 물이 오르면 짐을 옮기라는 파란 선을 삼켜 버렸습니다.', background: 'tide-mark-estuary-bg.jpg', character: 'tide-mark-rao.webp' },
  { id: 'third-knock', label: '오르시 옛 관측소의 닫힌 지도실과 야간 경비원 리나', name: '리나', role: '옛 관측소 야간 경비원', home: '오르시 자유시', title: '유령이 세 번 두드린 밤', quote: '유령이 나온다는 관측소에서 두 번의 노크는 당신이 만들었습니다.', background: 'third-knock-orsi-observatory-bg.jpg', character: 'third-knock-rina.webp' },
  { id: 'market-cat-lot', label: '토람 강가 장터의 다섯 바구니와 추첨 진행자 모진', name: '모진', role: '시장 자리 추첨 진행자', home: '토람 자유시장', title: '햇볕을 고른 고양이', quote: '고양이가 첫 가판을 고르는 시장날, 고도는 언제나처럼 맨 왼쪽 바구니로 걸어갔습니다.', background: 'market-cat-lot-toram-bg-v2.jpg', character: 'market-cat-lot-mojin.webp' },
]) {
  test(`keeps ${story.id} background and subject visible on phone and tablet`, async ({ page }) => {
    await page.route('**/api/v1/results/*/basic', async (route) => {
      const response = await route.fetch();
      const body = await response.json();
      const backgroundUri = `asset://stories/v3/${story.background}`;
      const characterUri = `asset://stories/v3/${story.character}`;
      body.image = { sourceType: 'LIBRARY', uri: backgroundUri, alt: story.label, status: 'READY', attemptCount: 0,
        matchQuality: 'EXACT', layers: [
          { uri: backgroundUri, role: 'BACKGROUND', alt: story.label },
          { uri: characterUri, role: 'CHARACTER', alt: story.name },
        ] };
      body.character.name = story.name;
      body.character.occupation = story.role;
      body.character.favoritePlace = story.home;
      body.presentation.hero.title = story.title;
      body.presentation.hero.signatureQuote = story.quote;
      body.presentation.hero.lifeSummary = `그 삶에서 당신은 ${story.home}의 ${story.role} ${story.name}였습니다.`;
      body.presentation.hero.backgroundUri = backgroundUri;
      body.presentation.hero.characterUri = characterUri;
      await route.fulfill({ response, json: body });
    });
    await page.goto('/');
    await page.getByRole('button', { name: /나의 전생 찾아보기/ }).click();
    await page.getByRole('button', { name: /질문 시작하기/ }).click();
    for (let stage = 1; stage <= 6; stage += 1) {
      await expect(page).toHaveURL(new RegExp(`/question/${stage}$`));
      await page.getByRole('button').first().click();
    }
    await expect(page).toHaveURL(/\/result$/);
    const background = page.getByRole('img', { name: story.label }).first();
    const character = page.getByRole('img', { name: '전생 인물' });
    for (const viewport of [{ width: 320, height: 720 }, { width: 768, height: 1024 }]) {
      await page.setViewportSize(viewport);
      await expect.poll(async () => background.evaluate((element) => element instanceof HTMLImageElement && element.complete && element.naturalWidth >= 1024)).toBe(true);
      await expect.poll(async () => character.evaluate((element) => element instanceof HTMLImageElement && element.complete && element.naturalWidth >= 1024)).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
      const quote = await page.getByTestId('result-signature-quote').boundingBox();
      const summary = await page.getByTestId('result-summary-panel').boundingBox();
      expect(quote!.y + quote!.height).toBeLessThan(summary!.y);
      await page.screenshot({ path: `output/playwright/story-${story.id}-layered-${viewport.width}.png`, fullPage: true });
    }
  });
}

test('keeps the blank royal order and its scribe in separate readable layers', async ({ page }) => {
  await page.route('**/api/v1/results/*/basic', async (route) => {
    const response = await route.fetch();
    const body = await response.json();
    const backgroundUri = 'asset://stories/v3/blank-order-fog-castle-bg.jpg';
    const characterUri = 'asset://stories/v3/blank-order-sea.webp';
    body.image = { sourceType: 'LIBRARY', uri: backgroundUri, alt: '안개성과 서기관 세아', status: 'READY', attemptCount: 0,
      matchQuality: 'EXACT', layers: [
        { uri: backgroundUri, role: 'BACKGROUND', alt: '안개성 성문과 빈 명령서' },
        { uri: characterUri, role: 'CHARACTER', alt: '서기관 세아' },
      ] };
    body.character.name = '세아';
    body.character.occupation = '왕궁 서기관';
    body.character.favoritePlace = '안개성';
    body.presentation.hero.title = '빈 왕명을 든 서기관';
    body.presentation.hero.signatureQuote = '성문이 닫히기 전, 당신의 손에는 글자가 없는 명령서가 남았습니다.';
    body.presentation.hero.lifeSummary = '그 삶에서 당신은 안개성의 왕궁 서기관 세아였습니다.';
    body.presentation.hero.backgroundUri = backgroundUri;
    body.presentation.hero.characterUri = characterUri;
    await route.fulfill({ response, json: body });
  });

  await page.goto('/');
  await page.getByRole('button', { name: /나의 전생 찾아보기/ }).click();
  await page.getByRole('button', { name: /질문 시작하기/ }).click();
  for (let stage = 1; stage <= 6; stage += 1) {
    await expect(page).toHaveURL(new RegExp(`/question/${stage}$`));
    await page.getByRole('button').first().click();
  }
  await expect(page).toHaveURL(/\/result$/);
  const background = page.getByRole('img', { name: '안개성과 서기관 세아' }).first();
  const character = page.getByRole('img', { name: '전생 인물' });
  for (const viewport of [{ width: 320, height: 720 }, { width: 768, height: 1024 }]) {
    await page.setViewportSize(viewport);
    await expect.poll(async () => background.evaluate((element) => element instanceof HTMLImageElement && element.complete && element.naturalWidth >= 1024)).toBe(true);
    await expect.poll(async () => character.evaluate((element) => element instanceof HTMLImageElement && element.complete && element.naturalWidth >= 1024)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
    const quote = await page.getByTestId('result-signature-quote').boundingBox();
    const summary = await page.getByTestId('result-summary-panel').boundingBox();
    expect(quote!.y + quote!.height).toBeLessThan(summary!.y);
    await page.screenshot({ path: `output/playwright/story-blank-order-layered-${viewport.width}.png`, fullPage: true });
  }
});

test('keeps the riverside bell and detective Daon in separate readable layers', async ({ page }) => {
  await page.route('**/api/v1/results/*/basic', async (route) => {
    const response = await route.fetch();
    const body = await response.json();
    const backgroundUri = 'asset://stories/v3/silent-bell-reed-river-bg-v2.jpg';
    const characterUri = 'asset://stories/v3/silent-bell-daon.webp';
    body.image = { sourceType: 'LIBRARY', uri: backgroundUri, alt: '갈대강 마을의 종과 탐정 다온', status: 'READY', attemptCount: 0,
      matchQuality: 'EXACT', layers: [
        { uri: backgroundUri, role: 'BACKGROUND', alt: '종이 있는 강가 마을' },
        { uri: characterUri, role: 'CHARACTER', alt: '마을 탐정 다온' },
      ] };
    body.character.name = '다온';
    body.character.occupation = '마을 탐정';
    body.character.favoritePlace = '갈대강 마을';
    body.presentation.hero.title = '사라진 종소리';
    body.presentation.hero.signatureQuote = '종은 제자리에 있었는데, 마을 사람들은 종소리가 사라졌다고 했습니다.';
    body.presentation.hero.lifeSummary = '그 삶에서 당신은 갈대강 마을의 탐정 다온이었습니다.';
    body.presentation.hero.backgroundUri = backgroundUri;
    body.presentation.hero.characterUri = characterUri;
    await route.fulfill({ response, json: body });
  });

  await page.goto('/');
  await page.getByRole('button', { name: /나의 전생 찾아보기/ }).click();
  await page.getByRole('button', { name: /질문 시작하기/ }).click();
  for (let stage = 1; stage <= 6; stage += 1) {
    await expect(page).toHaveURL(new RegExp(`/question/${stage}$`));
    await page.getByRole('button').first().click();
  }
  await expect(page).toHaveURL(/\/result$/);
  const background = page.getByRole('img', { name: '갈대강 마을의 종과 탐정 다온' }).first();
  const character = page.getByRole('img', { name: '전생 인물' });
  for (const viewport of [{ width: 320, height: 720 }, { width: 768, height: 1024 }]) {
    await page.setViewportSize(viewport);
    await expect.poll(async () => background.evaluate((element) => element instanceof HTMLImageElement && element.complete && element.naturalWidth >= 1024)).toBe(true);
    await expect.poll(async () => character.evaluate((element) => element instanceof HTMLImageElement && element.complete && element.naturalWidth >= 1024)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
    const quote = await page.getByTestId('result-signature-quote').boundingBox();
    const summary = await page.getByTestId('result-summary-panel').boundingBox();
    expect(quote!.y + quote!.height).toBeLessThan(summary!.y);
    await page.screenshot({ path: `output/playwright/story-silent-bell-layered-${viewport.width}.png`, fullPage: true });
  }
});

test('keeps the mountain fork and night-path guide Maru in separate readable layers', async ({ page }) => {
  await page.route('**/api/v1/results/*/basic', async (route) => {
    const response = await route.fetch();
    const body = await response.json();
    const backgroundUri = 'asset://stories/v3/night-guide-soldeung-fork-bg-v3.jpg';
    const characterUri = 'asset://stories/v3/night-guide-maru.webp';
    body.image = { sourceType: 'LIBRARY', uri: backgroundUri, alt: '솔등 산골의 갈림길과 마루', status: 'READY', attemptCount: 0,
      matchQuality: 'EXACT', layers: [
        { uri: backgroundUri, role: 'BACKGROUND', alt: '비 젖은 산길의 갈림길' },
        { uri: characterUri, role: 'CHARACTER', alt: '밤길 안내자 마루' },
      ] };
    body.character.name = '마루';
    body.character.occupation = '밤길 안내자';
    body.character.favoritePlace = '솔등 산골';
    body.presentation.hero.title = '마지막 길의 안내자';
    body.presentation.hero.signatureQuote = '모두를 집으로 데려다준 밤, 당신만 아직 길 위에 있었습니다.';
    body.presentation.hero.lifeSummary = '그 삶에서 당신은 솔등 산골의 밤길 안내자 마루였습니다.';
    body.presentation.hero.backgroundUri = backgroundUri;
    body.presentation.hero.characterUri = characterUri;
    await route.fulfill({ response, json: body });
  });

  await page.goto('/');
  await page.getByRole('button', { name: /나의 전생 찾아보기/ }).click();
  await page.getByRole('button', { name: /질문 시작하기/ }).click();
  for (let stage = 1; stage <= 6; stage += 1) {
    await expect(page).toHaveURL(new RegExp(`/question/${stage}$`));
    await page.getByRole('button').first().click();
  }
  await expect(page).toHaveURL(/\/result$/);
  const background = page.getByRole('img', { name: '솔등 산골의 갈림길과 마루' }).first();
  const character = page.getByRole('img', { name: '전생 인물' });
  for (const viewport of [{ width: 320, height: 720 }, { width: 768, height: 1024 }]) {
    await page.setViewportSize(viewport);
    await expect.poll(async () => background.evaluate((element) => element instanceof HTMLImageElement && element.complete && element.naturalWidth >= 1024)).toBe(true);
    await expect.poll(async () => character.evaluate((element) => element instanceof HTMLImageElement && element.complete && element.naturalWidth >= 1024)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
    const quote = await page.getByTestId('result-signature-quote').boundingBox();
    const summary = await page.getByTestId('result-summary-panel').boundingBox();
    expect(quote!.y + quote!.height).toBeLessThan(summary!.y);
    await page.screenshot({ path: `output/playwright/story-night-guide-layered-${viewport.width}.png`, fullPage: true });
  }
});

test('keeps the royal soup clue and taster Yeo-rin in separate readable layers', async ({ page }) => {
  await page.route('**/api/v1/results/*/basic', async (route) => {
    const response = await route.fetch();
    const body = await response.json();
    const backgroundUri = 'asset://stories/v3/taster-pomegranate-castle-bg.jpg';
    const characterUri = 'asset://stories/v3/taster-yeorin.webp';
    body.image = { sourceType: 'LIBRARY', uri: backgroundUri, alt: '석류성의 음식 감별사 여린', status: 'READY', attemptCount: 0,
      matchQuality: 'EXACT', layers: [
        { uri: backgroundUri, role: 'BACKGROUND', alt: '국 그릇과 붉은 흔적' },
        { uri: characterUri, role: 'CHARACTER', alt: '음식 감별사 여린' },
      ] };
    body.character.name = '여린';
    body.character.occupation = '왕궁 음식 감별사';
    body.character.favoritePlace = '석류성';
    body.presentation.hero.title = '독보다 먼저 알아챈 맛';
    body.presentation.hero.signatureQuote = '왕의 국을 먼저 맛본 당신은 독이 아니라 잊었던 고향의 맛에 멈췄습니다.';
    body.presentation.hero.lifeSummary = '그 삶에서 당신은 석류성의 음식 감별사 여린이었습니다.';
    body.presentation.hero.backgroundUri = backgroundUri;
    body.presentation.hero.characterUri = characterUri;
    await route.fulfill({ response, json: body });
  });

  await page.goto('/');
  await page.getByRole('button', { name: /나의 전생 찾아보기/ }).click();
  await page.getByRole('button', { name: /질문 시작하기/ }).click();
  for (let stage = 1; stage <= 6; stage += 1) {
    await expect(page).toHaveURL(new RegExp(`/question/${stage}$`));
    await page.getByRole('button').first().click();
  }
  await expect(page).toHaveURL(/\/result$/);
  const background = page.getByRole('img', { name: '석류성의 음식 감별사 여린' }).first();
  const character = page.getByRole('img', { name: '전생 인물' });
  for (const viewport of [{ width: 320, height: 720 }, { width: 768, height: 1024 }]) {
    await page.setViewportSize(viewport);
    await expect.poll(async () => background.evaluate((element) => element instanceof HTMLImageElement && element.complete && element.naturalWidth >= 1024)).toBe(true);
    await expect.poll(async () => character.evaluate((element) => element instanceof HTMLImageElement && element.complete && element.naturalWidth >= 1024)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
    const quote = await page.getByTestId('result-signature-quote').boundingBox();
    const summary = await page.getByTestId('result-summary-panel').boundingBox();
    expect(quote!.y + quote!.height).toBeLessThan(summary!.y);
    await page.screenshot({ path: `output/playwright/story-taster-layered-${viewport.width}.png`, fullPage: true });
  }
});

test('keeps the smiling cloud and painter Hae-ru in separate readable layers', async ({ page }) => {
  await page.route('**/api/v1/results/*/basic', async (route) => {
    const response = await route.fetch();
    const body = await response.json();
    const backgroundUri = 'asset://stories/v3/cloud-painter-skybridge-bg.jpg';
    const characterUri = 'asset://stories/v3/cloud-painter-haeru.webp';
    body.image = { sourceType: 'LIBRARY', uri: backgroundUri, alt: '하늘다리 마을의 구름 화공 해루', status: 'READY', attemptCount: 0,
      matchQuality: 'EXACT', layers: [
        { uri: backgroundUri, role: 'BACKGROUND', alt: '밭을 비켜간 웃는 구름의 빗줄기' },
        { uri: characterUri, role: 'CHARACTER', alt: '구름 화공 해루' },
      ] };
    body.character.name = '해루';
    body.character.occupation = '구름 화공';
    body.character.favoritePlace = '하늘다리 마을';
    body.presentation.hero.title = '웃는 구름의 그늘';
    body.presentation.hero.signatureQuote = '당신이 웃는 얼굴을 그린 구름은 정말 웃었지만, 밭에는 비가 오지 않았습니다.';
    body.presentation.hero.lifeSummary = '그 삶에서 당신은 하늘다리 마을의 구름 화공 해루였습니다.';
    body.presentation.hero.backgroundUri = backgroundUri;
    body.presentation.hero.characterUri = characterUri;
    await route.fulfill({ response, json: body });
  });

  await page.goto('/');
  await page.getByRole('button', { name: /나의 전생 찾아보기/ }).click();
  await page.getByRole('button', { name: /질문 시작하기/ }).click();
  for (let stage = 1; stage <= 6; stage += 1) {
    await expect(page).toHaveURL(new RegExp(`/question/${stage}$`));
    await page.getByRole('button').first().click();
  }
  await expect(page).toHaveURL(/\/result$/);
  const background = page.getByRole('img', { name: '하늘다리 마을의 구름 화공 해루' }).first();
  const character = page.getByRole('img', { name: '전생 인물' });
  for (const viewport of [{ width: 320, height: 720 }, { width: 768, height: 1024 }]) {
    await page.setViewportSize(viewport);
    await expect.poll(async () => background.evaluate((element) => element instanceof HTMLImageElement && element.complete && element.naturalWidth >= 1024)).toBe(true);
    await expect.poll(async () => character.evaluate((element) => element instanceof HTMLImageElement && element.complete && element.naturalWidth >= 1024)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
    const quote = await page.getByTestId('result-signature-quote').boundingBox();
    const summary = await page.getByTestId('result-summary-panel').boundingBox();
    expect(quote!.y + quote!.height).toBeLessThan(summary!.y);
    await page.screenshot({ path: `output/playwright/story-cloud-painter-layered-${viewport.width}.png`, fullPage: true });
  }
});

test('keeps the room-seven clue visible behind a separate innkeeper layer', async ({ page }) => {
  await page.route('**/api/v1/results/*/basic', async (route) => {
    const response = await route.fetch();
    const body = await response.json();
    const backgroundUri = 'asset://stories/v3/room7-bidolgae-bg.jpg';
    const characterUri = 'asset://stories/v3/room7-iru.webp';
    body.image = { sourceType: 'LIBRARY', uri: backgroundUri, alt: '비돌개 고개 여관과 이루', status: 'READY', attemptCount: 0,
      matchQuality: 'EXACT', layers: [
        { uri: backgroundUri, role: 'BACKGROUND', alt: '비 오는 여관 복도' },
        { uri: characterUri, role: 'CHARACTER', alt: '여관 주인 이루' },
      ] };
    body.character.name = '이루';
    body.character.occupation = '여관 주인';
    body.character.favoritePlace = '비돌개 고개';
    body.presentation.hero.title = '7번 방의 두 번째 박수';
    body.presentation.hero.signatureQuote = '비어 있는 7번 방에서는 밤마다 박수 소리가 났습니다.';
    body.presentation.hero.lifeSummary = '그 삶에서 당신은 비돌개 고개에서 작은 여관을 지키던 이루였습니다.';
    body.presentation.hero.backgroundUri = backgroundUri;
    body.presentation.hero.characterUri = characterUri;
    await route.fulfill({ response, json: body });
  });

  await page.goto('/');
  await page.getByRole('button', { name: /나의 전생 찾아보기/ }).click();
  await page.getByRole('button', { name: /질문 시작하기/ }).click();
  for (let stage = 1; stage <= 6; stage += 1) {
    await expect(page).toHaveURL(new RegExp(`/question/${stage}$`));
    await page.getByRole('button').first().click();
  }
  await expect(page).toHaveURL(/\/result$/);
  const background = page.getByRole('img', { name: '비돌개 고개 여관과 이루' }).first();
  const character = page.getByRole('img', { name: '전생 인물' });
  for (const viewport of [{ width: 320, height: 720 }, { width: 768, height: 1024 }]) {
    await page.setViewportSize(viewport);
    await expect.poll(async () => background.evaluate((element) => element instanceof HTMLImageElement && element.complete && element.naturalWidth >= 1024)).toBe(true);
    await expect.poll(async () => character.evaluate((element) => element instanceof HTMLImageElement && element.complete && element.naturalWidth >= 1024)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
    const quote = await page.getByTestId('result-signature-quote').boundingBox();
    const summary = await page.getByTestId('result-summary-panel').boundingBox();
    expect(quote!.y + quote!.height).toBeLessThan(summary!.y);
    await page.screenshot({ path: `output/playwright/story-room7-layered-${viewport.width}.png`, fullPage: true });
  }
});

test('keeps the firework artisan and festival square as separate readable layers', async ({ page }) => {
  await page.route('**/api/v1/results/*/basic', async (route) => {
    const response = await route.fetch();
    const body = await response.json();
    const backgroundUri = 'asset://stories/v3/fireworks-seoritgol-bg.jpg';
    const characterUri = 'asset://stories/v3/fireworks-gaon.webp';
    body.image = { sourceType: 'LIBRARY', uri: backgroundUri, alt: '서릿골 축제와 불꽃 장인 가온', status: 'READY', attemptCount: 0,
      matchQuality: 'EXACT', layers: [
        { uri: backgroundUri, role: 'BACKGROUND', alt: '비가 그친 서릿골 축제 광장' },
        { uri: characterUri, role: 'CHARACTER', alt: '불꽃 장인 가온' },
      ] };
    body.character.name = '가온';
    body.character.occupation = '불꽃 장인';
    body.character.favoritePlace = '서릿골 축제 마을';
    body.presentation.hero.title = '첫 소리를 무서워한 장인';
    body.presentation.hero.signatureQuote = '모두가 가장 큰 불꽃을 기다릴 때, 그 불꽃을 만든 당신은 먼저 귀를 막았습니다.';
    body.presentation.hero.lifeSummary = '그 삶에서 당신은 서릿골 축제 마을의 불꽃 장인 가온이었습니다.';
    body.presentation.hero.backgroundUri = backgroundUri;
    body.presentation.hero.characterUri = characterUri;
    await route.fulfill({ response, json: body });
  });

  await page.goto('/');
  await page.getByRole('button', { name: /나의 전생 찾아보기/ }).click();
  await page.getByRole('button', { name: /질문 시작하기/ }).click();
  for (let stage = 1; stage <= 6; stage += 1) {
    await expect(page).toHaveURL(new RegExp(`/question/${stage}$`));
    await page.getByRole('button').first().click();
  }
  await expect(page).toHaveURL(/\/result$/);
  const background = page.getByRole('img', { name: '서릿골 축제와 불꽃 장인 가온' }).first();
  const character = page.getByRole('img', { name: '전생 인물' });
  for (const viewport of [{ width: 320, height: 720 }, { width: 768, height: 1024 }, { width: 1280, height: 720 }]) {
    await page.setViewportSize(viewport);
    await expect.poll(async () => background.evaluate((element) => element instanceof HTMLImageElement && element.complete && element.naturalWidth >= 1024)).toBe(true);
    await expect.poll(async () => character.evaluate((element) => element instanceof HTMLImageElement && element.complete && element.naturalWidth >= 1024)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
    const quote = await page.getByTestId('result-signature-quote').boundingBox();
    const summary = await page.getByTestId('result-summary-panel').boundingBox();
    expect(quote!.y + quote!.height).toBeLessThan(summary!.y);
    await page.screenshot({ path: `output/playwright/story-fireworks-layered-${viewport.width}.png`, fullPage: true });
  }
});

test('renders separate 1024px-class background and transparent character assets', async ({ page }) => {
  await page.route('**/api/v1/results/*/basic', async (route) => {
    const response = await route.fetch();
    const body = await response.json();
    const backgroundUri = 'asset://stories/v3/clown-market-bg-v2.jpg';
    const characterUri = 'asset://stories/v3/clown-rubo.webp';
    body.image = { sourceType: 'LIBRARY', uri: backgroundUri, alt: '바람골 장터와 광대 루보', status: 'READY', attemptCount: 0,
      matchQuality: 'EXACT', layers: [
        { uri: backgroundUri, role: 'BACKGROUND', alt: '바람골 장터' },
        { uri: characterUri, role: 'CHARACTER', alt: '광대 루보' },
      ] };
    body.character.name = '루보';
    body.character.occupation = '시장 광대';
    body.character.favoritePlace = '바람골 장터';
    body.presentation.hero.backgroundUri = backgroundUri;
    body.presentation.hero.characterUri = characterUri;
    await route.fulfill({ response, json: body });
  });

  await page.goto('/');
  await page.getByRole('button', { name: /나의 전생 찾아보기/ }).click();
  await page.getByRole('button', { name: /질문 시작하기/ }).click();
  for (let stage = 1; stage <= 6; stage += 1) {
    await expect(page).toHaveURL(new RegExp(`/question/${stage}$`));
    await page.getByRole('button').first().click();
  }
  await expect(page).toHaveURL(/\/result$/);
  const background = page.getByRole('img', { name: '바람골 장터와 광대 루보' }).first();
  const character = page.getByRole('img', { name: '전생 인물' });
  for (const viewport of [{ width: 320, height: 720 }, { width: 768, height: 1024 }, { width: 1280, height: 720 }]) {
    await page.setViewportSize(viewport);
    await expect.poll(async () => background.evaluate((element) => element instanceof HTMLImageElement && element.complete && element.naturalWidth >= 1024)).toBe(true);
    await expect.poll(async () => character.evaluate((element) => element instanceof HTMLImageElement && element.complete && element.naturalWidth >= 1024)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
    const quote = await page.getByTestId('result-signature-quote').boundingBox();
    const summary = await page.getByTestId('result-summary-panel').boundingBox();
    expect(quote!.y + quote!.height).toBeLessThan(summary!.y);
    await page.screenshot({ path: `output/playwright/story-clown-layered-${viewport.width}.png`, fullPage: true });
  }
});

for (const story of [
  { id: 'mirror', name: '모아', home: '비늘빛 골목', role: '거울 수선공', title: '마지막 조각의 얼굴',
    quote: '당신은 남의 거울은 모두 고쳤지만 자기 거울만 맞출 수 없었습니다.',
    backgroundUri: 'asset://stories/v3/mirror-scale-alley-bg.jpg', characterUri: 'asset://stories/v3/mirror-moa.webp',
    alt: '비늘빛 골목의 깨진 거울과 수선공 모아', backgroundAlt: '빠진 조각 너머로 골목이 보이는 거울 작업대', characterAlt: '거울 조각을 살피는 수선공 모아' },
  { id: 'herbalist', name: '라비', home: '안개숲 마을', role: '약초지기', title: '빨간 실의 비밀',
    quote: '마을의 모든 문에 빨간 실이 묶인 아침, 사람들은 당신을 마법사라고 불렀습니다.',
    backgroundUri: 'asset://stories/v3/herbalist-mistwood-bg.jpg', characterUri: 'asset://stories/v3/herbalist-ravi.webp',
    alt: '안개숲 마을의 빨간 실과 약초지기 라비', backgroundAlt: '비에 젖은 안개숲 마을과 실이 묶인 낮은 문턱', characterAlt: '쪽지와 빨간 실을 살피는 약초지기 라비' },
  { id: 'first-flight', name: '존 T. 대니얼스', home: '킬데빌힐스', role: '해안 구조대원', title: '열두 초의 셔터',
    quote: '하늘을 나는 기계를 찍어 달라는 부탁을 받은 날, 당신은 사진기를 한 번도 써 본 적이 없었습니다.',
    backgroundUri: 'asset://stories/v3/first-flight-kill-devil-bg.jpg', characterUri: 'asset://stories/v3/first-flight-john-daniels.webp',
    alt: '킬데빌힐스 첫 비행과 구조대원 존 T. 대니얼스', backgroundAlt: '나무 레일과 라이트 형제의 비행기', characterAlt: '사진기 셔터 고무 공을 쥔 구조대원' },
  { id: 'gyeongseong-shears', name: '김해원', home: '경성부 종로', role: '사설 전당포 운영자', title: '하루 늦은 가위',
    quote: '문 닫기 직전, 한 손님이 낡은 재봉 가위를 찾으러 왔습니다. 돈은 맞게 가져왔는데 날짜가 하루 늦었습니다.',
    backgroundUri: 'asset://stories/v3/gyeongseong-shears-jongno-bg.jpg', characterUri: 'asset://stories/v3/gyeongseong-shears-haewon.webp',
    alt: '1930년 경성 종로 전당포와 주인 김해원', backgroundAlt: '비 오는 종로 골목의 전당포와 가위·장부', characterAlt: '가위와 장부를 든 주인 김해원' },
]) test(`shows ${story.id} story art in separate readable layers`, async ({ page }) => {
  await page.route('**/api/v1/results/*/basic', async (route) => {
    const response = await route.fetch();
    const body = await response.json();
    body.image = { sourceType: 'LIBRARY', uri: story.backgroundUri, alt: story.alt, status: 'READY', attemptCount: 0,
      matchQuality: 'EXACT', layers: [
        { uri: story.backgroundUri, role: 'BACKGROUND', alt: story.backgroundAlt },
        { uri: story.characterUri, role: 'CHARACTER', alt: story.characterAlt },
      ] };
    body.character.name = story.name;
    body.character.gender = null;
    body.character.occupation = story.role;
    body.character.favoritePlace = story.home;
    body.presentation.hero.title = story.title;
    body.presentation.hero.signatureQuote = story.quote;
    body.presentation.hero.lifeSummary = `그 삶에서 당신은 ${story.home}의 ${story.role} ${story.name}였습니다.`;
    body.presentation.hero.backgroundUri = story.backgroundUri;
    body.presentation.hero.characterUri = story.characterUri;
    await route.fulfill({ response, json: body });
  });

  await page.goto('/');
  await page.getByRole('button', { name: /나의 전생 찾아보기/ }).click();
  await page.getByRole('button', { name: /질문 시작하기/ }).click();
  for (let stage = 1; stage <= 6; stage += 1) {
    await expect(page).toHaveURL(new RegExp(`/question/${stage}$`));
    await page.getByRole('button').first().click();
  }
  await expect(page).toHaveURL(/\/result$/);
  const background = page.getByRole('img', { name: story.alt }).first();
  const character = page.getByRole('img', { name: '전생 인물' });
  for (const viewport of [{ width: 320, height: 720 }, { width: 768, height: 1024 }]) {
    await page.setViewportSize(viewport);
    await expect.poll(async () => background.evaluate((element) => element instanceof HTMLImageElement && element.complete && element.naturalWidth >= 1024)).toBe(true);
    await expect.poll(async () => character.evaluate((element) => element instanceof HTMLImageElement && element.complete && element.naturalWidth >= 1024)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
    const quote = await page.getByTestId('result-signature-quote').boundingBox();
    const summary = await page.getByTestId('result-summary-panel').boundingBox();
    expect(quote).not.toBeNull();
    expect(summary).not.toBeNull();
    expect(quote!.y + quote!.height).toBeLessThan(summary!.y);
    await page.screenshot({ path: `output/playwright/story-${story.id}-layered-${viewport.width}.png`, fullPage: true });
  }
});
