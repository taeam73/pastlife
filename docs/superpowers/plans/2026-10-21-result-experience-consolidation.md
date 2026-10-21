# Result Experience Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 결과 화면을 짧고 강한 에피소드형 콘텐츠와 시안형 풀블리드 영웅·챕터 UI로 통합한다.

**Architecture:** 판정 로직은 유지하고 결과 표시용 콘텐츠를 별도 정규화한다. 결과 화면은 영웅, 요약 패널, 챕터 필름스트립, 가로 페이지로 분리하며 이미지·텍스트·반응형 레이아웃을 각 컴포넌트 책임으로 둔다.

**Tech Stack:** Expo Router, React Native/Web, TypeScript, Vitest, existing library image registry.

## Global Constraints

- 기존 질문·결과 판정 로직은 변경하지 않는다.
- 모바일과 태블릿 모두에서 배경은 viewport 폭을 사용한다.
- 영웅 텍스트는 2줄 내외, 요약은 3줄 이내, 챕터 카드는 짧은 제목만 표시한다.
- 태블릿에서는 4개 챕터 카드가 콘텐츠 폭을 균등하게 채운다.
- 모든 변경 후 mobile typecheck와 test를 실행한다.

---

### Task 1: 표시용 콘텐츠 정규화

**Files:** `apps/mobile/src/results/presentation.ts`, `apps/mobile/src/results/presentation.test.ts`

- [ ] Add pure helpers that shorten display headlines, identity copy, and chapter copy without changing result scoring.
- [ ] Return exactly four chapter presentation objects with `shortTitle`, `lead`, `body`, `closingLine`, and `imageUri`.
- [ ] Test long headline truncation, chapter ordering, and 80–140 character body limits.

### Task 2: Result hero separation

**Files:** `apps/mobile/src/components/ResultHero.tsx`, `apps/mobile/src/components/CinematicChapterPager.tsx`, `apps/mobile/src/components/ResultExperience.tsx`

- [ ] Move background, character, logo, identity headline, and gradient into `ResultHero`.
- [ ] Render background edge-to-edge and keep character independently centered.
- [ ] Remove chapter detail text from the hero; use presentation identity copy only.
- [ ] Keep horizontal paging synchronized with chapter selection.

### Task 3: Summary and chapter filmstrip

**Files:** `apps/mobile/src/components/ParchmentSummary.tsx`, `apps/mobile/src/components/ChapterFilmstrip.tsx`

- [ ] Limit parchment to title, one summary, and one optional keyword.
- [ ] Use four vertical cards with distinct chapter images, active gold border, timeline dots, and swipe hint.
- [ ] Make card widths responsive: mobile horizontal scroll, tablet four equal cards.

### Task 4: Result route integration

**Files:** `apps/mobile/app/result.tsx`, `apps/mobile/app/archive/[resultId].tsx`, `apps/mobile/app/deep.tsx`

- [ ] Pass result headline and character identity into the presentation layer.
- [ ] Remove duplicate route-level title blocks that compete with the hero.
- [ ] Preserve existing share, archive, unlock, and restart actions.

### Task 5: Holistic responsive verification

**Files:** `apps/mobile/src/components/Screen.tsx`, `apps/mobile/src/components/*.tsx`

- [ ] Verify 390×844, 768×1024, 1024×1366, and 1440×900 behavior.
- [ ] Confirm no black side gutters, clipped cards, overlapping text, or duplicate logos.
- [ ] Run typecheck, unit tests, and browser smoke verification.

