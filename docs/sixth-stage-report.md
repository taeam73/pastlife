# 전생록 6단계 구현 보고서

Neon 운영 영속화 흐름을 실제 프로세스 경계에서 검증했습니다.

## 수정

- API 시작 시 저장소 루트 `.env`를 자동으로 로드
- 애플리케이션 생성 전에 환경을 읽도록 `AppModule`을 동적 import
- 시작 로그에 `Prisma` 또는 `memory` 저장소 모드를 표시
- NestJS 11 wildcard middleware 경로를 `{*path}` 문법으로 변경

## Neon 검증

- migration 및 seed 적용 완료
- 세션 생성과 1~6단계 답변 저장
- 동시 complete 3회에 대해 하나의 결과 반환
- AD 1~3 중복 콜백의 멱등 처리
- 기본 7개, 심화 4개, 현생 가이드 4개 블록 조회
- 안정적인 공유 토큰 확인
- Google mock 로그인, 아카이브 중복 저장 및 목록 조회
- API 재시작 후 결과, 잠금 해제 상태, 사용자 아카이브 유지 확인

검증 과정에서 기존 API가 `.env`를 읽지 않아 의도와 달리 메모리 저장소를 선택하는 문제를 발견해 수정했습니다. Prisma CLI의 migration·seed 성공만으로는 API 런타임의 DB 사용을 보장하지 않으므로, 이후 배포 검증에서도 시작 로그와 재시작 영속성 검사를 포함해야 합니다.

## 다음 범위

- Neon pooled URL로 API 런타임 연결 전환
- 모바일·관리자 브라우저 E2E
- 실제 Google OAuth, 광고 검증, AI 문장·이미지 및 S3 연동 검증
- Redis worker 비동기화, 관측성, 부하·복구 테스트
