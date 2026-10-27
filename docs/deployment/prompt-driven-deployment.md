# 프롬프트 기반 dev/prod 배포

## 배포 구조

```text
GitHub dev  ─┬─ Google Cloud Run / pastlife-api-dev
             ├─ Neon / staging branch
             └─ Cloudflare Pages / dev preview

GitHub prod ─┬─ Google Cloud Run / pastlife-api-prod
             ├─ Neon / production branch
             └─ Cloudflare Pages / production
```

Codex에서 “개발 배포해줘” 또는 “운영 배포해줘”라고 요청하면
`.codex/skills/pastlife-deploy/SKILL.md`가 `scripts/deploy.ps1`을 실행한다.
스크립트는 검사와 정적 자산 빌드, Git 브랜치 푸시, Cloud Build 컨테이너 빌드,
Prisma migration용 Cloud Run Job, Cloud Run 서비스 배포, API와 정적 자산 상태 확인을
순서대로 수행한다.

## 현재 인프라

- Google Cloud 프로젝트: `pastlife-gimmyoungsoft-2026`
- Cloud Run 리전: `asia-northeast3` (서울)
- Artifact Registry: `pastlife`
- API 서비스: `pastlife-api-dev`, `pastlife-api-prod`
- dev API: `https://pastlife-api-dev-36h6kgjkxq-du.a.run.app`
- migration Job: `pastlife-migrate-dev`, `pastlife-migrate-prod`
- Neon 프로젝트: `pastlife`, 싱가포르
- Neon dev 브랜치: `staging`
- Neon prod 브랜치: `production`
- Cloudflare prod 자산: `https://pastlife-assets.pages.dev`
- Cloudflare dev 자산: `https://dev.pastlife-assets.pages.dev`

## Google Secret Manager

다음 비밀은 소스나 채팅에 값을 노출하지 않고 Secret Manager에 저장한다.

```text
pastlife-dev-database-url
pastlife-dev-direct-url
pastlife-dev-jwt-secret
pastlife-dev-admin-token
pastlife-prod-database-url
pastlife-prod-direct-url
pastlife-prod-jwt-secret
pastlife-prod-admin-token
```

Neon URL을 처음 저장하거나 교체할 때는 Neon의 Copy snippet을 누른 직후 다음 스크립트를
실행한다. 스크립트는 pooled/direct 형식을 검증하고 저장 후 클립보드를 덮어쓴다.

```powershell
.\scripts\import-gcp-secret-from-clipboard.ps1 -Environment dev -ConnectionType pooled
.\scripts\import-gcp-secret-from-clipboard.ps1 -Environment dev -ConnectionType direct
.\scripts\import-gcp-secret-from-clipboard.ps1 -Environment prod -ConnectionType pooled
.\scripts\import-gcp-secret-from-clipboard.ps1 -Environment prod -ConnectionType direct
```

JWT와 관리자 토큰은 첫 배포 때 환경별 난수로 자동 생성한다. Cloud Run 전용 서비스 계정
`pastlife-api-runtime`만 Secret Manager 접근 권한을 가진다.

## 환경별 정책

dev는 `NODE_ENV=development`, `USE_MOCK_GOOGLE=true`로 배포해 Google 로그인 및 실제 광고
설정이 없어도 API와 DB를 검증할 수 있다. prod는 `NODE_ENV=production`이며 아래 사용자
환경변수가 없으면 배포를 거부한다.

```powershell
[Environment]::SetEnvironmentVariable('PASTLIFE_PROD_GOOGLE_CLIENT_IDS', 'CLIENT_ID.apps.googleusercontent.com', 'User')
[Environment]::SetEnvironmentVariable('PASTLIFE_PROD_ADMOB_REWARDED_UNIT_ID', 'ca-app-pub-0000000000000000/0000000000', 'User')
```

## 상태 URL

첫 Cloud Run 배포 후 출력된 주소를 사용자 환경변수로 기록한다.

```powershell
[Environment]::SetEnvironmentVariable('PASTLIFE_DEV_API_HEALTH_URL', 'https://DEV-RUN-URL/api/v1/health', 'User')
[Environment]::SetEnvironmentVariable('PASTLIFE_DEV_ASSET_HEALTH_URL', 'https://dev.pastlife-assets.pages.dev/health.json', 'User')
[Environment]::SetEnvironmentVariable('PASTLIFE_PROD_API_HEALTH_URL', 'https://PROD-RUN-URL/api/v1/health', 'User')
[Environment]::SetEnvironmentVariable('PASTLIFE_PROD_ASSET_HEALTH_URL', 'https://pastlife-assets.pages.dev/health.json', 'User')
```

## 배포 명령

개발 배포:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/deploy.ps1 -Environment dev
```

운영 배포:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/deploy.ps1 -Environment prod -ConfirmProduction
```

운영 커밋은 먼저 `origin/dev`에 존재해야 한다. 작업 트리가 더럽거나 검사, migration,
Cloud Run 배포, API 상태 확인, Cloudflare 상태 확인 중 하나라도 실패하면 성공으로 보고하지
않는다. 강제 푸시는 사용하지 않는다.

외부 배포 없이 명령 구성만 확인하려면 다음을 사용한다.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/deploy.ps1 -Environment dev -DryRun -SkipChecks
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/deploy.ps1 -Environment prod -DryRun -SkipChecks -ConfirmProduction
```
