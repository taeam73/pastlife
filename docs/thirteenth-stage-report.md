# 전생록 13단계 구현 보고서

PRD 2.5 스테이징 데이터베이스 배포를 위한 사전검사와 안전한 Prisma 명령 경계를 추가했다.

## 구현

- `.env`의 PostgreSQL URL을 자격 증명 없이 검사하는 `staging:preflight` 추가
- Neon pooled runtime URL과 direct migration URL의 역할·동일 DB·TLS 검증
- `USE_IN_MEMORY_DB=false`, `CONTENT_VERSION=2.5.0` 강제
- `db:migrate:status`와 `db:migrate:deploy`를 개발용 `db:migrate`와 분리
- 사전검사기의 정상·실패·비밀값 비노출 테스트 6건 추가
- 스테이징 실행 문서를 상태 확인 → 대상/복구 지점 확인 → deploy → 재확인 순서로 갱신

## 실제 환경 점검

기존 `.env`의 콘텐츠 버전을 `2.5.0`으로 맞췄다. 최초 사전검사는 pooled/direct 역할 자체는 정상으로 판정했지만, Neon 엔드포인트 메타데이터와 대조한 결과 두 호스트 모두 `production` 브랜치 소속이었다. 배포를 중단하고 `neon env pull`로 `staging`의 `DATABASE_URL`과 `DATABASE_URL_UNPOOLED`를 `.env`에 직접 기록한 뒤 `env:neon`으로 `DIRECT_URL`을 구성했다. 이 과정에서 연결 문자열의 사용자명과 비밀번호는 출력하지 않았다.

2026-09-18 읽기 전용 `prisma migrate status` 결과, 다음 세 migration이 아직 적용되지 않았다.

- `202609160002_google_identity`
- `202609170001_prd_2_5`
- `202609170002_analytics_events`

SQL 검토 결과 테이블 데이터 삭제는 없다. PRD 2.5 migration은 기존 두 unique index를 일반/새 unique index로 교체하므로 적용 전 복구 지점 확인이 필요하다.

## 배포 결과

Neon 프로젝트 `pastlife`에서 `staging`(`br-silent-truth-azl8dkld`)이 `production`(`br-quiet-river-azmp3mwy`)을 부모로 하는 독립 브랜치임을 확인했다. 마이그레이션 직전 `staging`을 부모로 하는 무컴퓨트 복구 브랜치 `staging-pre-migration-20260918`(`br-sparkling-feather-azl1xl9q`)을 생성하고 `ready` 상태를 확인했다.

사전검사에서 staging pooled 호스트 `ep-polished-hill-az0hyont-pooler.c-3.ap-southeast-1.aws.neon.tech`와 direct 호스트 `ep-polished-hill-az0hyont.c-3.ap-southeast-1.aws.neon.tech`를 확인한 뒤 `prisma migrate deploy`를 실행했다. 세 pending migration이 순서대로 적용됐고 후속 `prisma migrate status`는 총 네 migration과 `Database schema is up to date!`를 보고했다.

## 검증

- 스테이징 환경 검사 단위 테스트 6건 통과
- 전체 workspace TypeScript 타입 검사 통과
- 기존 단위 테스트 전체 통과: content 3건, scoring 7건, API 17건, mobile 1건
- API 수직 흐름 E2E 통과
- Prisma schema validation과 `git diff --check` 통과
- 배포 후 Prisma migration 상태 최신 확인
