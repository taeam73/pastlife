# 전생록 (Past Life Archive)

첫 Google Play 출시는 3.0 원고 120편만 사용합니다. 앱은 2.5 세션을 다시 열지 않으며, 운영 API는 3.0 이외의 콘텐츠 버전으로 시작하지 않습니다. 사용자 여정은 익명 질문 6단계, 3.0 결과와 마지막 순간, 이미지 공유·PDF, Google 로그인과 아카이브를 포함합니다. AdMob 계정 값과 Android 실기기 검증이 끝나기 전까지 실광고 송출은 준비 단계입니다.

## 시작

필수 도구는 Node.js 24와 Corepack입니다. 이 환경에서는 `pnpm` shim 권한 문제를 피하기 위해 `corepack pnpm`을 사용합니다.

```powershell
Copy-Item .env.example .env
corepack pnpm install
corepack pnpm typecheck
corepack pnpm test
corepack pnpm --filter @pastlife/content generate
```

PostgreSQL을 사용할 때는 `.env`의 `USE_IN_MEMORY_DB=false`, 런타임용 `DATABASE_URL`, migration용 `DIRECT_URL`을 설정하고 Prisma migration/seed를 실행합니다. 로컬 PostgreSQL에서는 두 URL이 같아도 됩니다.

기존 `.env`에 Neon direct URL만 들어 있다면 다음 명령으로 비밀값을 출력하지
않고 pooled/direct 설정으로 분리할 수 있습니다.

```powershell
corepack pnpm env:neon
```

```powershell
docker compose -f infra/docker-compose.yml up -d
corepack pnpm db:migrate
corepack pnpm db:seed
corepack pnpm --filter @pastlife/api start
```

API는 저장소 루트의 `.env`를 시작할 때 자동으로 읽습니다. Neon에서는 `DATABASE_URL`에 pooled URL, `DIRECT_URL`에 direct URL을 지정합니다. API는 Neon direct URL이나 SSL 누락을 거부하며, 운영 모드에서는 메모리 저장소를 허용하지 않습니다. Docker가 없는 개발 환경에서 `USE_IN_MEMORY_DB=true`를 지정하면 메모리 저장소를 사용합니다. API는 `4000`, Expo는 `8081`, 관리자는 `3000` 포트를 사용합니다.

## Google 로그인 설정

로컬 브라우저 테스트는 `.env.example`처럼 `USE_MOCK_GOOGLE=true`와
`EXPO_PUBLIC_USE_MOCK_GOOGLE=true`를 명시해야만 테스트 계정 로그인을 노출합니다.
운영 환경에서는 두 값을 `false`로 두고 다음 값을 설정합니다.

- API `GOOGLE_CLIENT_IDS`: 허용할 Web, iOS, Android OAuth 클라이언트 ID를 쉼표로 연결
- 앱 `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`
- 32자 이상의 임의 문자열인 `JWT_SECRET`

Google Cloud Console의 승인된 리디렉션 URI에는 웹 배포 주소의 `/login`을 등록하고,
iOS·Android는 `pastlife://login` 스킴을 사용합니다. 모바일 OAuth는 Expo Go가 아닌
development build 또는 배포 빌드에서 확인합니다. 실제 비밀값과 배포 URL은 Git에
추가하지 않고 로컬 `.env` 또는 배포 플랫폼의 secret/environment 설정에만 저장합니다.

## Android 광고 연동

전생록 3.0 Android 앱은 여섯 번째 답변 뒤 결과로 넘어갈 때 화면 전환 광고를 표시하고, 사용자가 `마지막 순간`을 열 때 보상형 광고를 표시합니다. 화면 전환 광고를 불러오지 못해도 기본 결과는 열리며, 마지막 순간은 보상형 광고 완료가 서버에서 확인된 뒤 열립니다.

개발 빌드에서는 Google의 데모 앱 ID와 데모 광고 단위를 사용합니다. `apps/mobile/eas.json`의 `preview` 프로필은 테스트 광고용 Android APK를 만들며 비운영 API에 연결해야 합니다. 운영 Android AAB를 빌드할 때는 `EXPO_PUBLIC_ADMOB_APP_ID`, `EXPO_PUBLIC_ADMOB_INTERSTITIAL_UNIT_ID`, `EXPO_PUBLIC_ADMOB_REWARDED_UNIT_ID`를 실제 AdMob 값으로 지정하고 `EXPO_PUBLIC_ADMOB_TEST_ADS`를 사용하지 않습니다. API에는 동일한 보상형 광고 단위를 `ADMOB_REWARDED_UNIT_ID`로 지정합니다.

AdMob 보상형 광고 단위의 서버 측 확인(SSV) URL은 공개 HTTPS API의 `/api/v1/ads/admob/ssv`입니다. 앱이 발급받은 30분 유효 챌린지를 `custom_data`로 보내면 API가 Google 공개키로 서명과 광고 단위·거래 ID를 확인합니다. AdMob 콘솔에서 Android 앱·광고 단위를 만들고 SSV URL을 등록해야 실제 보상 해제가 동작합니다. 앱을 Play에 연결한 뒤에는 개발자 사이트의 `app-ads.txt` 소유권 확인과 Play Console의 광고 포함 신고도 완료합니다. 대상 연령에 아동이 포함되는지에 따라 광고 정책과 동의 설정을 검토합니다. 테스트 중에는 실광고를 클릭하지 않습니다.

현재 로컬 작업에는 AdMob 계정 값과 Android 네이티브 빌드 환경이 없어 실제 광고 재생과 Google SSV 왕복은 아직 검증되지 않았습니다. 타입·단위·API E2E 검사를 통과해도 이 실기기 검사는 Play 내부 테스트 전에 별도로 필요합니다.

## 검증

```powershell
corepack pnpm typecheck
corepack pnpm test
corepack pnpm test:e2e
corepack pnpm test:e2e:browser
$env:EXPO_NO_TELEMETRY='1'; $env:EXPO_OFFLINE='1'; $env:CI='1'; corepack pnpm --filter @pastlife/mobile exec expo export --platform web
```

`test:e2e:browser`는 API, Expo web, 관리자 앱을 자동으로 시작하고 Chromium에서
모바일 전체 결과 여정과 관리자 초안·게시·롤백 여정을 검증한 뒤 모든 프로세스를
종료합니다. 테스트는 메모리 저장소를 강제하므로 로컬 또는 Neon 데이터에 영향을
주지 않습니다. 실패 스크린샷과 trace는 `output/playwright/`에 생성됩니다.

자세한 구현 범위와 제한은 [첫 구현 보고서](docs/first-slice-report.md)와 [실행 계획](docs/superpowers/plans/2026-09-16-past-life-vertical-slice.md)을 참고하세요.

## 과거 PRD 2.5 구현 참고

아래 항목은 과거 구현 기록이며 첫 Google Play 출시의 사용자 흐름에 포함되지 않습니다.

다음 값은 기획서에서 출시 전 운영 결정으로 남긴 항목이므로 코드에 확정값으로 묻지 않습니다.

- `AI_IMAGE_API_URL`, `AI_IMAGE_API_KEY`: 이미지 공급자와 인증
- `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`: 생성 이미지 비공개 저장소
- `PUBLIC_SHARE_URL`: 공개 공유 링크 및 Android App Links 기준 URL
- `GOOGLE_PLAY_URL`: 미설치 Android 사용자의 스토어 폴백
- `EXPO_PUBLIC_ANDROID_PACKAGE`, `EXPO_PUBLIC_APP_LINK_HOST`: Android 패키지와 검증된 링크 호스트
- 라이선스가 확인된 BGM·효과음 바이너리와 지역별 기본 재생 정책

`AI_IMAGE_API_URL`은 다음 JSON 요청을 받는 HTTPS 서비스여야 합니다. API는 요청마다
한 장과 low 품질을 고정하고 30초 안에 응답하지 않으면 한 번 재시도합니다.

```json
{
  "prompt": "controlled historical illustration prompt",
  "version": "2.5.0",
  "idempotencyKey": "result answer hash",
  "n": 1,
  "quality": "low"
}
```

성공 응답은 `{"uri":"https://...","alt":"..."}` 형식이어야 하며, HTTPS가 아닌
URI, 빈 대체 텍스트, 500자를 넘는 대체 텍스트는 실패로 처리됩니다. 공급자가 없거나
두 요청이 모두 실패하면 결과 흐름을 중단하지 않고 라이브러리 이미지를 저장합니다.

성공한 AI 이미지는 지원 형식(PNG, JPEG, WebP)과 10MB 제한을 검사한 뒤 비공개
S3 호환 버킷에 저장합니다. DB에는 만료되지 않는 `s3://bucket/key` 참조만 보관하고,
API 응답 시점에 15분 동안 유효한 서명 URL을 생성합니다. S3 자격 증명과 서명 URL은
로그에 기록하지 않으며, 저장 또는 서명 실패 시 검수된 라이브러리 이미지를 사용합니다.

`VIDEO` 공유 응답의 `TEMPLATE_READY`는 동일한 결과 이미지와 텍스트로 MP4를 만들 입력이 고정됐다는 뜻입니다. 실제 H.264/AAC 인코딩은 배포 환경의 렌더 워커가 연결된 뒤 `READY`로 승격해야 합니다. 자세한 반영 내역은 [PRD 2.5 구현 보고서](docs/prd-2.5-implementation-report.md)를 참고하세요.

## Railway API 배포

Railway 서비스는 저장소 루트의 `Dockerfile`을 자동으로 사용합니다. 서비스 설정은
다음 값으로 지정합니다.

- Pre-deploy command: `corepack pnpm db:migrate:deploy`
- Start command: 비워 두고 Dockerfile의 `CMD` 사용
- Healthcheck path: `/api/v1/health`
- Healthcheck timeout: `300`초
- Restart policy: `Always`

Railway 변수에는 `NODE_ENV=production`, `USE_IN_MEMORY_DB=false`,
`CONTENT_VERSION=3.0.0`, Neon pooled `DATABASE_URL`, Neon direct `DIRECT_URL`,
32자 이상의 `JWT_SECRET`, 별도의 `ADMIN_TOKEN`, 실제
`ADMOB_REWARDED_UNIT_ID`를 등록합니다. 자격 증명과 토큰은 저장소에 커밋하지 않습니다.

## 프롬프트 기반 dev/prod 배포

저장소에는 `.codex/skills/pastlife-deploy/SKILL.md`와 `scripts/deploy.ps1`이 포함됩니다. 명시적인 개발 또는 운영 배포 요청은 로컬 검증, Cloudflare Pages 정적 디렉터리 생성, 해당 `dev` 또는 `prod` 브랜치 푸시, 공급자 상태 확인을 순서대로 수행합니다. 운영 배포는 이미 `origin/dev`에 존재하는 커밋만 허용합니다.

최초 공급자 설정과 운영 방법은 `docs/deployment/prompt-driven-deployment.md`를 참고하세요.

배포 후 `GET /api/v1/health`가 `200`과
`{"status":"ok","contentVersion":"3.0.0"}`을 반환해야 모바일 및 AdMob 설정을
해당 HTTPS 도메인으로 전환할 수 있습니다.
