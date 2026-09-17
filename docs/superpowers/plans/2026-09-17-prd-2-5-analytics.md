# PRD 2.5 Analytics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Add a privacy-bounded analytics pipeline for the PRD 2.5 funnel without allowing answer text or arbitrary user content into event payloads.

**Architecture:** Define an allowlisted Zod event contract shared by mobile and API, accept events through a dedicated Nest module, and persist them through Prisma in database mode while retaining a bounded in-memory sink for local and E2E use. Mobile instrumentation is best-effort so analytics outages never block the assessment or result flow.

**Tech Stack:** TypeScript, Zod, NestJS, Prisma/PostgreSQL, Expo/React Native, Vitest, Supertest, Playwright.

## Global Constraints

- Event names and metadata keys are allowlisted.
- Original question text, answer text, email, display name, and arbitrary free text are rejected.
- Analytics delivery failure must not interrupt user-facing flows.
- Existing result, unlock, login, and archive behavior remains unchanged.

---

### Task 1: Analytics contract and persistence

**Files:** `packages/contracts/src/analytics.ts`, `packages/contracts/src/index.ts`, `prisma/schema.prisma`, `prisma/migrations/202609170002_analytics_events/migration.sql`

- [x] Add the PRD event enum and a strict metadata schema containing only IDs, versions, state, locale, platform, and share format.
- [x] Add an append-only `AnalyticsEvent` Prisma model indexed by event name/time, session/time, and result/time.
- [x] Generate and validate the Prisma client.

### Task 2: Ingestion API

**Files:** `apps/api/src/analytics/*`, `apps/api/src/app.module.ts`, `apps/api/test/analytics.spec.ts`, `docs/openapi.yaml`

- [x] Add `POST /api/v1/analytics/events` with strict parsing and an opaque event ID response.
- [x] Store to Prisma in database mode and a bounded in-memory buffer otherwise.
- [x] Test valid ingestion, unknown event rejection, and extra/free-text field rejection.

### Task 3: Mobile funnel instrumentation

**Files:** `apps/mobile/src/analytics/track.ts`, session/question/analysis/result/deep/guide/login screens

- [x] Track session start, question shown, answer selection, question completion, and ad outcomes.
- [x] Track basic result, image state, view-mode changes, unlock CTA/outcomes, share format/readiness/completion, archive save, login, and re-exploration.
- [x] Swallow transport failures after validation so the UX remains available offline.

### Task 4: Verification and report

**Files:** `docs/eleventh-stage-report.md`, `docs/prd-2.5-implementation-report.md`

- [x] Run typecheck, unit tests, API E2E, browser E2E, Prisma validation, and diff checks.
- [x] Document collected fields, privacy exclusions, retention ownership, and the next production step.
