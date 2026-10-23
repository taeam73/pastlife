# 3.0 Release Image Pruning Implementation Plan

> **For agentic workers:** Execute inline in this task. The user authorized this 3.0-only release preparation and separately paused manuscript production. Do not dispatch subagents, commit, push, deploy, or delete existing source images.

**Goal:** Exclude historical 2.5-era character and location images from the 3.0 mobile release bundle while retaining every story-specific image and current app branding.

**Architecture:** The mobile resolver uses literal `require()` entries, so Metro sees every asset in that registry as reachable. Keep the 101 story-specific pairs and the branding fallback; remove legacy character and location entries from the mobile registry. Leave the tracked source images and API 2.5 compatibility code intact in this pass so prior work remains recoverable. Prove bundle impact with a web export and a registry guard.

**Tech Stack:** Expo/React Native, TypeScript, Node.js, pnpm.

## Global Constraints

- The 3.0 catalog currently has 101 story cards and 101 distinct background/portrait pairs; manuscript creation remains paused.
- `CONTENT_VERSION` defaults to `3.0.0`; do not change user-facing story content, question semantics, scoring, or result schema.
- Preserve all existing uncommitted work and source image files. No commit, push, or deployment.

---

### Task 1: Measure and remove mobile legacy-image references

**Files:** `apps/mobile/src/results/libraryImages.ts`

**Interface:** Keep `resolveLibraryImage(uri: string): ImageSourcePropType | undefined` unchanged. Its registry must contain only `asset://stories/v3/*` and the `asset://branding/main-bg-01.png` story fallback.

- [x] Measured 258 legacy source images: 534.31 MiB in `characters` and `library`.
- [x] Removed 258 legacy `require()` entries and two unused older story-background revisions, retaining 101 story pairs and the branding fallback.
- [x] Verified `rg -n "asset://(characters|library)/" apps/mobile/src/results/libraryImages.ts` finds no entries.

### Task 2: Guard the 3.0 release registry

**Files:** `scripts/check-release-image-registry.mjs`, `package.json`

**Interface:** Node script reads the mobile registry and API story map, fails if a legacy image URI is statically required or if any story image URI is absent, and reports the 101 mapped pairs. Add it to `content:check` without changing existing legacy compatibility tests.

- [x] Created the guard using `readFileSync`, matching `asset://stories/v3/*.jpg|webp` and equal API/mobile URI sets.
- [x] Asserted that the mobile registry contains only story images and the branding fallback.
- [x] Ran `node scripts/check-release-image-registry.mjs`: 101 pairs, 203 reachable assets, 56.23 MiB source bytes.

### Task 3: Align release preflight with 3.0

**Files:** `scripts/staging-env.mjs`, `scripts/staging-env.test.mjs`

**Interface:** `inspectStagingEnv` must accept `CONTENT_VERSION=3.0.0` and reject 2.5 for this release while leaving its database, TLS, storage and credential checks intact.

- [x] Changed the tests to expect 3.0 and confirmed they fail against the old 2.5 rule.
- [x] Changed the release gate to 3.0 and ran `node --test scripts/staging-env.test.mjs`: 8 passed.

### Task 4: Verify bundle, flow, and document limits

**Files:** `PROJECT_STATUS.md`, `docs/superpowers/plans/2026-10-23-v3-release-image-pruning.md`

- [x] Ran `corepack pnpm typecheck`, `corepack pnpm test`, `corepack pnpm content:check`, and `corepack pnpm test:e2e`: passed after replacing the legacy registry gate.
- [x] Exported web (76.51 MiB output) and Android (78.76 MiB output). Android metadata lists exactly 101 JPEG backgrounds and 101 WebP portraits; none of the 258 old source-image MD5 hashes appears among exported assets. These are export bytes, not an installed APK size.
- [x] Reran the 3.0 Teresa result in the browser at 320px and 768px: profile pages and story chapters rendered with images, test passed.
- [x] Updated `PROJECT_STATUS.md` with the 3.0-only asset packaging decision and caveat: old source files and 2.5 code remain in the repository, but are excluded from this mobile registry. `git diff --check` passed.

### 출시 전 후속 작업: DB 질문·번역 데이터 정합성 (미완료)

- [x] `prisma/seed.ts`가 버전별 질문 집합을 기록하도록 수정했다. 3.0 코드는 질문 24개와 선택지 144개를 seed한다. 실제 DB 적용은 아직 하지 않았고, 기존 2.5 세션 보존 범위는 데이터 변경 전에 정한다.
- [ ] 실제 DB에서 `questions`, `choices`, `translations`, `content_versions`의 버전별 항목과 이전 문구의 잔존 여부를 **읽기 전용**으로 확인한다. 2026-10-23에는 로컬 DB `127.0.0.1:5433` 접속 실패로 확인하지 못했다.
- [ ] 확인 결과에 따라 3.0 출시에서 불필요한 옛 항목의 정리 범위를 결정하고, 백업·복구 경로를 마련한 뒤 정리한다. 이후 DB 내용과 새 세션의 API 질문·선택지가 일치하는지 확인한다. 아직 데이터 삭제나 마이그레이션은 실행하지 않았다.
