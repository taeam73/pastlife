# Character Profile Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the narrative character introduction with a compact, visually distinct past-life profile card and remove its facts from later story sections.

**Architecture:** Reuse the existing structured character response fields and render seven labeled facts instead of `character.introduction`. Keep identity facts owned by the card by removing appearance, hobby, and dream copy from narrative chapters and the duplicate daily-life highlight.

**Tech Stack:** React Native/Expo Web, TypeScript, StyleSheet, Vitest.

## Global Constraints

- Card categories: 이름, 직업, 성별, 외모, 성격, 취미, 꿈.
- Each category value displays at most one sentence.
- Appearance, personality, hobby, and dream must not be repeated in the story blocks or highlights below the card.
- Layout must wrap long Korean safely and preserve readable contrast on the existing dark theme.
- The card is informational, not interactive; do not add fake buttons or unnecessary animation.

---

### Task 1: Content ownership regression

**Files:**
- Modify: `apps/api/test/story-narrative.spec.ts`
- Modify: `apps/api/src/providers/story-narrative.ts`

**Interfaces:**
- Consumes: `StoryProfile` identity and daily-life fields.
- Produces: story blocks that omit card-owned appearance, hobby, and dream facts.

- [ ] Add assertions that those complete facts are absent from the six story blocks.
- [ ] Remove the duplicated identity paragraph and split the relationship paragraph from hobby/dream copy.
- [ ] Run focused story tests.

### Task 2: Profile card component

**Files:**
- Modify: `apps/mobile/src/components/ResultExperience.tsx`

**Interfaces:**
- Consumes: existing `character.name`, `occupation`, `gender`, `appearance`, `temperament`, `hobby`, and `dream`.
- Produces: a semantic read-only card with compact label/value rows.

- [ ] Add a safe one-sentence summary helper.
- [ ] Replace the narrative introduction with a profile header, occupation/gender chips, and four labeled detail rows.
- [ ] Filter `DREAM_AND_DAILY` from highlights to prevent duplication.
- [ ] Add responsive styles with `minWidth: 0`, wrapping text, accent border, and clear hierarchy.

### Task 3: Verification and runtime

**Files:**
- Modify only for defects found during verification.

**Interfaces:**
- Produces: type-safe mobile/web rendering and restarted local services.

- [ ] Run API tests and API/mobile typechecks.
- [ ] Review the component against current Web Interface Guidelines for overflow, contrast, semantics, and non-interactive affordance.
- [ ] Restart the API and verify ports 8081 and 4000.
