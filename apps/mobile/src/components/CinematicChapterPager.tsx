import { forwardRef, useImperativeHandle, useMemo } from 'react';
import { Image, PanResponder, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { colors, spacing } from '../theme/tokens';
import { paginateMemoryItems, paginateText } from '../results/paginate';
import { ResultCover, type Cover } from './ResultCover';
import { ResultHero } from './ResultHero';

type Chapter = { id: string; title: string; summary: string; detail: string; profilePages?: { title: string; body: string }[] | undefined };
type Layer = { uri: string; role: 'BACKGROUND' | 'CHARACTER' | 'EFFECT'; alt: string };
type Props = { chapters: Chapter[]; imageUri: string; imageAlt: string; compositeUri?: string | undefined; layers?: Layer[]; title: string; characterLabel?: string | undefined; roleLabel?: string | undefined; placeLabel?: string | undefined; characterDescription?: string | undefined; introductionSummary: string; selectedIndex: number; selectedPageIndex: number; onSelect: (index: number, pageIndex?: number) => void; cover?: Cover | undefined; recordNo?: number | undefined };
export type CinematicChapterPagerHandle = { scrollToIndex: (index: number) => void };

const chevron = require('../../assets/branding/page-chevron.png');

export const CinematicChapterPager = forwardRef<CinematicChapterPagerHandle, Props>(function CinematicChapterPager({ chapters, imageUri, imageAlt, compositeUri, layers, title, characterLabel, roleLabel, placeLabel, characterDescription, introductionSummary, selectedIndex, selectedPageIndex, onSelect, cover, recordNo }, ref) {
  const { width } = useWindowDimensions();
  useImperativeHandle(ref, () => ({ scrollToIndex: (index) => onSelect(index, 0) }), [onSelect]);
  const hasCover = Boolean(cover && recordNo);
  const sectionCount = chapters.length + (hasCover ? 1 : 0);
  const chapterIndex = selectedIndex - (hasCover ? 1 : 0);
  const chapter = chapters[chapterIndex];
  const pagesInChapter = (index: number) => {
    const item = chapters[index];
    if (!item) return 1;
    if (index === 0 && hasCover) return Math.max(1, item.profilePages?.length ?? 1);
    return item.title === '전생의 기억'
      ? paginateMemoryItems(item.detail, width < 600 ? 2 : 3).length
      : paginateText(item.detail, 190).length;
  };
  const currentPageCount = selectedIndex === 0 && hasCover ? 1 : pagesInChapter(chapterIndex);
  const visiblePageIndex = Math.min(selectedPageIndex, Math.max(0, currentPageCount - 1));
  const atBeginning = selectedIndex === 0 && visiblePageIndex === 0;
  const atEnd = selectedIndex === sectionCount - 1 && visiblePageIndex === currentPageCount - 1;
  const goPrevious = () => {
    if (visiblePageIndex > 0) return onSelect(selectedIndex, visiblePageIndex - 1);
    if (selectedIndex === 0) return;
    const previousSection = selectedIndex - 1;
    const previousChapterIndex = previousSection - (hasCover ? 1 : 0);
    const previousPageCount = previousSection === 0 && hasCover ? 1 : pagesInChapter(previousChapterIndex);
    onSelect(previousSection, previousPageCount - 1);
  };
  const goNext = () => {
    if (visiblePageIndex < currentPageCount - 1) return onSelect(selectedIndex, visiblePageIndex + 1);
    if (selectedIndex === sectionCount - 1) return;
    onSelect(selectedIndex + 1, 0);
  };
  const pager = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 16 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.35,
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx < -55) goNext();
      if (gesture.dx > 55) goPrevious();
    },
  }), [goNext, goPrevious]);
  if (!hasCover && !chapter) return null;
  return <View style={styles.wrapper}>
    <View {...(hasCover ? pager.panHandlers : {})} style={styles.page}>
      {hasCover && selectedIndex === 0 && cover && recordNo
        ? <ResultCover imageUri={imageUri} imageAlt={imageAlt} layers={layers} name={characterLabel ?? title} recordNo={recordNo} cover={cover} />
        : chapter ? <ResultHero imageUri={imageUri} imageAlt={imageAlt} compositeUri={compositeUri} layers={layers} title={title} characterLabel={characterLabel} roleLabel={roleLabel} placeLabel={placeLabel} characterDescription={characterDescription} introductionSummary={introductionSummary} chapterTitle={chapter.title} chapterDetail={chapter.detail} profilePages={chapter.profilePages} index={chapterIndex} standaloneProfile={hasCover} pageIndex={visiblePageIndex} onPageChange={(index) => onSelect(selectedIndex, index)} /> : null}
      {hasCover ? <>
        <Pressable accessibilityRole="button" accessibilityLabel="이전 페이지" disabled={atBeginning} onPress={goPrevious} style={[styles.outerArrow, styles.previousArrow, atBeginning && styles.disabledArrow]}><Image source={chevron} resizeMode="contain" style={styles.flippedChevron} accessible={false} /></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="다음 페이지" disabled={atEnd} onPress={goNext} style={[styles.outerArrow, styles.nextArrow, atEnd && styles.disabledArrow]}><Image source={chevron} resizeMode="contain" style={styles.chevron} accessible={false} /></Pressable>
      </> : null}
    </View>
    <View style={styles.dots}>{Array.from({ length: sectionCount }, (_, index) => <Pressable key={index} accessibilityRole="button" accessibilityLabel={hasCover && index === 0 ? '표지 보기' : `${index + (hasCover ? 0 : 1)}장 ${chapters[index - (hasCover ? 1 : 0)]?.title ?? ''} 보기`} accessibilityState={{ selected: index === selectedIndex }} onPress={() => onSelect(index, 0)} style={styles.dotHit}><View style={[styles.dot, index === selectedIndex && styles.activeDot]} /></Pressable>)}</View>
  </View>;
});

const styles = StyleSheet.create({
  wrapper: { width: '100%', minWidth: 0 },
  page: { width: '100%', position: 'relative' },
  outerArrow: { position: 'absolute', zIndex: 10, top: '45%', width: 48, height: 56, alignItems: 'center', justifyContent: 'center' },
  previousArrow: { left: 2 },
  nextArrow: { right: 2 },
  disabledArrow: { opacity: 0.25 },
  chevron: { width: 44, height: 44 },
  flippedChevron: { width: 44, height: 44, transform: [{ scaleX: -1 }] },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 2, paddingTop: spacing.xs },
  dotHit: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.border },
  activeDot: { width: 18, backgroundColor: colors.accent },
});
