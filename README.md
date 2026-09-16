# 전생록 (Past Life Archive)

PRD 2.0의 실행 가능한 MVP입니다. 익명 질문 6단계, 결정론적 서버 판정, Fake AD 1~3, 기본·심화·현생 가이드 결과, 공유, Google 로그인 교환과 사용자 아카이브를 확인할 수 있습니다. 외부 AI·이미지 공급자가 없으면 템플릿 문장과 라이브러리 이미지로 안전하게 대체됩니다.

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

```powershell
docker compose -f infra/docker-compose.yml up -d
corepack pnpm db:migrate
corepack pnpm db:seed
corepack pnpm --filter @pastlife/api start
```

API는 저장소 루트의 `.env`를 시작할 때 자동으로 읽습니다. Neon에서는 `DATABASE_URL`에 pooled URL, `DIRECT_URL`에 direct URL을 지정합니다. API는 Neon direct URL이나 SSL 누락을 거부하며, 운영 모드에서는 메모리 저장소를 허용하지 않습니다. Docker가 없는 개발 환경에서 `USE_IN_MEMORY_DB=true`를 지정하면 메모리 저장소를 사용합니다. API는 `4000`, Expo는 `8081`, 관리자는 `3000` 포트를 사용합니다.

## 검증

```powershell
corepack pnpm typecheck
corepack pnpm test
$env:EXPO_NO_TELEMETRY='1'; $env:EXPO_OFFLINE='1'; $env:CI='1'; corepack pnpm --filter @pastlife/mobile exec expo export --platform web
```

자세한 구현 범위와 제한은 [첫 구현 보고서](docs/first-slice-report.md)와 [실행 계획](docs/superpowers/plans/2026-09-16-past-life-vertical-slice.md)을 참고하세요.
