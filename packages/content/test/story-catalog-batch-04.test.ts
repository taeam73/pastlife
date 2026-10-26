import { describe, expect, it } from 'vitest';
import { storyCards } from '../src/story-catalog.js';
import { storyCardsBatch04 } from '../src/story-catalog-batch-04.js';
import { findStoryManuscript, renderStoryEpisode } from '../src/story-manuscripts.js';

describe('fourth story-library group', () => {
  it('grounds the left-shoe workshop rush in its dated life, practical repair and three answer branches', () => {
    const card = storyCardsBatch04.find(({ id }) => id === 'TWELVE_LEFT_SHOES');
    const manuscript = findStoryManuscript('TWELVE_LEFT_SHOES');
    expect(storyCards.length).toBeGreaterThanOrEqual(44);
    expect(card?.setting).toEqual({ worldName: '미덴', year: '행진력 204년 초가을', polity: '미로 상인연맹', region: '도란 왕국 동쪽 비엘 항구 자유시', gender: '여성' });
    expect(card?.life).toContain('같은 모양의 부드러운 밑창');
    expect(card?.turn).toContain('왼발 견본 하나');
    expect(card?.decision).toContain('소만');
    expect(card?.cost).toContain('값을 덜');
    expect(manuscript?.identity.ageAtDeath).toBe(68);
    expect(manuscript?.timeline.find(({ when }) => when === '39세')?.event).toContain('스물네 짝');
    for (const signal of card!.signals) {
      const episode = renderStoryEpisode(manuscript!, signal);
      expect(episode).toContain('스물네 짝 모두 왼발');
      expect(episode).toContain('오른발 견본');
      expect(episode).toContain('다린은 이후에도');
      expect(episode.length).toBeGreaterThan(1700);
    }
  });

  it('keeps Serin’s split rain route, accountability and full lifespan consistent across answer branches', () => {
    const card = storyCardsBatch04.find(({ id }) => id === 'RAIN_GUTTER');
    const manuscript = findStoryManuscript('RAIN_GUTTER');
    expect(card?.setting).toEqual({ worldName: '루안', year: '빗길력 172년 늦봄', polity: '테란 고원연맹', region: '오르말 왕국 남동쪽 레본 자치시', gender: '여성' });
    expect(card?.life).toContain('상단과 하단');
    expect(card?.turn).toContain('상단 저장조');
    expect(card?.decision).toContain('봉인을 끊');
    expect(card?.cost).toContain('수당을 깎');
    expect(manuscript?.identity.ageAtDeath).toBe(73);
    expect(manuscript?.timeline.find(({ when }) => when === '52세')?.event).toContain('첫비');
    for (const signal of card!.signals) {
      const episode = renderStoryEpisode(manuscript!, signal);
      expect(episode).toContain('판이 가운데로 돌아왔습니다');
      expect(episode).toContain('한 철 점검 수당');
      expect(episode).toContain('두 저장조');
      expect(episode.length).toBeGreaterThan(1700);
    }
  });

  it('keeps Doyun honest about the unseen face and preserves three memories without a false likeness', () => {
    const card = storyCardsBatch04.find(({ id }) => id === 'UNSEEN_PORTRAIT');
    const manuscript = findStoryManuscript('UNSEEN_PORTRAIT');
    expect(card?.setting).toEqual({ worldName: '오벨', year: '화랑력 286년 초겨울', polity: '세하 도시연합', region: '렌 왕국 북서쪽 루미 자유시', gender: '남성' });
    expect(card?.turn).toContain('서로 다른 시기');
    expect(card?.cost).toContain('나무틀');
    expect(manuscript?.identity.ageAtDeath).toBe(79);
    expect(manuscript?.timeline.find(({ when }) => when === '64세')?.event).toContain('미라');
    for (const signal of card!.signals) {
      const episode = renderStoryEpisode(manuscript!, signal);
      expect(episode).toContain('루미에는 사진이 없었습니다');
      expect(episode).toContain('얼굴이 꼭 같다고 장담할 수는 없습니다');
      expect(episode).toContain('도윤은 이후에도');
      expect(episode.length).toBeGreaterThan(1900);
    }
  });

  it('makes Ujin redirect the float at a visible cost rather than magically stopping it', () => {
    const card = storyCardsBatch04.find(({ id }) => id === 'RUNAWAY_WHALE_FLOAT');
    const manuscript = findStoryManuscript('RUNAWAY_WHALE_FLOAT');
    expect(card?.setting).toEqual({ worldName: '브라온', year: '행렬력 123년 늦여름', polity: '도르 평원연맹', region: '루안 공국 서쪽 테반 자치시', gender: '남성' });
    expect(card?.life).toContain('쐐기');
    expect(card?.turn).toContain('견인줄');
    expect(card?.decision).toContain('꼬리');
    expect(card?.cost).toContain('심사에서 제외');
    expect(manuscript?.identity.ageAtDeath).toBe(73);
    expect(manuscript?.timeline.find(({ when }) => when === '43세')?.event).toContain('종이 고래');
    for (const signal of card!.signals) {
      const episode = renderStoryEpisode(manuscript!, signal);
      expect(episode).toContain('앞에 서지 마');
      expect(episode).toContain('꼬리의 나무틀이 목책에 걸려');
      expect(episode).toContain('우진은 그 뒤에도');
      expect(episode.length).toBeGreaterThan(1800);
    }
  });

  it('grounds Nari’s kite victory in the declared target, repeated wind trials and lasting sibling tension', () => {
    const card = storyCardsBatch04.find(({ id }) => id === 'CROOKED_KITE');
    const manuscript = findStoryManuscript('CROOKED_KITE');
    expect(card?.setting).toEqual({ worldName: '아센', year: '연력 207년 초봄', polity: '하진 산간동맹', region: '마셀 고원국 남쪽 바르 자유시', gender: '여성' });
    expect(card?.life).toContain('주황색 천 표적');
    expect(card?.turn).toContain('옆바람');
    expect(card?.cost).toContain('축하하지 않았습니다');
    expect(manuscript?.identity.ageAtDeath).toBe(75);
    expect(manuscript?.timeline.find(({ when }) => when === '19세')?.event).toContain('봄 대회');
    for (const signal of card!.signals) {
      const episode = renderStoryEpisode(manuscript!, signal);
      expect(episode).toContain('두 바위 기둥 꼭대기 사이');
      expect(episode).toContain('오른쪽 꼬리가 손 한 뼘 짧았습니다');
      expect(episode).toContain('도겸은 축하한다는 말을 하지 않았습니다');
      expect(episode).toContain('나리는 뒤에 바르에 작은 연 공방을 열었습니다');
      expect(episode.length).toBeGreaterThan(1700);
    }
  });

  it('keeps Minrok’s stage reveal grounded in a real door and shared credit with a real cost', () => {
    const card = storyCardsBatch04.find(({ id }) => id === 'HOLLOW_STAGE_WALL');
    const manuscript = findStoryManuscript('HOLLOW_STAGE_WALL');
    expect(card?.setting).toEqual({ worldName: '노이르', year: '막력 114년 늦가을', polity: '라단 순회도시연합', region: '게린 왕국 남쪽 세온 자유시', gender: '남성' });
    expect(card?.life).toContain('좁은 문');
    expect(card?.decision).toContain('보현이 경첩');
    expect(card?.cost).toContain('공연료를 깎았습니다');
    expect(manuscript?.identity.ageAtDeath).toBe(76);
    expect(manuscript?.timeline.find(({ when }) => when === '37세')?.event).toContain('두 사람의 공로');
    for (const signal of card!.signals) {
      const episode = renderStoryEpisode(manuscript!, signal);
      expect(episode).toContain('벽 한가운데에 있었습니다');
      expect(episode).toContain('저도 그동안 이걸 제 벽이라고만 불렀습니다');
      expect(episode).toContain('몇 장 팔리지 않았습니다');
      expect(episode).toContain('민록은 그 뒤에도');
      expect(episode.length).toBeGreaterThan(2000);
    }
  });

  it('makes Ajeong resolve the two bell times without erasing her own responsibility or the merchants’ loss', () => {
    const card = storyCardsBatch04.find(({ id }) => id === 'TWO_FINAL_FERRIES');
    const manuscript = findStoryManuscript('TWO_FINAL_FERRIES');
    expect(card?.setting).toEqual({ worldName: '세라운', year: '도하력 91년 늦봄', polity: '이솔 강연합', region: '하르 산국 동쪽 두림 자유항과 모렌 나루', gender: '여성' });
    expect(card?.life).toContain('한 시간쯤 뒤');
    expect(card?.decision).toContain('지시에 따라');
    expect(card?.cost).toContain('채소 일부');
    expect(manuscript?.identity.ageAtDeath).toBe(78);
    expect(manuscript?.timeline.find(({ when }) => when === '46세')?.event).toContain('마지막 배');
    for (const signal of card!.signals) {
      const episode = renderStoryEpisode(manuscript!, signal);
      expect(episode).toContain('두림은 해 질 무렵 저녁 종을 두 번');
      expect(episode).toContain('아직 한 줄이 비어 있었습니다');
      expect(episode).toContain('아래쪽 채소는 이미 상해');
      expect(episode).toContain('아정은 오래도록 강을 건넜습니다');
      expect(episode.length).toBeGreaterThan(2200);
    }
  });

  it('grounds Ryeowon’s floating-island rescue in prior tethers, a shared anchor, and lasting damage', () => {
    const card = storyCardsBatch04.find(({ id }) => id === 'FLOATING_ORCHARD');
    const manuscript = findStoryManuscript('FLOATING_ORCHARD');
    expect(card?.setting).toEqual({ worldName: '메로', year: '뿌리력 184년 한여름', polity: '하이람 섬연합', region: '테른 만국 해안 위 벨로 부유과수원', gender: '여성' });
    expect(card?.life).toContain('두 섬을 잇는 낡은 매듭');
    expect(card?.decision).toContain('공동 구조 돌닻');
    expect(card?.cost).toContain('수확 상자');
    expect(manuscript?.identity.ageAtDeath).toBe(71);
    expect(manuscript?.timeline.find(({ when }) => when === '33세')?.event).toContain('묘목섬');
    for (const signal of card!.signals) {
      const episode = renderStoryEpisode(manuscript!, signal);
      expect(episode).toContain('같은 높이의 고정 바위섬');
      expect(episode).toContain('큰 작업섬의 돌닻줄을 풀면');
      expect(episode).toContain('묘목섬은 절벽에 닿지 않았습니다');
      expect(episode).toContain('려원은 그 뒤로');
      expect(episode.length).toBeGreaterThan(2200);
    }
  });

  it('reveals Dohu’s lake monster through planted clues and keeps the fishers’ real losses', () => {
    const card = storyCardsBatch04.find(({ id }) => id === 'SILVER_REED_MONSTER');
    const manuscript = findStoryManuscript('SILVER_REED_MONSTER');
    expect(card?.setting).toEqual({ worldName: '누멘', year: '갈대력 88년 초여름', polity: '루키 호수동맹', region: '마토 숲공국 동쪽 은갈대 호수 벨나 수상마을', gender: '남성' });
    expect(card?.turn).toContain('붉은 유리등');
    expect(card?.decision).toContain('그물을 자르는 일');
    expect(card?.cost).toContain('그물 값');
    expect(manuscript?.identity.ageAtDeath).toBe(71);
    expect(manuscript?.timeline.find(({ when }) => when === '47세')?.event).toContain('그물');
    for (const signal of card!.signals) {
      const episode = renderStoryEpisode(manuscript!, signal);
      expect(episode).toContain('유리에 손톱만 한 흠집');
      expect(episode).toContain('그물 끝에는 부두 말뚝에서 떨어진 나무 가시');
      expect(episode).toContain('현상금도 안 받을 거예요');
      expect(episode).toContain('도후는 호수의 북쪽 갈대밭');
      expect(episode.length).toBeGreaterThan(2100);
    }
  });

  it('keeps Yeodam’s one-reader rule, impulsive choice and bakery costs consistent', () => {
    const card = storyCardsBatch04.find(({ id }) => id === 'GOLDEN_LIE_SLIP');
    const manuscript = findStoryManuscript('GOLDEN_LIE_SLIP');
    expect(card?.setting).toEqual({ worldName: '미라온', year: '장날력 312년 늦여름', polity: '오벤 상인도시연합', region: '루호 산국 남서쪽 나셀 자유시장', gender: '여성' });
    expect(card?.life).toContain('한 사람');
    expect(card?.cost).toContain('빵값');
    expect(manuscript?.identity.ageAtDeath).toBe(76);
    expect(manuscript?.timeline.find(({ when }) => when === '42세')?.event).toContain('빵 종이');
    for (const signal of card!.signals) {
      const episode = renderStoryEpisode(manuscript!, signal);
      expect(episode).toContain('빵의 주인도, 빵값도');
      expect(episode).toContain('그냥 찢을 수도 있었잖아요');
      expect(episode).toContain('없어진 빵 둘과 버린 빵 셋');
      expect(episode).toContain('보리가 공동 주인이 된 뒤에도 여담은 가게에 나와');
      expect(episode).toContain('소미는 그 모임에 오지 않았습니다');
      expect(episode.length).toBeGreaterThan(2200);
    }
  });
});
