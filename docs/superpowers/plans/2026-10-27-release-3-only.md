# Release 3.0 only implementation plan

**Goal:** The first Play release shows only the 120-story 3.0 experience, including restored sessions and archived results.

**Architecture:** Production API configuration requires 3.0, and production result access rejects older data. The app discards stale local sessions and no longer routes into 2.5 screens. Archive details pass the 3.0 presentation to the common result viewer. Older code and fixtures may remain for development tests but cannot surface in the release flow.

**Tech Stack:** Expo 57, React Native 0.86, NestJS 11, Vitest, Playwright.

## Tasks

- [x] Guard production content version at API startup and test the release invariant.
- [x] Ignore stored non-3.0 sessions; reject a non-3.0 response when starting a new mobile session.
- [x] Remove legacy branches from the main result and analysis screens; redirect direct links to 2.5-only screens.
- [x] Show archived 3.0 records with their cover and presentation; prevent older archived results from appearing in production.
- [x] Run typecheck, unit/API tests and targeted 3.0 browser flows. The old 2.5 browser journey is outside the release flow; a prior run failed because its result image was absent.
