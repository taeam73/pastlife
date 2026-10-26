import { expect, test } from '@playwright/test';
import type { ResultCore } from '@pastlife/scoring';
import { buildContentStoryResult } from '../apps/api/src/results/story-result.js';

const revisedStories = [
  { id: 'CLOWN', signal: 'speak', background: 'clown-market-bg-v2.jpg', character: 'clown-rubo.webp', name: '루보', life: '아버지가 공방을 접자', memory: '공방 이웃의 평가' },
  { id: 'ROOM7', signal: 'rest', background: 'room7-bidolgae-bg.jpg', character: 'room7-iru.webp', name: '이루', life: '조카에게 손님 장부', memory: '고개 아이의 기억' },
  { id: 'BLANK_ORDER', signal: 'notice', background: 'blank-order-fog-castle-bg.jpg', character: 'blank-order-sea.webp', name: '세아', life: '유진과 쉬는 날', memory: '친구 유진의 기억' },
  { id: 'SILENT_BELL', signal: 'notice', background: 'silent-bell-reed-river-bg-v2.jpg', character: 'silent-bell-daon.webp', name: '다온', life: '그물을 엮는 소미', memory: '친구 소미의 평가' },
  { id: 'NIGHT_GUIDE', signal: 'protect', background: 'night-guide-soldeung-fork-bg-v3.jpg', character: 'night-guide-maru-v2.webp', name: '마루', life: '누이의 손목이 아픈 계절', memory: '후배 안내자의 평가' },
  { id: 'MIRROR', signal: 'repair', background: 'mirror-scale-alley-bg.jpg', character: 'mirror-moa.webp', name: '모아', life: '연주의 가게가 골목 안쪽', memory: '친구 연주의 평가' },
  { id: 'HERBALIST', signal: 'notice', background: 'herbalist-mistwood-bg.jpg', character: 'herbalist-ravi-v2.webp', name: '라비', life: '할머니가 세상을 떠난 뒤', memory: '이웃 은비의 기억' },
  { id: 'DRAGON_DREAM', signal: 'notice', background: 'dragon-dream-library-bg.jpg', character: 'dragon-dream-orr.webp', name: '오르', life: '라엔과 낡은 기록 공책', memory: '마을 사람의 평가' },
  { id: 'LAST_SIGNAL', signal: 'connect', background: 'last-signal-yeoulho-bg.jpg', character: 'last-signal-hangyeol.webp', name: '한결', life: '동생에게 늦게 닿을 노래', memory: '동생의 기억' },
  { id: 'SHADE_TENT', signal: 'repair', background: 'shade-tent-daystar-bg.jpg', character: 'shade-tent-iro.webp', name: '이로', life: '이웃 단비와 공동 천막', memory: '이웃 단비의 평가' },
  { id: 'REVERSE_MAP', signal: 'explore', background: 'reverse-map-droplet-sea-bg.jpg', character: 'reverse-map-nuri.webp', name: '누리', life: '소라와 지내며 짧은 항로', memory: '친구 소라의 기억' },
  { id: 'SHORE_ROCK', signal: 'rest', background: 'shore-rock-baramteok-bg.jpg', character: 'shore-rock-padoteum.webp', name: '파도틈', life: '홈 둘레가 닳아', memory: '어부의 평가', secondPage: '썰물 때', thirdPage: '오래 머문 것' },
  { id: 'TASTER', signal: 'notice', background: 'taster-pomegranate-castle-bg.jpg', character: 'taster-yeorin.webp', name: '여린', life: '쉬는 날 시장을 돌며', memory: '후임의 기억' },
  { id: 'CLOUD_PAINTER', signal: 'repair', background: 'cloud-painter-skybridge-bg.jpg', character: 'cloud-painter-haeru.webp', name: '해루', life: '첫 스승이 일을 그만두자', memory: '제자의 평가' },
  { id: 'FESTIVAL_KING', signal: 'speak', background: 'festival-king-dolbit-castle-bg-v2.jpg', character: 'festival-king-dogyeom.webp', name: '도겸', life: '배우단 동료와 손님이 만든', memory: '제자의 평가' },
  { id: 'SNOW_REFEREE', signal: 'notice', background: 'snow-referee-snowhill-bg-v3.jpg', character: 'snow-referee-miru.webp', name: '미루', life: '낡은 썰매를 다시 고쳐', memory: '후배 심판의 평가' },
  { id: 'SHADOW_TAILOR', signal: 'repair', background: 'shadow-tailor-moonthread-bg.jpg', character: 'shadow-tailor-narin.webp', name: '나린', life: '스승의 검은 실통', memory: '이웃 재단사의 평가' },
  { id: 'UNDERWATER_SCALE', signal: 'notice', background: 'underwater-scale-bluespring-bg.jpg', character: 'underwater-scale-aram.webp', name: '아람', life: '조개 가게 일을 도우며', memory: '가족의 기억' },
  { id: 'FIREWORKS', signal: 'protect', background: 'fireworks-seoritgol-bg.jpg', character: 'fireworks-gaon.webp', name: '가온', life: '공방 가족과 축제 종이', memory: '공방 가족의 평가' },
  { id: 'DOORLESS_KEEPER', signal: 'notice', background: 'doorless-keeper-glass-forest-bg.jpg', character: 'doorless-keeper-seohoo.webp', name: '서후', life: '창고의 낡은 선반', memory: '젊은 안내자의 평가' },
  { id: 'LOST_AUTUMN', signal: 'notice', background: 'lost-autumn-four-seasons-bg.jpg', character: 'lost-autumn-on.webp', name: '온', life: '낡은 달력장을 묶어', memory: '후임의 평가' },
  { id: 'THEATRE_VILLAIN', signal: 'speak', background: 'theatre-villain-black-curtain-bg.jpg', character: 'theatre-villain-bian.webp', name: '비안', life: '천막을 함께 세움', memory: '동료 배우의 평가' },
  { id: 'WINDMILL', signal: 'protect', background: 'windmill-kallen-plateau-bg.jpg', character: 'windmill-roa.webp', name: '로아', life: '작은 풍차 주머니', memory: '후임의 평가' },
  { id: 'HEAVY_BOX', signal: 'notice', background: 'heavy-box-jagalnaru-stage-bg.jpg', character: 'heavy-box-haemin.webp', name: '해민', life: '공연 전 소품을 함께', memory: '젊은 짐꾼의 평가' },
  { id: 'GRAVITY_SEEDS', signal: 'protect', background: 'gravity-seeds-ramo-station-bg.jpg', character: 'gravity-seeds-mira.webp', name: '미라', life: '씨앗 봉투 묶는 법', memory: '후임의 기억' },
  { id: 'PAID_LOSS', signal: 'release', background: 'paid-loss-ledos-arena-bg.jpg', character: 'paid-loss-adel.webp', name: '아델', life: '작은 경기장을 돌며', memory: '동료의 평가' },
  { id: 'WARM_STONES', signal: 'repair', background: 'warm-stones-solmaru-bg.jpg', character: 'warm-stones-danu.webp', name: '단우', life: '동생과 화덕을 돌보며', memory: '동생의 기억' },
  { id: 'APOLOGY_COURIER', signal: 'connect', background: 'apology-courier-lamer-bg.jpg', character: 'apology-courier-theo.webp', name: '테오', life: '새 시간표를 배달 장부', memory: '견습의 기억' },
  { id: 'FIRST_FLIGHT_CAMERA', signal: 'notice', background: 'first-flight-kill-devil-bg.jpg', character: 'first-flight-john-daniels.webp', name: '존 T. 대니얼스', life: '여섯 자녀와 생활', memory: '주택 사적지 자료의 평가', secondPage: '기록된 모습', thirdPage: '가까운 사람(기록)' },
  { id: 'GYEONGSEONG_SHEARS', signal: 'notice', background: 'gyeongseong-shears-jongno-bg.jpg', character: 'gyeongseong-shears-haewon.webp', name: '김해원', life: '다음 세대에 전한다', memory: '가족의 평가 · 창작' },
  { id: 'MOON_SIGNAL_WINDOW', signal: 'connect', background: 'moon-signal-parkes-hall-bg.jpg', character: 'moon-signal-may.webp', name: '메이', life: '가게를 젊은 수리공에게', memory: '후배의 평가 · 창작' },
  { id: 'TIDE_MARK', signal: 'notice', background: 'tide-mark-estuary-bg.jpg', character: 'tide-mark-rao.webp', name: '라오', life: '가족과 강가를 걸으며', memory: '후임의 평가' },
  { id: 'THIRD_KNOCK', signal: 'connect', background: 'third-knock-orsi-observatory-bg.jpg', character: 'third-knock-rina.webp', name: '리나', life: '낮에 지도와 낡은 문을', memory: '후배 경비원의 평가' },
  { id: 'MARKET_CAT_LOT', signal: 'release', background: 'market-cat-lot-toram-bg-v2.jpg', character: 'market-cat-lot-mojin.webp', name: '모진', life: '도희의 과일 가판과', memory: '후임 온재의 평가' },
  { id: 'TWELVE_LEFT_SHOES', signal: 'repair', background: 'twelve-left-shoes-biel-workshop-bg.jpg', character: 'twelve-left-shoes-darin.webp', name: '다린', life: '공방 일을 후배에게', memory: '이웃 소만의 평가' },
  { id: 'RAIN_GUTTER', signal: 'connect', background: 'rain-gutter-rebon-bg-v2.jpg', character: 'rain-gutter-serin.webp', name: '세린', life: '높은 지붕 일을 후배에게', memory: '동료 보람의 평가' },
  { id: 'UNSEEN_PORTRAIT', signal: 'notice', background: 'unseen-portrait-lumi-studio-bg.jpg', character: 'unseen-portrait-doyun.webp', name: '도윤', life: '제자 하리에게 공방을', memory: '제자 하리의 평가' },
  { id: 'RUNAWAY_WHALE_FLOAT', signal: 'release', background: 'runaway-whale-float-teban-bg.jpg', character: 'runaway-whale-float-ujin.webp', name: '우진', life: '공방을 하니에게 넘기고', memory: '견습 하니의 평가' },
  { id: 'CROOKED_KITE', signal: 'notice', background: 'crooked-kite-bar-bg-v3.jpg', character: 'crooked-kite-nari.webp', name: '나리', life: '공방을 제자 미루에게', memory: '제자 미루의 평가' },
  { id: 'HOLLOW_STAGE_WALL', signal: 'speak', background: 'hollow-stage-wall-seon-bg.jpg', character: 'hollow-stage-wall-minrok.webp', name: '민록', life: '무대 앞 공연을 줄이고', memory: '목수 보현의 평가' },
  { id: 'TWO_FINAL_FERRIES', signal: 'connect', background: 'two-final-ferries-durim-bg-v2.jpg', character: 'two-final-ferries-ajeong.webp', name: '아정', life: '어머니의 낡은 노를', memory: '젊은 통역사의 기억' },
  { id: 'FLOATING_ORCHARD', signal: 'notice', background: 'floating-orchard-belo-bg.jpg', character: 'floating-orchard-ryeowon.webp', name: '려원', life: '현장 밧줄 일을 줄이고', memory: '동료 서온의 평가' },
  { id: 'SILVER_REED_MONSTER', signal: 'notice', background: 'silver-reed-monster-belna-bg.jpg', character: 'silver-reed-monster-dohu.webp', name: '도후', life: '아이와 어민에게', memory: '어린 길잡이의 기억' },
  { id: 'GOLDEN_LIE_SLIP', signal: 'notice', background: 'golden-lie-slip-nasel-bg.jpg', character: 'golden-lie-slip-yeodam.webp', name: '여담', life: '가게 운영을 보리에게', memory: '빵 장수 소미의 기억' },
] as const;

for (const story of revisedStories) {
  test(`${story.id} revised 01/03/04 is readable on phone and tablet`, async ({ page }) => {
    const backgroundUri = `asset://stories/v3/${story.background}`;
    const characterUri = `asset://stories/v3/${story.character}`;
    const image = {
      sourceType: 'LIBRARY' as const, uri: backgroundUri, alt: `${story.name}의 이야기 배경`,
      status: 'READY' as const, attemptCount: 0, matchQuality: 'EXACT' as const,
      layers: [
        { uri: backgroundUri, role: 'BACKGROUND' as const, alt: '이야기 배경' },
        { uri: characterUri, role: 'CHARACTER' as const, alt: story.name },
      ],
    };
    const core = { storyId: story.id, storySignals: [story.signal], recordNo: 1 } as ResultCore;
    const result = buildContentStoryResult(`legacy-profile-${story.id}`, core, image);
    await page.route('**/api/v1/results/*/basic', (route) => route.fulfill({ json: result }));
    await page.goto('/');
    await page.getByRole('button', { name: /나의 전생 찾아보기/ }).click();
    await page.getByRole('button', { name: /질문 시작하기/ }).click();
    for (let stage = 1; stage <= 6; stage += 1) {
      await expect(page).toHaveURL(new RegExp(`/question/${stage}$`));
      await page.getByRole('button').first().click();
    }
    await expect(page).toHaveURL(/\/result$/);
    for (const viewport of [{ width: 320, height: 720 }, { width: 768, height: 1024 }]) {
      await page.setViewportSize(viewport);
      await expect(page.getByTestId('result-summary-page')).toContainText(story.name);
      for (const phrase of ['secondPage' in story ? story.secondPage : '성격 ·', 'thirdPage' in story ? story.thirdPage : '가까운 사람 ·']) {
        await page.getByRole('button', { name: '다음 인물 소개 페이지' }).click();
        await expect(page.getByTestId('result-summary-page')).toContainText(phrase);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
      await page.screenshot({ path: `output/playwright/original-profile-${story.id}-${viewport.width}.png`, fullPage: true });
      for (const [chapter, phrase] of [[3, story.life], [4, story.memory]] as const) {
        await page.getByRole('button', { name: new RegExp(`^${chapter}장 .* 보기$`) }).click();
        let found = false;
        for (let pageNo = 0; pageNo < 30; pageNo += 1) {
          const content = await page.getByTestId('chapter-reader-panel').textContent();
          expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
          if (content?.includes(phrase)) { found = true; break; }
          const next = page.getByRole('button', { name: '다음 글 페이지' });
          if (!await next.isEnabled()) break;
          await next.click();
        }
        expect(found, `${story.id} chapter ${chapter} should contain ${phrase}`).toBe(true);
      }
      await page.getByRole('button', { name: /^1장 .* 보기$/ }).click();
    }
  });
}
