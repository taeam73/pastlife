# Question Scoring Audit and Balance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the six-stage, six-choice question scoring system balanced, explainable, and resistant to one-sided or repetitive result selection.

**Architecture:** Keep the existing content JSON and deterministic result pipeline. Add a pure scoring-audit layer that reports coverage, choice balance, and sensitivity; use normalized stage weights and centered tag/axis contributions so each answer expresses direction instead of only adding positive totals. Preserve the public six-answer contract and add regression tests before changing behavior.

**Tech Stack:** TypeScript, Vitest, pnpm workspace packages.

## Global Constraints

- Keep exactly six answers required, one answer per stage.
- Keep six choices per displayed question and the existing deterministic question selection.
- Korean copy must be short, concrete, and easy for teenagers to understand.
- Do not remove existing content IDs or break stored answer hashes.
- All result generation must remain deterministic for the same answers, seed, and content version.

---

### Task 1: Add a scoring audit report

**Files:**
- Create: `packages/scoring/src/audit.ts`
- Modify: `packages/scoring/src/index.ts`
- Test: `packages/scoring/test/scoring-audit.test.ts`

**Interfaces:**
- `auditQuestionScoring(): ScoringAuditReport` reads the current catalog and returns tag/axis coverage, per-stage balance, and warnings.
- `ScoringAuditReport` contains machine-readable counts and warning strings so CI can detect regressions.

- [ ] **Step 1: Write failing tests** for six stages, six choices, tag coverage, axis coverage, and warning detection.
- [ ] **Step 2: Run the focused test and confirm it fails because the audit module is absent.**
- [ ] **Step 3: Implement the pure audit function using `questions`, `tags`, and `axes` from `@pastlife/content`.**
- [ ] **Step 4: Run the focused test and confirm it passes.**
- [ ] **Step 5: Export the audit API from `packages/scoring/src/index.ts`.**

### Task 2: Balance the scoring calculation

**Files:**
- Modify: `packages/scoring/src/score.ts`
- Modify: `packages/scoring/src/types.ts` only if the score summary needs diagnostic fields
- Test: `packages/scoring/test/scoring.test.ts`

**Interfaces:**
- `calculateScores(answers)` keeps its existing signature and return shape unless an additive diagnostic field is required.
- Stage weights must sum to 6.0 so a six-answer score remains comparable to an unweighted six-answer score.

- [ ] **Step 1: Add tests proving answer order does not change scores, each stage has equal total influence, and an answer cannot increase every tag at once.**
- [ ] **Step 2: Run the focused tests and confirm the new balance assertions fail with the current positive-only implementation.**
- [ ] **Step 3: Replace arbitrary cumulative weighting with normalized stage weights and centered choice contributions while preserving the allowed score ranges.**
- [ ] **Step 4: Run the focused tests and the existing scoring determinism tests.**
- [ ] **Step 5: Check that `calculateResult` still produces valid candidates and deterministic output.**

### Task 3: Add combination and repetition validation

**Files:**
- Create: `packages/scoring/src/combination-audit.ts`
- Modify: `packages/scoring/src/index.ts`
- Test: `packages/scoring/test/combination-audit.test.ts`

**Interfaces:**
- `auditAnswerSpace(sampleLimit?: number)` samples valid six-stage answer combinations and reports distinct score signatures, top-tag distribution, and result-selection diversity.
- Sampling must be deterministic and must not generate an unbounded `6^6` matrix in production tests.

- [ ] **Step 1: Write tests for deterministic sampling, nonzero signature diversity, and a warning when one tag dominates.**
- [ ] **Step 2: Run the focused tests and confirm the module is missing.**
- [ ] **Step 3: Implement bounded deterministic sampling over the six choices for each stage.**
- [ ] **Step 4: Run the focused tests and inspect the reported distribution.**

### Task 4: Document the scoring rules and verify all packages

**Files:**
- Modify: `docs/development-writing-guidelines.md` if a scoring-copy rule is needed
- Modify: `전생록_Codex_개발_착수_명세.md` with the final scoring constraints

- [ ] **Step 1: Document that score weights describe priorities, not personality labels, and that no result should be selected from one answer alone.**
- [ ] **Step 2: Run content tests and typechecks.**
- [ ] **Step 3: Run scoring tests, API tests, and the final audit report.**
- [ ] **Step 4: Review the diff for preserved IDs and deterministic behavior.**

## Self-Review Checklist

- Six-stage validation remains enforced.
- Six choices remain enforced for every question.
- No legacy question or choice IDs are removed.
- Score totals remain comparable across sessions.
- The audit reports actual weaknesses instead of silently hiding them.
- Korean user-facing text remains simple and concrete.
