# Thai preview: CLOWN

The Thai preview is a one-story trial. It includes the 24 assessment questions and 144 choices, the main UI and settings, all three CLOWN episode signals, profile pages, timeline, memories, final moment, PDF labels, share image, and archive title. Korean IDs, scoring signals, ages, and media remain the source of truth.

## Verified on 2026-10-27

- Content coverage: 1/120 stories and 3/360 signal paths.
- `corepack pnpm typecheck` passed.
- Content tests: 44 passed; API tests: 141 passed; mobile tests: 16 passed.
- Browser flow passed from Thai home through six questions, CLOWN result, final moment, PDF, image share, and archive.
- Every visible profile/episode/timeline/memory page fit the parchment at 320px and 768px; the browser test checked that all source text appeared across pages and Korean text was absent.
- The nine-page browser PDF was rendered and visually inspected. Thai glyphs were legible on the cover and text pages.

## Release gate

Thai stays `preview` in `packages/content/src/locales.ts`. The remaining 119 stories and 357 signal paths require translation and review before a Thai public release. Verify Android native font rendering, PDF and share flows on a device, then review Thai prose with a fluent Thai reader before changing its availability to `released`.
