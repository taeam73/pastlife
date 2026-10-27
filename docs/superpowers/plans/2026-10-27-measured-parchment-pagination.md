# Measured parchment pagination implementation plan

**Goal:** Paginate every result parchment page by the text area actually available on the current device, while preserving all manuscript text and chapter navigation.

**Architecture:** A shared React Native page flow measures candidate text with the same typography used for display. It searches for the largest text slice that fits, then repeats for the remaining source. Profile sections retain their editorial order, but may continue onto another page when needed. The chapter pager receives the measured count from the rendered page.

**Tech Stack:** React Native 0.86, Expo 57, TypeScript, Playwright, Vitest.

## Constraints

- Preserve story data, chapter order, question and result logic.
- Use the existing responsive result frame at 320px and tablet widths.
- No hidden text may trigger the writing animation or sound effect.
- Keep browser and native rendering paths aligned.

## Tasks

- [x] Establish baseline typecheck and tests. Inspect `ParchmentReader`, `ParchmentSummary`, `CinematicChapterPager` and existing pagination tests.
- [x] Add a shared `MeasuredPageFlow` component that measures real rendered candidate height and exposes completed pages and page count. Ensure long unbroken words and resized layouts make progress.
- [x] Replace fixed character pagination in `ParchmentReader` and fixed profile page display in `ParchmentSummary` with measured pages. Reserve title and control space; render a visible page only after measurement completes.
- [x] Make `CinematicChapterPager` use the measured page count for outer navigation, including chapter changes and viewport resize.
- [x] Run mobile and workspace typechecks/tests, one 3.0 browser result flow at 320px and tablet width, and inspect overflow and page continuity. The 3.0 browser checks pass, including full 02 text continuity. Native Android rendering remains for the later Play build because this machine has no Android build host. A separate 2.5 browser journey fails before pagination checks because its result image is absent; `ResultHero` returns no frame when its image URI cannot be resolved.
