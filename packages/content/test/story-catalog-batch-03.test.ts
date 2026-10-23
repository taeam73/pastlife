import { describe, expect, it } from 'vitest';
import { storyCards } from '../src/story-catalog.js';
import { storyCardsBatch03 } from '../src/story-catalog-batch-03.js';

describe('third story-library group', () => {
  it('starts with a complete space life whose setting drives the choice', () => {
    const card = storyCardsBatch03.find(({ id }) => id === 'GRAVITY_SEEDS');
    expect(card).toBeDefined();
    expect(card!.setting).toEqual({
      worldName: '세라즈', year: '항로력 406년', polity: '궤도원 연합',
      region: '네마 항성계 라모 궤도 고리 4구역', gender: '여성',
    });
    expect(storyCards.length).toBeGreaterThanOrEqual(44);
    expect(card!.life).toContain('세 분');
    expect(card!.turn).toContain('발아실 한 칸');
    expect(card!.decision).toContain('잎채소 씨앗');
    expect(card!.cost).toContain('기념일의 나무');
    for (const signal of card!.signals) {
      expect(card!.signalMoments[signal]?.length).toBeGreaterThan(35);
    }
  });

  it('has a complete contest life grounded in its civic game setting', () => {
    const card = storyCardsBatch03.find(({ id }) => id === 'PAID_LOSS');
    expect(card?.setting).toEqual({
      worldName: '엔바르', year: '공개력 218년', polity: '레도스 자유시',
      region: '소르 왕국 남쪽의 레도스 실내 돌판 경기장', gender: '여성',
    });
    expect(card!.life).toContain('세 갈래 길');
    expect(card!.turn).toContain('비워 두었습니다');
    expect(card!.decision).toContain('계약을 돌려주었습니다');
    expect(card!.cost).toContain('다음 출전');
    for (const signal of card!.signals) expect(card!.signalMoments[signal]?.length).toBeGreaterThan(35);
  });

  it('keeps the warming-stone delivery grounded in its setting and visible answer moments', () => {
    const card = storyCardsBatch03.find(({ id }) => id === 'WARM_STONES');
    expect(card?.setting).toEqual({
      worldName: '오르넬', year: '화덕력 132년 늦봄', polity: '비담 연맹',
      region: '솔마루 골짜기', gender: '남성',
    });
    expect(card!.life).toContain('줄무늬 끈');
    expect(card!.turn).toContain('바구니를 바꿔');
    expect(card!.decision).toContain('빵 주문을 채웠고');
    expect(card!.cost).toContain('빵은 늦게');
    for (const signal of card!.signals) expect(card!.signalMoments[signal]?.length).toBeGreaterThan(35);
  });

  it('promotes the apology courier only with a coherent crossing cost', () => {
    const card = storyCardsBatch03.find(({ id }) => id === 'APOLOGY_COURIER');
    expect(card?.setting).toEqual({
      worldName: '온베르', year: '다리력 156년', polity: '페른 수로동맹',
      region: '붉은 대공국과 남쪽 섬들 사이 라메르 운하', gender: '남성',
    });
    expect(storyCards.some(({ id }) => id === 'APOLOGY_COURIER')).toBe(true);
    expect(card?.turn).toContain('갈라진 쇠쐐기');
    expect(card?.decision).toContain('작은 배');
    expect(card?.cost).toContain('삯');
    expect(card?.after).toContain('새 쐐기');
    for (const signal of card!.signals) expect(card!.signalMoments[signal]?.length).toBeGreaterThan(35);
  });

  it('keeps the first-flight helper grounded in documented action and marked imagination', () => {
    const card = storyCardsBatch03.find(({ id }) => id === 'FIRST_FLIGHT_CAMERA');
    expect(card?.setting).toEqual({
      worldName: '지구', year: '1903년 12월 17일', polity: '미국',
      region: '노스캐롤라이나주 킬데빌힐스 해안', gender: '남성',
    });
    expect(card?.identityLine).toContain('상상해 쓴 이야기');
    expect(storyCards.some(({ id }) => id === 'FIRST_FLIGHT_CAMERA')).toBe(true);
    expect(card?.decision).toContain('고무 공을 눌렀어요');
    expect(card?.cost).toContain('돌풍');
    expect(card?.after).toContain('기록되지 않았습니다');
    for (const signal of card!.signals) expect(card!.signalMoments[signal]?.length).toBeGreaterThan(35);
  });

  it('keeps the fictional Jongno pawnbroker decision and its limits visible', () => {
    const card = storyCardsBatch03.find(({ id }) => id === 'GYEONGSEONG_SHEARS');
    expect(card?.setting).toEqual({
      worldName: '지구', year: '1930년 봄', polity: '일제 식민 통치 아래 조선',
      region: '경성부 청계천 북쪽 종로 골목', gender: '여성',
    });
    expect(card?.identityLine).toContain('가상의 인물');
    expect(storyCards.some(({ id }) => id === 'GYEONGSEONG_SHEARS')).toBe(true);
    expect(card?.turn).toContain('하루 차이');
    expect(card?.decision).toContain('자기 수입');
    expect(card?.cost).toContain('줄어든 수입');
    expect(card?.secondLook).toContain('불리한 규정');
    for (const signal of card!.signals) expect(card!.signalMoments[signal]?.length).toBeGreaterThan(35);
  });

  it('keeps the lunar broadcast beside a fictional repairer with a visible cost', () => {
    const card = storyCardsBatch03.find(({ id }) => id === 'MOON_SIGNAL_WINDOW');
    expect(card?.setting).toEqual({ worldName: '지구', year: '1969년 7월 21일', polity: '오스트레일리아', region: '뉴사우스웨일스주 파크스 마을', gender: '여성' });
    expect(card?.identityLine).toContain('가상의');
    expect(card?.decision).toContain('전시용 수상기');
    expect(card?.cost).toContain('판매를 미뤘어요');
    expect(storyCards.some(({ id }) => id === 'MOON_SIGNAL_WINDOW')).toBe(true);
    for (const signal of card!.signals) expect(card!.signalMoments[signal]?.length).toBeGreaterThan(35);
  });

  it('grounds the estuary warning in its three marks and keeps the market cost', () => {
    const card = storyCardsBatch03.find(({ id }) => id === 'TIDE_MARK');
    expect(card?.setting).toEqual({ worldName: '마렌', year: '눈금력 94년 초여름', polity: '오란 하구 연맹', region: '너울 자치령 하류 칠물문 자유시', gender: '남성' });
    expect(card?.life).toContain('파란 선이 세 개');
    expect(card?.turn).toContain('가운데 선을 덮은');
    expect(card?.decision).toContain('긁개');
    expect(card?.cost).toContain('축제 장사는 일찍 끝났어요');
    expect(storyCards.some(({ id }) => id === 'TIDE_MARK')).toBe(true);
    for (const signal of card!.signals) expect(card!.signalMoments[signal]?.length).toBeGreaterThan(35);
  });

  it('keeps the third knock distinct from the guard’s trick and leaves a cost', () => {
    const card = storyCardsBatch03.find(({ id }) => id === 'THIRD_KNOCK');
    expect(card?.setting).toEqual({ worldName: '벨누', year: '별력 83년 늦가을', polity: '오르시 자유시', region: '누마르 산악연합 남쪽 경계 오르시 서쪽 언덕', gender: '여성' });
    expect(card?.opening).toContain('세 번째 노크');
    expect(card?.turn).toContain('배수관은 왼쪽 벽');
    expect(card?.decision).toContain('제가 만든 소리');
    expect(card?.cost).toContain('수리비 일부');
    expect(storyCards.some(({ id }) => id === 'THIRD_KNOCK')).toBe(true);
    for (const signal of card!.signals) expect(card!.signalMoments[signal]?.length).toBeGreaterThan(35);
  });

  it('makes the cat lottery a complete, reachable market life', () => {
    const card = storyCardsBatch03.find(({ id }) => id === 'MARKET_CAT_LOT');
    expect(card?.setting).toEqual({ worldName: '하민', year: '나루력 161년 초겨울', polity: '여산 강연맹', region: '솔켄 공국 남쪽 경계의 토람 자유시장', gender: '남성' });
    expect(card?.turn).toContain('햇살');
    expect(card?.decision).toContain('표 다섯 장');
    expect(card?.cost).toContain('수당');
    expect(storyCards.some(({ id }) => id === 'MARKET_CAT_LOT')).toBe(true);
    for (const signal of card!.signals) expect(card!.signalMoments[signal]?.length).toBeGreaterThan(35);
  });
});
