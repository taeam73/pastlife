# Staging 실행 순서

Neon을 사용하는 경우 Docker/PostgreSQL 없이도 API DB를 실행할 수 있습니다. Neon Dashboard의 Connect 메뉴에서 pooled URL을 복사하고, migration 시에는 direct(non-pooler) URL을 사용합니다. Neon은 pooled URL을 애플리케이션 연결에, direct URL을 migration 같은 세션 의존 작업에 권장합니다. [Neon connection pooling 문서](https://neon.com/docs/connect/connection-pooling)

```powershell
Copy-Item .env.neon.example .env
# DATABASE_URL에는 pooled URL, DIRECT_URL에는 direct URL을 동시에 설정
corepack pnpm staging:preflight
corepack pnpm db:migrate:status
# 대상이 스테이징이고 복구 지점이 준비됐음을 확인한 뒤에만 실행
corepack pnpm db:migrate:deploy
corepack pnpm db:migrate:status
corepack pnpm db:seed
corepack pnpm --filter @pastlife/api start
```

Neon CLI로 특정 브랜치의 연결 정보를 가져올 때는 연결 문자열을 직접 출력하는
`connection-string` 대신 `env pull`을 사용합니다. CLI가 만드는
`DATABASE_URL_UNPOOLED`는 `env:neon`이 `DIRECT_URL`로 반영합니다.

```powershell
npx neonctl env pull --project-id <project-id> --branch staging --file .env `
  -e DATABASE_URL -e DATABASE_URL_UNPOOLED
corepack pnpm env:neon
corepack pnpm staging:preflight
```

기존 `.env`에 Neon direct URL 또는 `DATABASE_URL_UNPOOLED`가 설정된 환경은 `corepack pnpm env:neon`으로
`DATABASE_URL`과 `DIRECT_URL`을 안전하게 분리할 수 있습니다. 이 명령은 URL을
콘솔에 출력하지 않으며 반복 실행해도 같은 구성을 유지합니다.

API는 `DATABASE_URL`만 사용하며 Neon에서는 `-pooler` 호스트와
`sslmode=require`를 시작 시 검증합니다. Prisma migration과 seed는
`schema.prisma`의 `directUrl`을 통해 `DIRECT_URL`을 사용합니다. 따라서 migration
전후에 URL을 수동으로 교체하지 않습니다. 운영 모드에서는 DB 설정 누락이나
`USE_IN_MEMORY_DB=true`가 즉시 시작 오류가 됩니다.

Docker가 설치된 환경에서 로컬 인프라를 사용할 때는 다음 순서로 실행합니다.

```powershell
Copy-Item .env.example .env
corepack pnpm install
docker compose -f infra/docker-compose.yml up -d
corepack pnpm db:migrate
corepack pnpm db:seed
corepack pnpm typecheck
corepack pnpm test
corepack pnpm test:e2e
```

운영 설정에서는 `USE_IN_MEMORY_DB=false`, `USE_MOCK_GOOGLE=false`, `GOOGLE_CLIENT_IDS`, AI endpoint/key, S3 endpoint/key, `ADMIN_TOKEN`, `JWT_SECRET`을 반드시 지정합니다. migration 적용 전 백업 또는 Neon 복구 지점을 준비하고, publish/rollback은 staging에서 먼저 검증합니다. `staging:preflight`는 URL의 사용자명·비밀번호·쿼리 토큰을 출력하지 않고 provider, 호스트, 콘텐츠 버전만 표시합니다.

이미 만들어진 스테이징/운영 데이터베이스에는 `db:migrate`(`prisma migrate dev`)를 사용하지 않습니다. 읽기 전용 상태 확인은 `db:migrate:status`, 승인된 배포는 `db:migrate:deploy`를 사용합니다.

2026-09-16 기준 Neon direct 연결로 초기 migration과 seed를 적용했습니다. API가 저장소 루트 `.env`를 자동으로 로드하며, `USE_IN_MEMORY_DB=false` 상태에서 전체 사용자 흐름과 프로세스 재시작 후 결과·아카이브 영속성을 검증했습니다. 7단계부터 runtime pooled URL과 CLI direct URL을 별도 환경 변수로 유지합니다. 이후 migration의 실제 적용 여부는 날짜별 보고서와 `db:migrate:status` 결과를 기준으로 판단합니다.
