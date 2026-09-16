# Google OAuth and Authentication Hardening Implementation Plan

**Goal:** Replace the implicit mock login with an explicit, production-ready Google ID-token flow while preserving an isolated mock path for automated tests.

**Architecture:** The mobile app starts Google OpenID Connect from a dedicated login screen and sends only the returned ID token to the API. The API verifies the token with Google's official library, issues the existing app access token, and associates users by the stable Google subject rather than by email. Production configuration fails closed when secrets or Google audiences are missing, while tests opt into mock authentication explicitly.

**Tech Stack:** Expo Router, Expo AuthSession, Expo SecureStore, NestJS, Google Auth Library, Prisma/PostgreSQL, Vitest, Playwright.

---

## Task 1: Harden server-side Google verification and configuration

**Files:**
- Create: `apps/api/src/config/auth.ts`
- Modify: `apps/api/src/providers/google-oauth.provider.ts`
- Modify: `apps/api/src/providers/providers.module.ts`
- Modify: `apps/api/src/auth/auth.module.ts`
- Modify: `apps/api/src/auth/auth.service.ts`
- Test: `apps/api/test/auth-config.spec.ts`
- Test: `apps/api/test/google-oauth.provider.spec.ts`

1. Add tests covering accepted Google client audiences and production fail-closed rules.
2. Add tests for verified claims and rejection of incomplete Google identities.
3. Implement centralized auth environment parsing.
4. Replace the Google `tokeninfo` request with `google-auth-library` ID-token verification.
5. Require an explicit mock flag outside production and a strong JWT secret in production.
6. Run focused API tests and type checking.

## Task 2: Use stable provider identity for user accounts

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/202609160002_google_identity/migration.sql`
- Modify: `apps/api/src/auth/auth.service.ts`
- Test: `apps/api/test/api.e2e-spec.ts`

1. Add a unique constraint for provider and provider subject.
2. Change authentication lookup/upsert logic to use Google's stable `sub` claim.
3. Keep email and display name synchronized without changing account identity.
4. Expand the API journey test to prove repeat login resolves the same user.
5. Validate the Prisma schema and run API tests.

## Task 3: Add a user-initiated mobile login flow

**Files:**
- Create: `apps/mobile/app/login.tsx`
- Create: `apps/mobile/src/auth/google.ts`
- Modify: `apps/mobile/app/_layout.tsx`
- Modify: `apps/mobile/app/result.tsx`
- Modify: `apps/mobile/src/session/store.ts`
- Modify: `apps/mobile/package.json`
- Modify: `apps/mobile/app.json`

1. Add Expo AuthSession, WebBrowser, Crypto, and SecureStore dependencies.
2. Add a dedicated Google login screen with explicit user interaction.
3. Route unauthenticated archive attempts through the login screen.
4. Store access tokens in SecureStore on native platforms while retaining compatible web storage.
5. Keep mock sign-in visible only when the public mock flag is explicitly enabled.
6. Run mobile type checking and static export.

## Task 4: Update browser coverage and operating documentation

**Files:**
- Modify: `scripts/run-browser-e2e.mjs`
- Modify: `e2e/mobile-journey.spec.ts`
- Modify: `.env.example`
- Modify: `.env.neon.example`
- Modify: `README.md`
- Create: `docs/ninth-stage-report.md`

1. Make the browser test runner opt into mock Google auth explicitly.
2. Update the mobile journey to cover the new login interstitial.
3. Document Google client configuration, redirect URIs, and development-build requirements.
4. Document remaining external setup and the stage completion status.
5. Run the complete validation suite: type checks, unit/static tests, API E2E, browser E2E, Prisma validation, and static export.

No commits, pushes, or other GitHub mutations will be performed.
