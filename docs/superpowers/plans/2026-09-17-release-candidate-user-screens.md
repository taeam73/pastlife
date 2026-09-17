# Release Candidate User Screens Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Close the remaining user-facing navigation and recovery gaps so every existing result, sharing, ad unlock, and account action has a complete screen state.

**Architecture:** Reuse the existing result contracts for archive detail instead of duplicating result data, add focused reusable status controls for async actions, and keep account state local to the authenticated device. API additions remain read-only and authorization-bound.

**Tech Stack:** Expo Router, React Native, NestJS, Zod, Vitest, Supertest, Playwright.

## Global Constraints

- Existing assessment, unlock, result, and archive semantics remain unchanged.
- Archived details require the signed-in user to own the archive entry.
- Share and ad failures keep the current result/session and expose an explicit retry.
- Logout removes only the device token; account deletion is not implied.

---

### Task 1: Authorized archive detail

**Files:** `packages/contracts/src/auth.ts`, `apps/api/src/auth/*`, `apps/mobile/app/archive.tsx`, `apps/mobile/app/archive/[resultId].tsx`, API and browser tests.

- [x] Add an authenticated archive-detail endpoint that verifies ownership.
- [x] Return the same image, headline, seven basic blocks, and disclaimer used by the result flow.
- [x] Make archive list cards actionable and render the detail in the saved view mode.

### Task 2: Share status and retry UI

**Files:** `apps/mobile/src/components/AsyncActionStatus.tsx`, `apps/mobile/app/result.tsx`.

- [x] Show format-specific creating, ready, failed, and retry states.
- [x] Keep video and image jobs independent and preserve the result on failure.
- [x] Continue to the system share sheet only after the share asset is ready.

### Task 3: Ad failure recovery

**Files:** `apps/mobile/src/components/UnlockAction.tsx`, result/deep screens.

- [x] Centralize ad loading state, failure copy, and retry controls.
- [x] Preserve result IDs and prevent duplicate taps while an unlock is running.
- [x] Retain existing analytics events for start, complete, and failure.

### Task 4: Account status and logout

**Files:** `apps/mobile/app/settings.tsx`, `apps/mobile/src/session/store.ts`, browser tests.

- [x] Display signed-in account name/email or a signed-out explanation.
- [x] Add explicit login navigation and local logout with confirmation copy.
- [x] Verify logout leaves the current anonymous session/result intact.

### Task 5: Verification and report

**Files:** `docs/twelfth-stage-report.md`, `docs/openapi.yaml`.

- [x] Run full typecheck, unit tests, API E2E, browser E2E, Expo export, Prisma validation, and diff checks.
- [x] Document delivered screen coverage and the remaining external-service work.
