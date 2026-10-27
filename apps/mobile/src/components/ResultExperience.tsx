import { forwardRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { z } from 'zod';
import type { ResultPresentationSchema } from '@pastlife/contracts';
import { ChapterFilmstrip } from './ChapterFilmstrip';
import { CinematicChapterPager } from './CinematicChapterPager';
import { presentChapters, presentHeadline, presentIdentity } from '../results/presentation';
import { localeText, useLocale } from '../i18n/locale';

type ImageLayer = { uri: string; role: 'BACKGROUND' | 'CHARACTER' | 'EFFECT'; alt: string };
type ImageAsset = { uri: string; alt: string; sourceType: 'AI' | 'LIBRARY'; status: 'READY' | 'FALLBACK'; layers?: ImageLayer[] | undefined; compositeUri?: string | undefined };
type Highlight = { id: string; title: string; summary: string; detail: string };
type Character = { name: string; occupation: string; gender: string | null; introduction: string; occupationDescription: string; favoritePlace: string; appearance: string; temperament: string; hobby: string; dream: string; talent: string; formativeWound: string };
type LifeSummary = { ageAtDeath: number | null; lifespanLabel: string; endingTitle: string };

type ResultExperienceProps = {
  image: ImageAsset;
  blocks: { id: string; title: string; body: string }[];
  highlights?: Highlight[];
  character?: Character;
  lifeSummary?: LifeSummary;
  introTitle?: string;
  introDescription?: string;
  headline?: string;
  presentation?: z.infer<typeof ResultPresentationSchema> | undefined;
  recordNo?: number | undefined;
  onChapterSelect?: (() => void) | undefined;
};

function firstSentence(value: string) {
  return value.trim().split(/(?<=[.!?…])\s+/u)[0]?.replace(/[.!?…]+$/u, '') ?? value.trim();
}

export const ResultExperience = forwardRef<View, ResultExperienceProps>(function ResultExperience({
  image,
  blocks,
  highlights,
  character,
  introTitle = '당신의 전생 이야기',
  introDescription = '당신의 전생을 살았던 사람의 기록입니다.',
  headline,
  presentation,
  recordNo,
  onChapterSelect,
}, ref) {
  const { locale } = useLocale();
  const [position, setPosition] = useState({ chapterIndex: 0, pageIndex: 0 });
  const { chapterIndex, pageIndex } = position;
  const hasCover = presentation?.version === 3 && Boolean(presentation.hero.cover && recordNo);
  const sceneUri = presentation?.hero.backgroundUri ?? image.layers?.find((layer) => layer.role === 'BACKGROUND')?.uri ?? image.uri;
  const layers: ImageLayer[] = presentation
    ? [{ uri: sceneUri, role: 'BACKGROUND', alt: image.alt }, ...(presentation.hero.characterUri ? [{ uri: presentation.hero.characterUri, role: 'CHARACTER' as const, alt: localeText(locale, { ko: '전생 인물', en: 'Past life character', th: 'ตัวละครในชาติก่อน', ja: '前世の人物' }) }] : [])]
    : image.layers ?? [{ uri: sceneUri, role: 'BACKGROUND', alt: image.alt }];
  const legacyHighlights = highlights?.filter((item) => ['KEY_RELATIONSHIP', 'DECISIVE_EVENT', 'LIFE_LEGACY', 'PRESENT_ECHO'].includes(item.id)).slice(0, 4);
  const chapters = presentation
    ? presentation.chapters.map((chapter) => ({ id: chapter.id, title: chapter.title, summary: '', detail: chapter.body, profilePages: chapter.id === 'MEETING' ? chapter.profilePages : undefined, crop: chapter.crop }))
    : legacyHighlights?.length ? presentChapters(legacyHighlights, sceneUri).map((chapter) => ({ id: chapter.id, title: chapter.shortTitle, summary: chapter.lead, detail: chapter.body, crop: chapter.crop }))
      : blocks.map((block, index) => ({ id: block.id, title: block.title, summary: '', detail: block.body, crop: { focusX: (index + 1) / (blocks.length + 1), focusY: 0.5, zoom: 1.55 } }));
  const selectChapter = (index: number, nextPageIndex = 0) => {
    setPosition({ chapterIndex: index, pageIndex: nextPageIndex });
    onChapterSelect?.();
  };

  return <View ref={ref} collapsable={false} style={styles.container}>
    {chapters.length > 0 ? <>
      <CinematicChapterPager
        chapters={chapters}
        imageUri={sceneUri}
        imageAlt={image.alt}
        layers={layers}
        title={presentation?.hero.title ?? (headline ? presentHeadline(headline) : localeText(locale, { ko: introTitle, en: 'Your past life story', th: 'เรื่องราวชาติที่แล้วของคุณ', ja: 'あなたの前世の物語' }))}
        characterLabel={character ? (presentation?.version === 3 ? character.name : character.name === '이야기 속 당신' ? character.occupation : `${character.name} · ${character.occupation}`) : undefined}
        roleLabel={presentation?.version === 3 ? character?.occupation : undefined}
        placeLabel={presentation?.version === 3 ? character?.favoritePlace : undefined}
        characterDescription={presentation?.version === 3 ? presentation.hero.signatureQuote : presentation?.hero.tagline ?? (character ? presentIdentity(character.introduction) : undefined)}
        introductionSummary={presentation?.hero.lifeSummary ?? (character ? firstSentence(character.introduction) : localeText(locale, { ko: introDescription, en: 'A record of the person who lived your imagined past life.', th: 'บันทึกของคนในชาติที่แล้วจากจินตนาการของคุณ', ja: '想像上の前世を生きた人物の記録です。' }))}
        selectedIndex={chapterIndex}
        selectedPageIndex={pageIndex}
        onSelect={selectChapter}
        cover={presentation?.version === 3 ? presentation.hero.cover : undefined}
        recordNo={recordNo}
      />
      <ChapterFilmstrip chapters={chapters} imageUri={sceneUri} imageAlt={image.alt} selectedIndex={hasCover ? chapterIndex - 1 : chapterIndex} onSelect={(index) => selectChapter(index + (hasCover ? 1 : 0), 0)} />
    </> : null}
  </View>;
});

const styles = StyleSheet.create({ container: { width: '100%', minWidth: 0 } });
