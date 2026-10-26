import { findStoryCard, findStoryFinalMoment, findStoryManuscript, renderStoryEpisode, renderStoryIdentity, renderStoryMemories, renderStoryTimeline, type StoryCard, type StorySignal } from '@pastlife/content';
import { BasicResultResponseSchema, ExtendedResultResponseSchema, type ResultPresentationSchema } from '@pastlife/contracts';
import type { ResultCore } from '@pastlife/scoring';
import type { z } from 'zod';
import type { ImageAsset } from '../providers/image.provider.js';

function selectedSignal(core: ResultCore, card: StoryCard): StorySignal {
  return [...card.signals].sort((left, right) =>
    (core.storySignals?.filter((signal) => signal === right).length ?? 0)
    - (core.storySignals?.filter((signal) => signal === left).length ?? 0))[0]!;
}

function storyParts(core: ResultCore) {
  const card = core.storyId ? findStoryCard(core.storyId) : undefined;
  if (!card) throw new Error(`Missing story card: ${core.storyId ?? 'none'}`);
  const signal = selectedSignal(core, card);
  const moment = card.signalMoments[signal];
  if (!moment) throw new Error(`Missing signal moment: ${card.id}/${signal}`);
  return { card, signal, moment, echo: `${card.presentEcho}\n\n${card.readerQuestion}` };
}

function compactPresentationText(value: string, max: number) {
  const clean = value.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1).replace(/[,、。.!?]?[一-龥ぁ-んァ-ン가-힣A-Za-z0-9 ]*$/, '').trim();
  return `${cut || clean.slice(0, max - 1).trim()}…`;
}

export function buildContentStoryBlocks(core: ResultCore) {
  const { card, signal } = storyParts(core);
  const manuscript = findStoryManuscript(card.id);
  if (!manuscript) throw new Error(`Missing story manuscript: ${card.id}`);
  return [
    { id: 'STORY_OPEN', title: '전생의 나', body: renderStoryIdentity(manuscript, card.name) },
    { id: 'STORY_LIFE', title: '에피소드의 시작', body: manuscript.episode.beforeSignal },
    { id: 'STORY_TURN', title: '그날의 순간', body: manuscript.episode.signalMoments[signal]! },
    { id: 'STORY_CHOICE', title: '에피소드의 끝', body: manuscript.episode.afterSignal },
    { id: 'STORY_COST', title: '삶의 기록', body: renderStoryTimeline(manuscript) },
    { id: 'STORY_ECHO', title: '전생의 기억', body: renderStoryMemories(manuscript) },
  ];
}

function presentation(core: ResultCore, image: ImageAsset): z.infer<typeof ResultPresentationSchema> {
  const { card, signal } = storyParts(core);
  const manuscript = findStoryManuscript(card.id);
  if (!manuscript) throw new Error(`Missing story manuscript: ${card.id}`);
  const backgroundUri = image.layers?.find((layer) => layer.role === 'BACKGROUND')?.uri ?? image.uri;
  const crops = [
    { focusX: 0.38, focusY: 0.5, zoom: 1.18 },
    { focusX: 0.63, focusY: 0.42, zoom: 1.27 },
    { focusX: 0.44, focusY: 0.64, zoom: 1.32 },
    { focusX: 0.65, focusY: 0.6, zoom: 1.2 },
  ] as const;
  return {
    version: 3,
    hero: {
      title: card.title, tagline: card.flavor, lifeSummary: renderStoryIdentity(manuscript, card.name), signatureQuote: compactPresentationText(manuscript.identity.summary, 80),
      backgroundUri, characterUri: image.layers?.find((layer) => layer.role === 'CHARACTER')?.uri ?? null,
      cover: {
        era: card.setting?.year ?? manuscript.identity.era,
        place: card.setting ? `${card.setting.polity} · ${card.home}` : manuscript.identity.region,
        role: card.role,
        birthYear: manuscript.identity.birthYear,
        deathYear: manuscript.identity.deathYear,
        lifeLine: manuscript.identity.summary,
      },
    },
    chapters: [
      { id: 'MEETING', title: '전생의 나', body: renderStoryIdentity(manuscript, card.name), profilePages: manuscript.identity.profilePages ? [...manuscript.identity.profilePages] : undefined, crop: crops[0] },
      { id: 'TRIAL', title: '에피소드', body: renderStoryEpisode(manuscript, signal), crop: crops[1] },
      { id: 'CHOICE', title: '삶의 기록', body: renderStoryTimeline(manuscript), crop: crops[2] },
      { id: 'NOW', title: '전생의 기억', body: renderStoryMemories(manuscript), crop: crops[3] },
    ],
  };
}

export function buildContentStoryResult(resultId: string, core: ResultCore, image: ImageAsset, finalMomentRead = false) {
  const { card, moment, echo } = storyParts(core);
  const manuscript = findStoryManuscript(card.id);
  if (!manuscript) throw new Error(`Missing story manuscript: ${card.id}`);
  const highlights = [
    { id: 'IDENTITY', title: '그 삶', summary: `${card.name} · ${card.role}`, detail: card.identityLine },
    { id: 'DREAM_AND_DAILY', title: '매일의 마음', summary: card.flavor, detail: card.life },
    { id: 'LIFE_FOUNDATION', title: '살던 곳', summary: card.home, detail: card.world },
    { id: 'INNER_WOUND', title: '망설임', summary: card.cost, detail: card.cost },
    { id: 'KEY_RELATIONSHIP', title: '함께 있던 사람', summary: card.decision, detail: card.decision },
    { id: 'DECISIVE_EVENT', title: '뜻밖의 사건', summary: card.turn, detail: `${card.turn}\n\n${moment}` },
    { id: 'LIFE_LEGACY', title: '남은 장면', summary: card.after, detail: card.after },
    { id: 'PRESENT_ECHO', title: '지금의 여운', summary: echo, detail: echo },
  ];
  return BasicResultResponseSchema.parse({
    resultId, finalMomentRead, finalMomentAvailable: Boolean(findStoryFinalMoment(card.id)), recordNo: core.recordNo, headline: card.title,
    character: {
      name: card.name, gender: manuscript.identity.gender === '성별 없음' ? null : manuscript.identity.gender, fictional: true, occupation: card.role,
      introduction: renderStoryIdentity(manuscript, card.name), occupationDescription: manuscript.identity.summary,
      appearance: '', temperament: '', complex: '', socialMask: '', stressResponse: '',
      familyStructure: '', primaryCaregiver: '', hobby: '', dream: '', talent: '',
      weakness: '', favoritePlace: card.home, belief: '', formativeWound: '',
      centralContradiction: '', realization: card.after,
    },
    lifeSummary: { ageAtDeath: manuscript.identity.ageAtDeath, lifespanLabel: `${manuscript.identity.birthYear}~${manuscript.identity.deathYear}`, endingTitle: card.title },
    highlights, image, presentation: presentation(core, image), blocks: buildContentStoryBlocks(core),
    disclaimer: '상상으로 엮은 전생 이야기입니다. 지금의 몸과 마음을 진단하거나 과거의 사실을 확인하는 결과는 아닙니다.',
  });
}

export function buildContentStoryExtended(resultId: string, core: ResultCore, image: ImageAsset, kind: 'DEEP' | 'GUIDE') {
  const { card, signal, echo } = storyParts(core);
  const manuscript = findStoryManuscript(card.id);
  if (!manuscript) throw new Error(`Missing story manuscript: ${card.id}`);
  const blocks = kind === 'DEEP' ? [
    { id: 'STORY_DEEP_1', title: '전생의 나를 더 보면', body: `${renderStoryIdentity(manuscript, card.name)}\n\n${renderStoryMemories(manuscript)}` },
    { id: 'STORY_DEEP_2', title: '그날을 다시 읽으면', body: `${renderStoryEpisode(manuscript, signal)}\n\n${card.secondLook}` },
    { id: 'STORY_DEEP_3', title: '그 뒤의 삶', body: `${renderStoryTimeline(manuscript)}\n\n${card.unresolved}` },
    { id: 'STORY_DEEP_4', title: '책장을 덮은 뒤', body: `${card.after}\n\n${echo}` },
  ] : [
    { id: 'STORY_GUIDE_1', title: '마음에 남은 기록', body: renderStoryMemories(manuscript) },
    { id: 'STORY_GUIDE_2', title: '다시 떠올려 볼 선택', body: `${manuscript.episode.signalMoments[signal]}\n\n${card.secondLook}` },
    { id: 'STORY_GUIDE_3', title: '그 마음의 다른 면', body: `${renderStoryTimeline(manuscript)}\n\n${card.unresolved}` },
    { id: 'STORY_GUIDE_4', title: '오늘에 가져올 질문', body: `${echo}\n\n정답을 정하지 않고, 이 이야기에서 오래 보고 싶은 장면 하나를 골라도 좋습니다. 그 장면이 지금의 삶을 설명해야 할 필요는 없어요.` },
  ];
  return ExtendedResultResponseSchema.parse({ resultId, image, blocks, disclaimer: '상상으로 엮은 이야기이며, 현재의 상태에 대한 판단은 아닙니다.' });
}
