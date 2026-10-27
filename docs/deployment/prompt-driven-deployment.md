# 프롬프트 기반 dev/prod 배포

## 배포 구조

```text
GitHub dev  ─┬─ Railway dev / pastlife-api-dev / PostgreSQL-dev
             └─ Cloudflare Pages preview deployment

GitHub prod ─┬─ Railway prod / pastlife-api-prod / PostgreSQL-prod
             └─ Cloudflare Pages production deployment
```

Codex에서 “개발 배포해줘” 또는 “운영 배포해줘”라고 요청하면 `.codex/skills/pastlife-deploy/SKILL.md`가 `scripts/deploy.ps1`을 실행한다. 스크립트는 검사와 정적 자산 빌드를 마친 뒤 현재 커밋을 `dev` 또는 `prod`에 fast-forward로 푸시한다. Railway와 Cloudflare의 Git 연동이 해당 브랜치를 감지해 배포하며, 스크립트는 두 서비스의 상태 URL이 HTTP 200을 반환할 때까지 확인한다.

## 사용자가 최초 한 번 설정할 항목

### Railway

Railway 신규 가입이 다시 활성화된 뒤 GitHub 계정 `taeam73`의 `pastlife` 저장소를 연결한다.

1. 프로젝트 `pastlife`를 만든다.
2. `dev` 환경에 `pastlife-api-dev` 서비스와 `PostgreSQL-dev`를 만든다.
3. `prod` 환경에 `pastlife-api-prod` 서비스와 `PostgreSQL-prod`를 만든다.
4. 각 API 서비스의 GitHub 배포 브랜치를 각각 `dev`, `prod`로 제한한다.
5. Builder는 루트 `Dockerfile`, pre-deploy command는 `corepack pnpm db:migrate:deploy`, healthcheck path는 `/api/v1/health`, restart policy는 `Always`로 설정한다.
6. 환경별 PostgreSQL의 `DATABASE_URL`을 해당 API에 참조 변수로 연결한다. 이 프로젝트의 Prisma `DIRECT_URL`에도 같은 환경의 PostgreSQL 접속 URL을 연결한다.
7. `NODE_ENV=production`, `USE_IN_MEMORY_DB=false`, `CONTENT_VERSION=3.0.0`, 환경별 `JWT_SECRET`, `ADMIN_TOKEN`, AdMob 설정을 입력한다. dev와 prod의 비밀값을 공유하지 않는다.
8. 각 환경의 Railway HTTPS 도메인을 생성한다.

Railway URL이나 비밀값을 저장소에 커밋하지 않는다.

### Cloudflare Pages

1. Cloudflare Dashboard에서 `Workers & Pages` → `Create application` → `Pages` → `Connect to Git`을 선택한다.
2. GitHub 저장소 `taeam73/pastlife`만 허용한다.
3. 프로젝트 이름을 `pastlife-assets`로 정한다.
4. Production branch를 `prod`로 지정한다.
5. Preview branch control을 `Custom branches`로 바꾸고 `dev`만 포함한다.
6. Build command를 `corepack pnpm assets:build`로 지정한다.
7. Build output directory를 `dist/static`으로 지정한다.
8. Root directory는 저장소 루트로 둔다.

Cloudflare가 제공하는 운영 `*.pages.dev` 주소와 dev 브랜치 별칭 주소를 기록한다. `dist/static/health.json`과 `dist/static/manifest.json`이 열리는지 확인한다.

현재 운영 정적 자산 주소는 `https://pastlife-assets.pages.dev`이며 상태 확인 주소는 `https://pastlife-assets.pages.dev/health.json`이다.

### 로컬의 비밀이 아닌 상태 URL

`.deploy/dev.env.example`과 `.deploy/prod.env.example`을 참고해 Windows 사용자 환경변수를 설정한다. 값은 각각 실제 Railway와 Cloudflare 주소이다.

```powershell
[Environment]::SetEnvironmentVariable('PASTLIFE_DEV_API_HEALTH_URL', 'https://DEV-API/api/v1/health', 'User')
[Environment]::SetEnvironmentVariable('PASTLIFE_DEV_ASSET_HEALTH_URL', 'https://DEV-ASSETS/health.json', 'User')
[Environment]::SetEnvironmentVariable('PASTLIFE_PROD_API_HEALTH_URL', 'https://PROD-API/api/v1/health', 'User')
[Environment]::SetEnvironmentVariable('PASTLIFE_PROD_ASSET_HEALTH_URL', 'https://PROD-ASSETS/health.json', 'User')
```

새 PowerShell을 열어 적용된 값을 사용한다. 이 네 URL은 비밀이 아니지만 환경별 설정을 섞지 않기 위해 소스에 하드코딩하지 않는다.

Expo/EAS의 개발 및 운영 프로필에는 각 환경의 값을 넣는다.

```text
EXPO_PUBLIC_API_URL=https://<railway-domain>/api/v1
EXPO_PUBLIC_ASSET_BASE_URL=https://<cloudflare-pages-domain>
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

운영 커밋은 먼저 `origin/dev`에 존재해야 한다. 작업 트리가 더럽거나 검사·푸시·상태 확인 중 하나라도 실패하면 성공으로 보고하지 않는다. 강제 푸시는 사용하지 않는다.

외부 배포 없이 동작만 확인하려면 다음을 사용한다.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/deploy.ps1 -Environment dev -DryRun -SkipChecks
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/deploy.ps1 -Environment prod -DryRun -SkipChecks -ConfirmProduction
```
