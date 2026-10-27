# 3.0 translations

Korean is the source for 120 stories and 24 questions. Translations keep story IDs, choice IDs, scoring signals, three story paths per story, numeric ages, and image URIs unchanged. The frozen Korean snapshots and their hashes are in `output/english-source/`.

Each language has a packaged story catalog in `<locale>/catalog.json`, a question translator, and a coverage check. App UI strings live in `apps/mobile/src/i18n/`. `packages/content/src/locales.ts` controls whether a language is selectable in production. A missing story translation fails explicitly rather than showing Korean prose in a different language.

English, Thai, and Japanese each have 120 story drafts and 360 story paths packaged and are selectable in production. All three languages use AI first drafts at the user's request. The structural checks below do not establish literary quality or historical accuracy.

## Resume a manuscript batch

1. Run `corepack pnpm translation:source:check`. It must confirm that the live Korean stories match the frozen snapshots.
2. Set `OPENAI_API_KEY` in the local process environment. Do not put its value in a command argument, file, or chat message.
3. Run `corepack pnpm translation:english:draft`, `translation:thai:draft`, or `translation:japanese:draft` with `--model gpt-5.6-sol --max-stories <count> --max-usd <limit>`. The script skips saved stories with matching source hashes and stores each response with token usage and draft status in `output/<language>-translations/<STORY_ID>.json`. `--shard-index` and `--shard-count` can divide the work across processes.
4. Run `corepack pnpm translation:<language>:check`. This requires all 120 drafts and checks structure, missing strings, Hangul, numbers, profile lines, and paragraph counts. Use `node scripts/check-english-drafts.mjs --locale <code> --allow-partial` to inspect an unfinished batch.
5. Run `corepack pnpm translation:<language>:package` only after all 120 pass. This rebuilds the app catalog. Partial packaging is for development preview only.
6. Run type checks, unit tests, and the language's browser flow. Confirm the parchment at phone and tablet widths and inspect a sample PDF and shared image. Android device validation remains a separate release check.

For Japanese UI and questions, `node scripts/tsx-cli.mjs scripts/export-locale-ui-source.ts` captures the current Korean keys, and `corepack pnpm translation:japanese:ui` translates and packages them. The story and UI batches can be resumed independently.

The costs recorded in draft JSON files are estimates from API token usage. Automated checks cannot verify every name, relationship, event, nuance, or natural phrasing. Keep corrections in the draft file, then repackage the catalog.
