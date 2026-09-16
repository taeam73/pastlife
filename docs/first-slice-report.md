# 전생록 첫 구현 보고서

## 구현 범위

- 화면: `SCR 001`, `SCR 002`, `SCR 101`–`SCR 106`, `SCR 200`, `SCR 300`
- API: 세션 생성, 단계별 질문 조회, 응답 upsert, complete 멱등 처리, 결과 status, Fake AD 1 완료/해금, 기본 결과 보호 조회
- 데이터: Prisma 스키마와 초기 migration SQL, 콘텐츠 버전 `2.0.0`, 36문항·216선택지 seed, 18 핵심 태그·6 보조 축
- 판정: 단계별 가중치, 태그/축 합산, 호환 위치·직업 필터, 결정적 hash/seed, fallback candidate
- 공급자: `FakeAdProvider`, `TemplateNarrativeProvider`, `LibraryImageProvider`

## 실행 명령

```powershell
Copy-Item .env.example .env
corepack pnpm install
corepack pnpm typecheck
corepack pnpm test
corepack pnpm --filter @pastlife/mobile exec expo export --platform web
```

PostgreSQL 운영 검증은 Docker가 설치된 환경에서 `docker compose -f infra/docker-compose.yml up -d`, `corepack pnpm db:migrate`, `corepack pnpm db:seed`를 실행합니다. 현재 작업 환경에는 Docker가 없어 컨테이너 migration/seed 실행은 보류했으며 Prisma schema validate와 SQL 생성은 완료했습니다.

## 테스트 결과

- 콘텐츠: 3 tests passed (36/216 개수·점수 범위·결정적 질문)
- scoring: 7 tests passed (가중 합산·결정성·호환 fallback)
- API: 1 vertical e2e test passed (6단계·complete 3회 동일 resultId·AD 중복 callback·403/200 unlock)
- Prisma: schema validate passed, static constraint contract test included
- 전체 workspace typecheck/test: passed
- Expo SDK 57 web export: passed; 7 static routes generated

## 데이터 보정 기록

본문 규칙은 선택지마다 핵심 태그 2개 이상과 보조 축 `-2~+2`를 요구하지만 Appendix A 예시 중 20개가 핵심 태그 1개만, 1개가 `authority+3`만 포함했습니다. ID와 문구는 유지하고 extractor가 의미 기반 핵심 태그 `+1`을 보강하며 `authority+3`을 `authority+2`로 정규화합니다.

## 남은 범위

AD 2/3, 심화 결과 4개, 현생 가이드 4개, AI 이미지/문장 실제 공급자, Google 로그인, 아카이브·공유·기기 저장, 전체 관리자 CRUD/시뮬레이터/통계, Redis worker 비동기화, 10,000회 게시 시뮬레이션, 모바일/관리자 E2E는 다음 구현 단계입니다.
