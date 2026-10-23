import { findHistoricalSettingExpansion, historicalLocations, historicalOccupations, occupations } from '@pastlife/content';
import { ResultPresentationV3Schema } from '@pastlife/contracts';
import type { ResultCore } from '@pastlife/scoring';
import type { StoryProfile } from '../story-profile.js';
import type { ImageAsset } from '../providers/image.provider.js';

function sentence(value: string) {
  const clean = value.replace(/\s+/gu, ' ').trim().replace(/[.!?。…]+$/u, '');
  return clean ? `${clean}.` : '';
}

function firstSentence(value: string) {
  return sentence(value.trim().split(/(?<=[.!?。…])\s+/u)[0] ?? '');
}

function josa(value: string, withBatchim: string, withoutBatchim: string) {
  const last = value.charCodeAt(value.length - 1);
  const jong = last >= 0xac00 && last <= 0xd7a3 ? (last - 0xac00) % 28 : 0;
  return jong && !(withBatchim === '으로' && jong === 8) ? withBatchim : withoutBatchim;
}

function signatureQuote(object: string, profile: StoryProfile, episode: { choice: string; consequence: string }) {
  const signal = `${profile.dailyLife.belief} ${profile.characterArc.realization} ${episode.choice} ${episode.consequence}`;
  const subject = `${object}${josa(object, '은', '는')}`;
  const directObject = `${object}${josa(object, '을', '를')}`;
  if (/기록|이름|글|소식/u.test(signal)) return `“${object}보다 먼저 남겨야 할 것은 사람의 이름이야.”`;
  if (/고치|회복|다시 이어|새것/u.test(signal)) return `“${directObject} 고치듯, 사람 사이도 다시 이어 갈 수 있어.”`;
  if (/길|방향|두려움|돌아/u.test(signal)) return `“${subject} 길을 가리킬 뿐이야. 함께 돌아갈 사람부터 보자.”`;
  if (/돌봄|나누|안전|보호|곁/u.test(signal)) return `“${subject} 다시 마련하면 돼. 곁의 사람부터 살피자.”`;
  return `“${object}의 값은 셀 수 있어도, 사람의 값까지 셀 수는 없지.”`;
}

export function buildResultPresentation(core: ResultCore, profile: StoryProfile, image: ImageAsset, matchedCharacter: ImageAsset) {
  const location = historicalLocations.find((item) => item.id === core.locationId);
  const occupationAliases: Record<string, string> = { OCC_01: 'OCC_SCRIBE', OCC_02: 'OCC_TEACHER', OCC_03: 'OCC_CEREMONIAL', OCC_04: 'OCC_NAVIGATOR', OCC_05: 'OCC_NAVIGATOR', OCC_06: 'OCC_ARTISAN', OCC_07: 'OCC_HEALER', OCC_08: 'OCC_MESSENGER' };
  const occupationId = occupationAliases[core.occupationId] ?? core.occupationId;
  const occupation = occupations.find((item) => item.id === occupationId);
  const historicalOccupation = historicalOccupations.find((item) => item.id === occupationId);
  if (!location || !occupation || !historicalOccupation) throw new Error('Result catalog reference is missing');
  const episode = findHistoricalSettingExpansion(core.locationId)?.workEpisodes.find((item) => item.occupationIds.includes(core.occupationId));
  if (!episode) throw new Error('No occupation-specific episode for this result');
  const characterUri = matchedCharacter.matchQuality === 'EXACT'
    ? matchedCharacter.layers?.find((layer) => layer.role === 'CHARACTER')?.uri ?? null
    : null;
  const identity = `${profile.identity.name}${josa(profile.identity.name, '은', '는')} ${location.label}에서 ${occupation.label}${josa(occupation.label, '으로', '로')} 살았습니다.`;
  const protectedThing = episode.choice.match(/^당신은 (.+?)부터 챙기는 대신/u)?.[1];
  const tagline = protectedThing
    ? `“${protectedThing}보다 곁의 사람을 먼저 살폈던 이.”`
    : `“${occupation.label}의 자리에서 곁의 사람을 먼저 살폈던 이.”`;
  const signatureObject = historicalOccupation.signatureObjects.find((object) => episode.choice.includes(object)) ?? historicalOccupation.signatureObjects[0]!;
  const lifeSummary = `${identity} ${sentence(episode.choice.replace(/^당신은 /u, ''))} ${sentence(episode.consequence)}`.trim();
  const backgroundUri = image.layers?.find((layer) => layer.role === 'BACKGROUND')?.uri ?? image.uri;
  const crops = [
    { focusX: 0.22, focusY: 0.5, zoom: 1.55 },
    { focusX: 0.46, focusY: 0.32, zoom: 1.55 },
    { focusX: 0.68, focusY: 0.62, zoom: 1.55 },
    { focusX: 0.84, focusY: 0.45, zoom: 1.55 },
  ] as const;
  return ResultPresentationV3Schema.parse({
    version: 3,
    hero: {
      title: location.label,
      tagline,
      signatureQuote: signatureQuote(signatureObject, profile, episode),
      lifeSummary,
      backgroundUri,
      characterUri,
    },
    chapters: [
      { id: 'MEETING', title: '만남', body: lifeSummary, crop: crops[0] },
      { id: 'TRIAL', title: '시련', body: `${sentence(episode.setup)} ${sentence(profile.innerLife.lifelongDilemma)}`.trim(), crop: crops[1] },
      { id: 'CHOICE', title: '선택', body: `${sentence(episode.choice)} ${sentence(episode.consequence)}`.trim(), crop: crops[2] },
      { id: 'NOW', title: '그리고, 지금', body: `${sentence(episode.consequence)} ${firstSentence(profile.characterArc.realization)}`.trim(), crop: crops[3] },
    ],
  });
}
