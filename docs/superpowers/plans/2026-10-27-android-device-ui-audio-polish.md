# Android Device UI and Audio Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 실기기에서 확인된 상태 표시줄 겹침, 질문·보기 과대 표시, 양피지 파손, 결과 버튼 겹침, 로딩 화면의 장애 인상, 들리지 않는 배경음악·효과음을 하나의 검증 가능한 모바일 품질 개선으로 해결한다.

**Architecture:** 공통 안전 영역과 반응형 치수를 표현 계층의 단일 기준으로 만들고 질문·로딩·결과 화면이 이를 공유하게 한다. 오디오는 앱 전역 세션과 구독 가능한 사용자 설정으로 관리하며 짧은 효과음은 미리 적재한다. 질문 의미, 선택지 ID, 점수 계산, 결과 데이터 구조와 120편 원고는 변경하지 않는다.

**Tech Stack:** Expo SDK 57, React Native 0.86, Expo Router, `react-native-safe-area-context`, `expo-audio`, Vitest, Playwright, EAS Build

## Global Constraints

- 320px 폭을 최소 휴대폰 QA 기준으로 사용한다.
- 768px 폭에서 콘텐츠를 중앙 정렬하고 배경은 viewport 전체를 채운다.
- 한국어·영어·태국어·일본어에서 가로 스크롤과 텍스트 잘림이 없어야 한다.
- 질문 의미, 선택지 ID, 채점, 결과 선정, API 계약 및 콘텐츠 원고를 변경하지 않는다.
- 터치 대상은 최소 48px, 보기 버튼은 최소 52px 높이를 유지한다.
- 답변은 한 줄을 우선하지만 글자를 과도하게 축소하지 않고 최대 두 줄을 허용한다.
- 배경음악과 효과음 설정은 기기에 저장되고 현재 재생 상태에 즉시 반영되어야 한다.
- 전면 광고가 준비되지 않아도 결과 진입을 7초보다 오래 막지 않는다.
- 변경 전후 `corepack pnpm typecheck`, `corepack pnpm test`, 모바일 브라우저 E2E와 Android APK 실기기 검수를 수행한다.

---

## File Map

- `apps/mobile/app/_layout.tsx`: 안전 영역 provider와 전역 오디오 provider 구성.
- `apps/mobile/src/components/Screen.tsx`: 공통 safe area, 상태 표시줄, 로고 크기·위치.
- `apps/mobile/src/layout/mobileMetrics.ts`: 휴대폰·태블릿 공통 치수 계산.
- `apps/mobile/src/layout/mobileMetrics.test.ts`: 320px/일반폰/태블릿 치수 회귀 테스트.
- `apps/mobile/app/question/[stage].tsx`: 질문 크기·간격·스크롤 구조.
- `apps/mobile/src/components/ChoiceButton.tsx`: 보기 폭·폰트·최대 두 줄.
- `apps/mobile/app/analysis.tsx`: 배경 이미지 기반 중앙 로딩 연출과 단계 문구.
- `apps/mobile/src/ads/admob.ts`: 전면 광고의 제한 시간과 실패 시 즉시 통과.
- `apps/mobile/src/components/ResultHero.tsx`: 양피지 전체 폭과 실제 본문 폭 통일.
- `apps/mobile/src/components/MeasuredPageFlow.tsx`: 측정 프레임과 표시 프레임 동일화.
- `apps/mobile/src/components/CinematicChapterPager.tsx`: 페이지 화살표·점·양피지 외곽 정렬.
- `apps/mobile/app/result.tsx`: 하단 동작 버튼의 세로 배치와 안전 여백.
- `apps/mobile/src/components/ParchmentButton.tsx`: 긴 다국어 버튼 문구의 두 줄 안전 처리.
- `apps/mobile/src/session/store.ts`: 설정 변경 구독 인터페이스.
- `apps/mobile/src/audio/config.ts`: 음량, 음원, 오디오 모드의 단일 설정.
- `apps/mobile/src/audio/AudioExperience.tsx`: 세션 초기화, BGM 재생, 설정 즉시 반영.
- `apps/mobile/src/audio/effects.ts`: 효과음 사전 적재와 안정적인 재시작.
- `apps/mobile/src/audio/config.test.ts`: 운영 음량과 경로 정책 테스트.
- `apps/mobile/app/settings.tsx`: 배경음악·효과음 시험 재생 버튼.
- `apps/mobile/src/i18n/en.ts`, `th.ts`, `ja.json`: 로딩 단계·시험 재생 문구 번역.
- `e2e/mobile-device-polish.spec.ts`: 320px/768px 화면과 주요 동작 회귀 검사.

---

### Task 1: 공통 안전 영역과 로고 규격

**Files:**
- Create: `apps/mobile/src/layout/mobileMetrics.ts`
- Create: `apps/mobile/src/layout/mobileMetrics.test.ts`
- Modify: `apps/mobile/app/_layout.tsx`
- Modify: `apps/mobile/src/components/Screen.tsx`

**Interfaces:**
- Produces: `mobileMetrics(width: number, fontScale: number): MobileMetrics`
- Produces: 모든 화면에서 `react-native-safe-area-context`의 상·하단 inset을 적용하는 `Screen`

- [ ] **Step 1: 320px과 태블릿 치수 테스트를 작성한다**

```ts
import { describe, expect, it } from 'vitest';
import { mobileMetrics } from './mobileMetrics';

describe('mobileMetrics', () => {
  it('keeps the 320px logo and gutters compact', () => {
    expect(mobileMetrics(320, 1)).toMatchObject({ gutter: 14, logoWidth: 88, contentMaxWidth: 760 });
  });
  it('centers capped content on tablets', () => {
    expect(mobileMetrics(768, 1).contentMaxWidth).toBe(760);
  });
});
```

- [ ] **Step 2: 테스트 실패를 확인한다**

Run: `corepack pnpm --filter @pastlife/mobile test -- src/layout/mobileMetrics.test.ts`

Expected: `Cannot find module './mobileMetrics'`로 실패.

- [ ] **Step 3: 반응형 치수 함수를 구현한다**

```ts
export type MobileMetrics = { gutter: number; logoWidth: number; logoHeight: number; contentMaxWidth: number };
export function mobileMetrics(width: number, fontScale: number): MobileMetrics {
  const compact = width <= 360 || fontScale > 1.15;
  return { gutter: compact ? 14 : 20, logoWidth: compact ? 88 : 94, logoHeight: compact ? 32 : 35, contentMaxWidth: 760 };
}
```

- [ ] **Step 4: root를 `SafeAreaProvider`로 감싸고 `Screen`을 safe-area-context 기반으로 바꾼다**

```tsx
<SafeAreaProvider>
  <LocaleProvider><AudioExperience><Stack screenOptions={{ headerShown: false, animation: 'fade' }} /></AudioExperience></LocaleProvider>
</SafeAreaProvider>
```

`Screen`은 `useSafeAreaInsets()`와 `useWindowDimensions()`를 사용해 로고를 `top: insets.top + 4`에 배치하고, 콘텐츠에는 `paddingTop: insets.top + logoHeight`와 `paddingBottom: insets.bottom`을 적용한다. 상태 표시줄은 투명 배경과 밝은 아이콘으로 고정한다.

- [ ] **Step 5: 검사 후 커밋한다**

Run: `corepack pnpm --filter @pastlife/mobile typecheck && corepack pnpm --filter @pastlife/mobile test`

Expected: 모바일 타입 검사와 전체 단위 테스트 통과.

Commit: `fix: respect Android safe areas across mobile screens`

---

### Task 2: 질문과 보기의 모바일 타이포그래피

**Files:**
- Modify: `apps/mobile/app/question/[stage].tsx`
- Modify: `apps/mobile/src/components/ChoiceButton.tsx`
- Test: `e2e/mobile-device-polish.spec.ts`

**Interfaces:**
- Consumes: Task 1의 `Screen` 안전 영역.
- Produces: 한 줄 우선·최대 두 줄의 보기와 320px에서 스크롤 가능한 질문 화면.

- [ ] **Step 1: 320px 질문 화면 E2E를 작성한다**

```ts
test('question choices stay inside a 320px viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await openPreparedQuestion(page);
  await expect(page.getByTestId('question-screen')).toHaveCSS('overflow-x', 'visible');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
```

- [ ] **Step 2: 질문 화면에 `testID="question-screen"`을 추가하고 실패를 확인한다**

Run: `corepack pnpm exec playwright test e2e/mobile-device-polish.spec.ts --project=chromium`

Expected: 현재 320px 레이아웃 스냅샷 또는 폭 단언 실패.

- [ ] **Step 3: 질문과 보기 스타일을 조정한다**

```ts
question: { fontSize: 21, lineHeight: 30, marginTop: 12, marginBottom: 8, paddingHorizontal: 2 },
choices: { width: '96%', maxWidth: 560, alignSelf: 'center', gap: 10 },
```

```ts
choice: { minHeight: 52, paddingHorizontal: 14, paddingVertical: 10 },
text: { fontSize: 14.5, lineHeight: 21 },
```

`Text`에는 `numberOfLines={2}`, `minimumFontScale={0.9}`, `adjustsFontSizeToFit`를 적용하되 접근성 글자 확대 시 화면 전체 스크롤로 내용을 보존한다.

- [ ] **Step 4: 320px과 768px E2E 및 모바일 테스트를 실행한다**

Run: `corepack pnpm --filter @pastlife/mobile typecheck && corepack pnpm exec playwright test e2e/mobile-device-polish.spec.ts --project=chromium`

Expected: 가로 오버플로 없음, 6개 보기 모두 접근 가능, 태블릿에서 최대 폭 중앙 정렬.

- [ ] **Step 5: 커밋한다**

Commit: `fix: compact question typography on Android devices`

---

### Task 3: 로딩 화면을 전생 복원 연출로 변경

**Files:**
- Modify: `apps/mobile/app/analysis.tsx`
- Modify: `apps/mobile/src/ads/admob.ts`
- Modify: `apps/mobile/src/i18n/en.ts`
- Modify: `apps/mobile/src/i18n/th.ts`
- Modify: `apps/mobile/src/i18n/ja.json`
- Test: `apps/mobile/src/ads/admob.test.ts`

**Interfaces:**
- Produces: `showTransitionAd({ timeoutMs?: number }): Promise<void>`
- Produces: 0초·2초·4초에 변하는 중앙 로딩 단계 문구.

- [ ] **Step 1: 광고 제한 시간 테스트를 작성한다**

가짜 광고 객체가 이벤트를 발생시키지 않을 때 7초 안에 promise가 종료되는 fake-timer 테스트를 작성한다.

```ts
vi.useFakeTimers();
const promise = showTransitionAd({ timeoutMs: 6000 });
await vi.advanceTimersByTimeAsync(6000);
await expect(promise).rejects.toThrow('Interstitial load timed out');
```

- [ ] **Step 2: 제한 시간을 6초 기본값으로 구현한다**

```ts
export async function showTransitionAd({ timeoutMs = 6000 }: { timeoutMs?: number } = {}): Promise<void> {
  // 기존 이벤트 구독은 유지하고 timeout만 인자로 제어한다.
}
```

- [ ] **Step 3: `analysis.tsx`를 배경 이미지 연출로 변경한다**

`cinematic-question-bg.png`를 전체 배경으로 사용하고 검은색 55% 그라데이션/오버레이 위에 로고, 중앙 제목, 금색 indicator와 단계 문구를 배치한다. 제목에 사용하던 `flex: 1`은 제거하고 중앙 컨테이너에 `justifyContent: 'center'`를 적용한다.

- [ ] **Step 4: 4개 언어의 단계 문구를 추가한다**

한국어 키는 다음 세 문장으로 고정한다.

```text
당신의 선택을 살펴보고 있습니다
전생의 기록을 복원하고 있습니다
마지막 장면을 준비하고 있습니다
```

- [ ] **Step 5: 오류와 광고 실패 동작을 검증하고 커밋한다**

Run: `corepack pnpm --filter @pastlife/mobile test && corepack pnpm --filter @pastlife/mobile typecheck`

Expected: 광고 성공·오류·시간초과 모두 결과 이동을 막지 않고, API 실패만 재시도 UI를 표시.

Commit: `feat: turn result loading into a bounded cinematic transition`

---

### Task 4: 양피지 폭과 자동 분할 렌더링 일치

**Files:**
- Modify: `apps/mobile/src/components/ResultHero.tsx`
- Modify: `apps/mobile/src/components/MeasuredPageFlow.tsx`
- Modify: `apps/mobile/src/components/CinematicChapterPager.tsx`
- Modify: `apps/mobile/src/results/paginate.test.ts`
- Test: `e2e/mobile-device-polish.spec.ts`

**Interfaces:**
- Consumes: `MeasuredPageFlow`의 실제 onLayout 폭·높이.
- Produces: 측정과 표시가 동일한 `width: '100%'`, 동일 padding을 사용하는 양피지 본문.

- [ ] **Step 1: 320px 양피지 회귀 테스트를 작성한다**

양피지 frame, texture, visible page의 `getBoundingClientRect().width` 차이가 1px 이하이고 본문 scrollHeight가 clientHeight를 넘지 않는지 검사한다.

- [ ] **Step 2: 현재 테스트가 오른쪽 단색 띠 또는 폭 불일치로 실패하는지 확인한다**

Run: `corepack pnpm exec playwright test e2e/mobile-device-polish.spec.ts -g "parchment"`

- [ ] **Step 3: 양피지와 본문을 하나의 frame에 배치한다**

양피지 이미지는 absolute fill로 전체 frame을 덮고 본문 inset은 별도 내부 View에만 적용한다. `MeasuredPageFlow`의 측정 node와 표시 node에 동일한 `styles.pageContent`를 전달한다. 오른쪽 화살표 공간은 양피지 내부 폭에서 빼지 않고 외부 overlay로 둔다.

- [ ] **Step 4: 자동 분할 테스트를 확장한다**

한국어 장문, 공백 없는 태국어, 긴 영어 단어, 일본어 문단에서 마지막 토큰까지 보존되고 빈 페이지가 생성되지 않는 단언을 추가한다.

- [ ] **Step 5: 320px·768px 검증 후 커밋한다**

Run: `corepack pnpm --filter @pastlife/mobile test && corepack pnpm exec playwright test e2e/mobile-device-polish.spec.ts`

Expected: 질감 단절 없음, 본문 잘림 없음, 마지막 문장 누락 없음.

Commit: `fix: align measured story pages with parchment bounds`

---

### Task 5: 결과 하단 행동 영역 재배치

**Files:**
- Modify: `apps/mobile/app/result.tsx`
- Modify: `apps/mobile/src/components/ParchmentButton.tsx`
- Test: `e2e/mobile-device-polish.spec.ts`

**Interfaces:**
- Produces: 세로 배치된 아카이브/새 기록 버튼과 safe-area 하단 여백.

- [ ] **Step 1: 긴 번역 버튼이 겹치지 않는 테스트를 작성한다**

320px에서 두 버튼의 bounding box가 겹치지 않고 각 label의 scrollWidth가 clientWidth 이하인지 검사한다.

- [ ] **Step 2: 보조 버튼을 세로로 변경한다**

```ts
secondaryActions: { width: '100%', flexDirection: 'column', gap: spacing.sm },
secondaryAction: { width: '100%', minWidth: 0 },
```

`ParchmentButton`의 고정 `aspectRatio`를 제거하고 `minHeight: 72`, `paddingVertical: 12`를 사용한다. label은 최대 두 줄과 충분한 좌우 여백을 사용한다.

- [ ] **Step 3: 하단 내비게이션 위에 safe-area 여백을 확보한다**

`actionRail`의 `paddingBottom`에 `insets.bottom + spacing.lg`를 적용하고 버튼과 내비게이션을 별도 블록으로 나눈다.

- [ ] **Step 4: 검증 후 커밋한다**

Run: `corepack pnpm --filter @pastlife/mobile typecheck && corepack pnpm exec playwright test e2e/mobile-device-polish.spec.ts -g "result actions"`

Commit: `fix: stack result actions for narrow and translated screens`

---

### Task 6: BGM·효과음의 실기기 재생 보장

**Files:**
- Create: `apps/mobile/src/audio/config.ts`
- Create: `apps/mobile/src/audio/config.test.ts`
- Modify: `apps/mobile/src/audio/AudioExperience.tsx`
- Modify: `apps/mobile/src/audio/effects.ts`
- Modify: `apps/mobile/src/session/store.ts`
- Modify: `apps/mobile/app/settings.tsx`
- Modify: `apps/mobile/src/i18n/en.ts`
- Modify: `apps/mobile/src/i18n/th.ts`
- Modify: `apps/mobile/src/i18n/ja.json`

**Interfaces:**
- Produces: `AUDIO_LEVELS = { music: 0.18, choice: 0.42, writing: 0.28 }`
- Produces: `subscribePreferences(listener): () => void`
- Produces: `previewBackgroundMusic()`와 `playChoiceEffect()`.

- [ ] **Step 1: 오디오 정책 테스트를 작성한다**

```ts
expect(AUDIO_LEVELS).toEqual({ music: 0.18, choice: 0.42, writing: 0.28 });
expect(experienceRoute.test('/question/1')).toBe(true);
expect(experienceRoute.test('/settings')).toBe(false);
```

- [ ] **Step 2: `setAudioModeAsync`로 앱 오디오 세션을 초기화한다**

```ts
await setAudioModeAsync({
  playsInSilentMode: true,
  shouldPlayInBackground: false,
  interruptionMode: 'mixWithOthers',
});
```

- [ ] **Step 3: 효과음을 모듈 로드 시 사전 적재하고 재사용한다**

`preload(choiceSource)`와 `preload(writingSource)`를 호출하고, player가 준비되지 않은 첫 탭은 예외를 삼키는 대신 개발 로그에 원인을 기록한다. 선택할 때마다 `pause → seekTo(0) → volume 설정 → play` 순서를 유지한다.

- [ ] **Step 4: 설정 변경 구독을 구현한다**

`savePreferences`가 저장 완료 후 listener에 새 값을 알리고 `AudioExperience`가 즉시 BGM을 재생·일시정지하게 한다. 컴포넌트 unmount 시 반드시 unsubscribe한다.

- [ ] **Step 5: 설정 화면에 시험 재생 버튼을 추가한다**

`배경음악 미리 듣기`와 `효과음 테스트`를 4개 언어로 제공한다. 시험 재생은 현재 토글이 켜진 항목에서만 동작한다.

- [ ] **Step 6: 단위 검사와 Android 실기기 검사 후 커밋한다**

Run: `corepack pnpm --filter @pastlife/mobile test && corepack pnpm --filter @pastlife/mobile typecheck`

Manual expected: 앱 시작 후 BGM이 들리고, 첫 번째 답 선택부터 효과음이 들리며, 설정 토글이 즉시 반영되고 앱 재실행 후 유지됨.

Commit: `fix: initialize and preload the mobile audio experience`

---

### Task 7: 네트워크·이미지·접근성 상태 정돈

**Files:**
- Modify: `apps/mobile/src/api/client.ts`
- Modify: `apps/mobile/src/components/ResultHero.tsx`
- Modify: `apps/mobile/app/result.tsx`
- Modify: `apps/mobile/src/i18n/en.ts`
- Modify: `apps/mobile/src/i18n/th.ts`
- Modify: `apps/mobile/src/i18n/ja.json`
- Test: `apps/mobile/src/api/client.test.ts`

**Interfaces:**
- Produces: 제한 시간이 있는 공통 `request`와 네트워크 오류 code `NETWORK_UNAVAILABLE`.
- Produces: 이야기 이미지 로딩·실패·재시도 상태.

- [ ] **Step 1: fetch 시간초과와 오프라인 오류 테스트를 작성한다**

AbortController fake timer를 사용해 12초 뒤 `NETWORK_UNAVAILABLE`로 정규화되는지 검사한다.

- [ ] **Step 2: 공통 요청 제한 시간을 구현한다**

모든 API 요청은 기본 12초 제한 시간을 사용하되 결과 생성 POST에는 30초를 명시한다. `finally`에서 timer를 해제한다.

- [ ] **Step 3: 이미지 로딩 상태를 추가한다**

이미지 로딩 중에는 어두운 배경과 금색 indicator를 표시하고, 실패 시 텍스트는 유지하면서 `이미지 다시 불러오기` 버튼을 제공한다.

- [ ] **Step 4: 접근성과 시스템 글자 확대를 검증한다**

버튼 role/label/state를 유지하고, 글자 확대 시 고정 높이로 내용을 자르지 않는다. 장식 이미지는 `accessible={false}`로 유지한다.

- [ ] **Step 5: 검사 후 커밋한다**

Run: `corepack pnpm --filter @pastlife/mobile test && corepack pnpm --filter @pastlife/mobile typecheck`

Commit: `feat: expose recoverable network and image states`

---

### Task 8: 전체 회귀, 배포, APK 실기기 승인

**Files:**
- Modify: `docs/superpowers/plans/2026-10-27-android-device-ui-audio-polish.md` 체크박스
- Create: `output/android-device-polish-qa.md`

**Interfaces:**
- Consumes: Tasks 1~7의 단일 통합 커밋 흐름.
- Produces: 개발·운영 배포 기록과 설치 가능한 preview APK.

- [ ] **Step 1: 전체 자동 검사를 실행한다**

Run:

```powershell
corepack pnpm typecheck
corepack pnpm test
corepack pnpm test:e2e:browser
```

Expected: 전체 검사 통과. 실패 항목은 우회하지 않고 해당 task로 되돌아가 수정.

- [ ] **Step 2: 320px·일반 Android·768px 화면을 캡처한다**

시작, 로딩, 질문, 양피지, 결과 하단, 설정 화면을 한국어와 가장 긴 번역 언어로 확인한다. 가로 오버플로, 상태 표시줄 겹침, 문구 잘림이 없어야 한다.

- [ ] **Step 3: 오디오 실기기 검수표를 기록한다**

기기 스피커, 진동 모드, 블루투스 이어폰에서 BGM·첫 선택 효과음·필기음·설정 토글을 확인하고 결과를 `output/android-device-polish-qa.md`에 기록한다.

- [ ] **Step 4: 개발 배포를 실행한다**

Run: `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/deploy.ps1 -Environment dev`

Expected: dev 브랜치, Cloud Run API, DB migration, Cloudflare health 모두 성공.

- [ ] **Step 5: 운영 배포 조건을 확인하고 승격한다**

운영 Google OAuth ID와 AdMob 운영 광고 단위가 설정된 경우에만 실행한다.

Run: `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/deploy.ps1 -Environment prod -ConfirmProduction`

Expected: prod API와 Cloudflare health 모두 성공. 필수 운영값이 없으면 정확한 누락값을 기록하고 운영 성공으로 보고하지 않는다.

- [ ] **Step 6: preview APK를 생성한다**

Run: `npx --yes eas-cli@latest build --platform android --profile preview --non-interactive`

Expected: EAS build `FINISHED`, APK 다운로드 URL 생성, 원격 120편 이미지 자산은 archive에서 제외.

- [ ] **Step 7: 최종 실기기 승인 기준을 확인한다**

```text
[ ] 상태 표시줄과 로고가 겹치지 않는다.
[ ] 질문은 3~4줄 안에서 읽히고 보기 6개에 접근할 수 있다.
[ ] 짧은 보기는 한 줄, 긴 보기는 최대 두 줄이다.
[ ] 양피지 질감이 끊기지 않고 마지막 문장이 누락되지 않는다.
[ ] 로딩 화면은 중앙 연출이며 광고 실패 시 7초 안에 결과로 이동한다.
[ ] 결과 하단 버튼과 내비게이션이 겹치지 않는다.
[ ] BGM과 첫 선택 효과음이 실기기에서 들린다.
[ ] 설정 토글이 즉시 반영되고 재실행 후 유지된다.
[ ] 한국어·영어·태국어·일본어에서 가로 오버플로가 없다.
```

- [ ] **Step 8: 문서 상태와 최종 커밋을 반영한다**

Commit: `docs: record Android device polish verification`

---

## Self-Review

- **Spec coverage:** 안전 영역, 로고, 질문, 보기, 양피지, 결과 버튼, 로딩 연출, 광고 제한 시간, BGM, 효과음, 설정 즉시 반영, 네트워크·이미지 상태, 다국어·휴대폰·태블릿 QA를 Tasks 1~8에 연결했다.
- **Logic protection:** 질문 의미, choice ID, 채점, 결과 데이터와 원고는 어떤 task에서도 변경하지 않는다.
- **No placeholders:** 각 task에 대상 파일, 인터페이스, 실행 명령, 기대 결과, 커밋 경계를 기록했다.
- **Type consistency:** `mobileMetrics`, `showTransitionAd`, `subscribePreferences`, `AUDIO_LEVELS` 명칭을 모든 task에서 동일하게 사용했다.

