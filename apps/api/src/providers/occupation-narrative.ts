import { historicalOccupations } from '@pastlife/content';
import type { ResultCore } from '@pastlife/scoring';
import type { StoryProfile } from '../story-profile.js';

const aliases: Record<string, string> = {
  OCC_01: 'OCC_SCRIBE', OCC_02: 'OCC_TEACHER', OCC_03: 'OCC_CEREMONIAL', OCC_04: 'OCC_NAVIGATOR',
  OCC_05: 'OCC_NAVIGATOR', OCC_06: 'OCC_ARTISAN', OCC_07: 'OCC_HEALER', OCC_08: 'OCC_MESSENGER',
};

export function occupationLabel(occupationId: string, fallback = '맡은 일을 해내는 사람') {
  const normalizedId = aliases[occupationId] ?? occupationId;
  return historicalOccupations.find(({ id }) => id === normalizedId)?.label ?? fallback;
}

const sentence = (value: string) => /[.!?…]$/u.test(value.trim()) ? value.trim() : `${value.trim()}.`;
const firstSentence = (value: string) => value.trim().split(/(?<=[.!?…])\s+/u)[0]!.replace(/[.!?…]+$/u, '');
const hasFinalConsonant = (value: string) => {
  const code = value.trim().charCodeAt(value.trim().length - 1) - 0xac00;
  return code >= 0 && code <= 11_171 && code % 28 !== 0;
};
const withJosa = (value: string, consonant: string, vowel: string) => `${value}${hasFinalConsonant(value) ? consonant : vowel}`;

export function describeOccupation(core: Pick<ResultCore, 'occupationId' | 'locationId'>) {
  const occupationId = aliases[core.occupationId] ?? core.occupationId;
  const occupation = historicalOccupations.find(({ id }) => id === occupationId);
  if (!occupation) return '당신은 사람들이 매일 필요로 하는 일을 맡았습니다. 자신의 손과 경험으로 문제를 해결했고, 결과에 끝까지 책임을 졌습니다.';

  const actions = occupation.dailyActions.slice(0, 2).map(sentence).join(' ');
  const tools = occupation.signatureObjects.join('과 ');
  return [
    `당신의 직업은 ${withJosa(occupation.label, '이었습니다', '였습니다')}.`,
    actions,
    `${tools} 같은 도구를 사용했습니다.`,
    '이 일은 주변 사람들의 생활을 지키는 데 꼭 필요했습니다.',
  ].join(' ');
}

export function buildCharacterIntroduction(profile: StoryProfile, occupationDescription: string) {
  return [
    `${withJosa(profile.identity.name, '은', '는')} 사람들 사이에서 눈에 잘 띄는 사람이었습니다. ${sentence(profile.identity.appearance)}`,
    `${sentence(profile.identity.voiceAndManner)} 성격은 ${firstSentence(profile.identity.temperament)}에 가까웠습니다.`,
    occupationDescription,
    `${sentence(profile.dailyLife.hobby)} 특히 ${profile.dailyLife.favoritePlace}에서 보내는 시간을 좋아했고, ${withJosa(profile.dailyLife.favoriteFood, '을', '를')} 즐겨 먹었습니다.`,
    `두드러진 재능은 ${firstSentence(profile.dailyLife.talent)}이었습니다. ${profile.identity.name}에게는 큰 꿈도 있었습니다. ${sentence(profile.dailyLife.dream)}`,
  ].join('\n\n');
}
