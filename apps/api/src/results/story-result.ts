import { findEnglishStoryTranslation, findJapaneseStoryTranslation, findThaiStoryTranslation, findStoryCard, findStoryFinalMoment, findStoryManuscript, isEnglishStorySignalReady, isJapaneseStorySignalReady, isThaiStorySignalReady, renderStoryEpisode, renderStoryIdentity, renderStoryMemories, renderStoryTimeline, type ContentLocale, type StoryCard, type StoryManuscript, type StorySignal } from '@pastlife/content';
import { BasicResultResponseSchema, ExtendedResultResponseSchema, type ResultPresentationSchema } from '@pastlife/contracts';
import type { ResultCore } from '@pastlife/scoring';
import type { z } from 'zod';
import type { ImageAsset } from '../providers/image.provider.js';
import storyIntros from './story-intros.json';

function storyIntroPage(storyId: string, locale: ContentLocale) {
  const intro = (storyIntros as Record<string, Partial<Record<ContentLocale, { summary: string; hook: string }>>>)[storyId]?.[locale];
  if (!intro) throw new Error(`Missing ${locale} story introduction: ${storyId}`);
  const labels = {
    ko: { title: '이야기를 열며', invitation: '이제 옆으로 넘겨 당신의 전생을 천천히 만나보세요.' },
    en: { title: 'Before the story begins', invitation: 'Now swipe to discover your past life, one page at a time.' },
    th: { title: 'ก่อนเริ่มเรื่องราว', invitation: 'ตอนนี้ปัดไปด้านข้าง แล้วค่อย ๆ เปิดอ่านเรื่องราวชาติก่อนของคุณ' },
    ja: { title: '物語のはじまりに', invitation: 'さあ、横にめくって、あなたの前世をゆっくりたどってみましょう。' },
  }[locale];
  return { title: labels.title, summary: intro.summary, hook: intro.hook, invitation: labels.invitation };
}

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
      { id: 'MEETING', title: '전생의 나', body: renderStoryIdentity(manuscript, card.name), introPage: storyIntroPage(card.id, 'ko'), profilePages: manuscript.identity.profilePages ? [...manuscript.identity.profilePages] : undefined, crop: crops[0] },
      { id: 'TRIAL', title: '에피소드', body: renderStoryEpisode(manuscript, signal), crop: crops[1] },
      { id: 'CHOICE', title: '삶의 기록', body: renderStoryTimeline(manuscript), crop: crops[2] },
      { id: 'NOW', title: '전생의 기억', body: renderStoryMemories(manuscript), crop: crops[3] },
    ],
  };
}

function translatedManuscript(source: StoryManuscript, text: NonNullable<ReturnType<typeof findEnglishStoryTranslation>>): StoryManuscript {
  return {
    id: source.id,
    identity: { ...source.identity, ...text.manuscript.identity },
    episode: text.manuscript.episode,
    timeline: text.manuscript.timeline,
    memories: text.manuscript.memories,
  };
}

function localizedStoryResult(korean: z.infer<typeof BasicResultResponseSchema>, source: StoryManuscript, card: StoryCard, signal: StorySignal, locale: 'en' | 'th' | 'ja') {
  const text = locale === 'en' ? findEnglishStoryTranslation(card.id) : locale === 'th' ? findThaiStoryTranslation(card.id) : findJapaneseStoryTranslation(card.id);
  const ready = locale === 'en' ? isEnglishStorySignalReady(card.id, signal) : locale === 'th' ? isThaiStorySignalReady(card.id, signal) : isJapaneseStorySignalReady(card.id, signal);
  if (!text || !ready) throw new Error(`${{ en: 'English', th: 'Thai', ja: 'Japanese' }[locale]} preview unavailable for ${card.id}/${signal}`);
  const manuscript = translatedManuscript(source, text);
  const c = text.card;
  const labels = locale === 'en' ? {
    highlights: ['The person', 'Everyday hopes', 'Where they lived', 'The hesitation', 'Someone beside them', 'An unexpected day', 'What remained', 'A thought for today'],
    blocks: ['The person I was', 'The beginning', 'That day', 'What followed', 'A life in years', 'Memories'],
    chapters: ['The Person I Was', 'The Episode', 'A Life in Years', 'Memories'],
    disclaimer: 'This is an imagined past life story for entertainment, not a diagnosis or a statement of historical fact.',
    imagePlace: 'in',
  } : locale === 'th' ? {
    highlights: ['คนคนนั้น', 'ความหวังในทุกวัน', 'ถิ่นที่อยู่', 'ความลังเล', 'คนข้างกาย', 'วันที่ไม่คาดคิด', 'สิ่งที่ยังอยู่', 'ความคิดสำหรับวันนี้'],
    blocks: ['ตัวฉันในชาติก่อน', 'จุดเริ่มต้น', 'วันนั้น', 'สิ่งที่ตามมา', 'ชีวิตตามกาลเวลา', 'ความทรงจำ'],
    chapters: ['ตัวฉันในชาติก่อน', 'เรื่องราว', 'ชีวิตตามกาลเวลา', 'ความทรงจำ'],
    disclaimer: 'นี่คือเรื่องราวชาติก่อนจากจินตนาการเพื่อความบันเทิง ไม่ใช่การวินิจฉัยหรือข้อเท็จจริงทางประวัติศาสตร์',
    imagePlace: 'ที่',
  } : {
    highlights: ['その人', '日々の願い', '暮らした場所', 'ためらい', 'そばにいた人', '思いがけない日', '残されたもの', '今への問い'],
    blocks: ['かつての私', '物語の始まり', 'あの日', 'その後', '人生の歩み', '記憶'],
    chapters: ['かつての私', 'エピソード', '人生の歩み', '記憶'],
    disclaimer: 'これは娯楽のために創作された前世の物語です。診断や歴史的事実を示すものではありません。',
    imagePlace: '、',
  };
  const identity = renderStoryIdentity(manuscript, c.name);
  const episode = renderStoryEpisode(manuscript, signal);
  const timeline = renderStoryTimeline(manuscript);
  const memories = renderStoryMemories(manuscript);
  const echo = `${c.presentEcho}\n\n${c.readerQuestion}`;
  const translated = structuredClone(korean);
  translated.headline = c.title;
  Object.assign(translated.character, {
    name: c.name, gender: manuscript.identity.gender, occupation: c.role,
    introduction: identity, occupationDescription: manuscript.identity.summary,
    favoritePlace: c.home, realization: c.after,
  });
  translated.lifeSummary.lifespanLabel = `${manuscript.identity.birthYear}–${manuscript.identity.deathYear}`;
  translated.lifeSummary.endingTitle = c.title;
  translated.image.alt = `${c.name}, ${c.role} ${labels.imagePlace} ${c.home}`;
  translated.image.layers?.forEach((layer) => { layer.alt = layer.role === 'CHARACTER' ? `${c.name}, ${c.role}` : c.home; });
  translated.highlights = [
    { id: 'IDENTITY', title: labels.highlights[0]!, summary: `${c.name} · ${c.role}`, detail: c.identityLine },
    { id: 'DREAM_AND_DAILY', title: labels.highlights[1]!, summary: c.flavor, detail: c.life },
    { id: 'LIFE_FOUNDATION', title: labels.highlights[2]!, summary: c.home, detail: c.world },
    { id: 'INNER_WOUND', title: labels.highlights[3]!, summary: c.cost, detail: c.cost },
    { id: 'KEY_RELATIONSHIP', title: labels.highlights[4]!, summary: c.decision, detail: c.decision },
    { id: 'DECISIVE_EVENT', title: labels.highlights[5]!, summary: c.turn, detail: `${c.turn}\n\n${c.signalMoments[signal]}` },
    { id: 'LIFE_LEGACY', title: labels.highlights[6]!, summary: c.after, detail: c.after },
    { id: 'PRESENT_ECHO', title: labels.highlights[7]!, summary: echo, detail: echo },
  ];
  translated.blocks = [
    { id: 'STORY_OPEN', title: labels.blocks[0]!, body: identity },
    { id: 'STORY_LIFE', title: labels.blocks[1]!, body: manuscript.episode.beforeSignal },
    { id: 'STORY_TURN', title: labels.blocks[2]!, body: manuscript.episode.signalMoments[signal]! },
    { id: 'STORY_CHOICE', title: labels.blocks[3]!, body: manuscript.episode.afterSignal },
    { id: 'STORY_COST', title: labels.blocks[4]!, body: timeline },
    { id: 'STORY_ECHO', title: labels.blocks[5]!, body: memories },
  ];
  translated.disclaimer = labels.disclaimer;
  if (translated.presentation?.version === 3) {
    const { hero, chapters } = translated.presentation;
    Object.assign(hero, { title: c.title, tagline: c.flavor, lifeSummary: identity, signatureQuote: compactPresentationText(c.opening, 80) });
    if (hero.cover) Object.assign(hero.cover, {
      era: c.setting?.year ?? manuscript.identity.era,
      place: c.setting ? `${c.setting.polity} · ${c.home}` : manuscript.identity.region,
      role: c.role, birthYear: manuscript.identity.birthYear, deathYear: manuscript.identity.deathYear,
      lifeLine: manuscript.identity.summary,
    });
    const chapterCopy = [
      { title: labels.chapters[0], body: identity, introPage: storyIntroPage(card.id, locale), profilePages: manuscript.identity.profilePages },
      { title: labels.chapters[1], body: episode },
      { title: labels.chapters[2], body: timeline },
      { title: labels.chapters[3], body: memories },
    ];
    chapters.forEach((chapter, index) => Object.assign(chapter, chapterCopy[index]));
  }
  return BasicResultResponseSchema.parse(translated);
}

export function buildContentStoryResult(resultId: string, core: ResultCore, image: ImageAsset, finalMomentRead = false, locale: ContentLocale = 'ko') {
  const { card, signal, moment, echo } = storyParts(core);
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
  const korean = BasicResultResponseSchema.parse({
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
  if (locale === 'ko') return korean;
  if (locale === 'en' || locale === 'th' || locale === 'ja') return localizedStoryResult(korean, manuscript, card, signal, locale);
  const unsupported: never = locale;
  throw new Error(`Unsupported story locale: ${unsupported}`);
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
