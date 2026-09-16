# 전생록 7단계 구현 보고서

운영 런타임의 데이터베이스 연결 안전성을 강화했습니다.

## 구현

- API 런타임용 `DATABASE_URL`과 Prisma CLI용 `DIRECT_URL` 분리
- Neon API 연결에서 pooled 호스트(`-pooler`)와 `sslmode=require` 검증
- 운영 환경의 DB 설정 누락 및 메모리 저장소 사용 차단
- 저장소 선택과 시작 로그가 하나의 검증된 설정을 사용하도록 통합
- 로컬·Neon 환경 예시와 staging 실행 절차 갱신

## 검증

- workspace typecheck 및 단위·정적 테스트 통과
- API vertical E2E 통과
- Prisma schema validate 통과
- Expo SDK 57 web static export 통과(10개 라우트)

현재 로컬 비밀 설정 파일은 기존 Neon direct URL만 보유하고 있습니다. 실제 API를
Neon에 연결하기 전 Neon Dashboard에서 pooled URL을 발급해 `DATABASE_URL`에 넣고,
기존 direct URL을 `DIRECT_URL`로 옮겨야 합니다.

## 다음 범위

- 모바일·관리자 브라우저 E2E
- 실제 Google OAuth와 광고 서버 검증
- AI 문장·이미지 생성 및 S3 저장 연동 검증
- Redis worker 비동기화, 관측성, 부하·복구 테스트
