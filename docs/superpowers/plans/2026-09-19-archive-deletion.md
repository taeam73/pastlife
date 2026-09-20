# Archive Deletion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let an authenticated user remove an individual archive entry without deleting the underlying anonymous result or another user's data.

**Architecture:** Add an idempotent authenticated DELETE route to `AuthService`; delete only the user/result join row in Prisma or the matching in-memory set entry. Add a no-content API client path and a confirmation state on the archive detail screen.

**Tech Stack:** NestJS 11, Prisma 6, Expo Router, React Native, Vitest/Supertest, Playwright.

## Global Constraints

- Deletion removes only the authenticated user's archive association.
- The anonymous result, result image, analytics, and other users' archive associations remain intact.
- Missing archive associations return `204` to avoid exposing ownership information.
- Mobile deletion requires an explicit confirmation step and preserves the current result session.
- No commits are created until the user explicitly requests a commit.

---

### Task 1: Authenticated archive deletion API

**Files:**
- Modify: `apps/api/src/auth/auth.controller.ts`
- Modify: `apps/api/src/auth/auth.service.ts`
- Modify: `apps/api/test/vertical-flow.e2e.spec.ts`
- Modify: `docs/openapi.yaml`

- [x] Add an API E2E assertion that another user cannot read the archive, the owner can delete it with `204`, repeated deletion remains `204`, and the owner's list becomes empty.
- [x] Implement `DELETE /api/v1/auth/archive/:resultId` with bearer authentication.
- [x] Delete only `archive_entries` matching both `userId` and `resultId`, or the equivalent memory-set entry.
- [x] Document the no-content response and ownership semantics in OpenAPI.
- [x] Run API E2E and API typecheck.

### Task 2: Mobile confirmation and navigation

**Files:**
- Modify: `apps/mobile/src/api/client.ts`
- Modify: `apps/mobile/app/archive/[resultId].tsx`
- Modify: `e2e/mobile-journey.spec.ts`

- [x] Add an API client helper that accepts a successful `204` without attempting JSON parsing.
- [x] Add `기록 삭제` → `삭제 확인`/`취소` UI with loading and error handling.
- [x] Navigate to `/archive` after deletion while leaving the current assessment result intact.
- [x] Extend browser E2E to delete the saved entry and verify the empty archive state.
- [x] Run mobile typecheck and browser E2E.

### Task 3: Regression verification and documentation

**Files:**
- Modify: `docs/prd-2.5-implementation-report.md`
- Modify: `docs/superpowers/plans/2026-09-19-archive-deletion.md`

- [x] Document archive deletion semantics and retained data boundary.
- [x] Run workspace typecheck, unit tests, API E2E, and `git diff --check`.
- [x] Mark completed plan steps without committing the work.
