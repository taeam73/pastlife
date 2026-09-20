# 전생록 (Past Life Archive)

PRD 2.5를 반영한 실행 가능한 MVP입니다. 익명 질문 6단계, 이전 세션과 겹치지 않는 서버 질문 선택, 결정론적 판정, Fake AD 1~3, 영상형·텍스트형 기본/심화/현생 가이드, 이미지·영상 공유 템플릿, Google 로그인과 사용자 아카이브를 확인할 수 있습니다. 결과 상태 최초 조회에서 AI 대표 이미지 1장을 low 품질로 자동 생성해 저장·재사용하며, 외부 AI·이미지 공급자가 없거나 두 번 실패하면 템플릿 문장과 라이브러리 이미지로 안전하게 대체됩니다.

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

## PRD 2.5 운영 설정

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
