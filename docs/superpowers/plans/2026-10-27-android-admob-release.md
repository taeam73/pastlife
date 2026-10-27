# Android AdMob release integration implementation plan

> **For agentic workers:** Implement inline in this task. Steps use checkboxes to track reviewable changes. Do not delegate.

**Goal:** Replace simulated advertising in the Android 3.0 flow with real Google Mobile Ads, test safely with demo units, and require verified reward before unlocking the final moment.

**Architecture:** The Expo Android app owns ad loading, presentation and consent. The API owns session unlocks and validates AdMob rewarded server-side verification (SSV) callbacks using Google's rotating public keys and transaction IDs. Browser E2E retains an explicit mock provider, while production configuration fails closed if AdMob settings are missing.

**Tech Stack:** Expo 57, React Native 0.86, `react-native-google-mobile-ads` 17, NestJS 11, Prisma 6, Vitest.

## Global constraints

- Android only for the first Play release; preserve browser testing and existing 3.0 story data.
- No production ad traffic during development; use Google demo ad units and a native development build.
- The user-facing result and final-moment journey must remain recoverable if ad loading, callback delivery or network access fails.
- Do not commit credentials or delete `output/` or `tmp/`.
- Verify Google Play target-audience and ads declaration before release.

## File structure

- `apps/mobile/src/ads/admob.ts`: native SDK initialization, consent, ad loading/showing and reward events.
- `apps/mobile/src/ads/admob.web.ts`, `apps/mobile/src/ads/unlock.ts`: browser adapter and verified unlock flow.
- `apps/mobile/app/analysis.tsx`, `apps/mobile/app/result.tsx`, `apps/mobile/app/deep.tsx`: existing placement wiring and state.
- `apps/mobile/src/api/client.ts`: ad challenge/status requests and removal of production fake completion requests.
- `apps/mobile/app.config.js`, `apps/mobile/package.json`: native config plugin and dependency.
- `apps/api/src/ads/*`, `apps/api/src/providers/*`: challenge, signed callback and unlock path.
- `packages/contracts/src/*`: ad request/response contracts.
- Existing `AdEvent.providerEventId` unique index: idempotent AdMob transaction storage; no migration is needed.
- Focused API and mobile tests cover invalid signatures, replay, wrong session/slot, cancellation and retry.

### Task 1: Native test ad playback

- [x] Add `react-native-google-mobile-ads` and configure the Android app ID via the Expo config plugin, with a Google demo app ID only in development.
- [x] Implement consent-before-initialization and a native ad adapter. Slot 1 uses an interstitial at the question/result transition; slot 2 uses user-initiated rewarded video; legacy slot 3 uses rewarded video.
- [ ] Run mobile typecheck and a native Android development build. On an emulator or registered test device, confirm all three demo ads load, close and retry without live traffic.

### Task 2: Server-verified reward

- [x] Add a short-lived per-session/slot signed challenge so AdMob `custom_data` binds the SSV callback to the intended unlock.
- [x] Validate the original callback query bytes, ECDSA signature, `key_id`, timestamp, expected ad unit and unique `transaction_id` before granting a reward. Cache Google's public keys with refresh on rotation.
- [x] Expose a read-only unlock-status endpoint; the client may show success only after the API reports the unlock. Keep callback retries idempotent and reject replay across sessions.
- [x] Add tests that sign fixture callbacks with an isolated test key and prove tampering, stale timestamps and wrong ad units do not unlock. The existing repository tests exercise transaction reuse.

### Task 3: Production wiring and release checks

- [x] Reject fake completion in production; keep it for existing local/browser tests and Android demo-ad previews against a nonproduction API.
- [x] Require Android app/unit IDs in the production EAS build and a real rewarded unit ID in the production API; keep IDs in environment configuration.
- [ ] Re-run typecheck, unit tests, API E2E and browser E2E. Test the Android 3.0 flow on a native build at narrow and tablet widths, including ad cancellation, no-fill, delayed SSV and app restart.
- [x] Update README/runbook with AdMob console setup, Google Play ads declaration, test-device rules and app-ads.txt ownership verification.

## External account requirements

AdMob account and Android app ID, ad unit IDs, SSV callback configuration, public HTTPS API URL, and a native Android build host are needed for a live-ad release. Until these are available, the integration is verified with Google demo inventory only; live serving also depends on AdMob app readiness review.
