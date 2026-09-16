# 전생록 8단계 구현 보고서

모바일 핵심 사용자 여정과 관리자 콘텐츠 운영 여정을 Chromium에서 자동 검증하도록 구현했습니다.

## 구현

- Playwright `mobile`, `admin` 프로젝트와 실패 스크린샷·trace 구성
- API·Expo web·Next.js 서버를 격리된 메모리 저장소로 실행하고 종료하는 E2E 러너
- 모바일 시작 → 6단계 응답 → 기본 결과 → 아카이브 → 심화 → 현생 가이드 → 새로고침 복구 검증
- 관리자 토큰 로그인, 세션 단위 토큰 보관, 로그아웃
- 질문 초안 저장, 게시, 게시 이력, 롤백 준비, 감사 로그 UI 및 브라우저 검증
- GitHub Actions에서 typecheck, 단위 테스트, API E2E, Chromium E2E 실행
- 브라우저 실패 시 `output/playwright/` artifact 업로드

## 안전성

- 브라우저 E2E는 `USE_IN_MEMORY_DB=true`를 강제해 Neon 데이터를 읽거나 변경하지 않습니다.
- 관리자 테스트 토큰은 러너 프로세스에만 주입되는 고정 테스트 값입니다.
- 운영 관리자 토큰은 브라우저 `sessionStorage`에만 보관되며 서버 로그나 저장소에 기록하지 않습니다.

## 검증

- 관리자 Chromium E2E 1개 통과
- 모바일 Chromium E2E 1개 통과
- 두 프로젝트 통합 실행 2개 통과

## 다음 범위

- 실제 Google OAuth ID token 검증과 모바일 로그인 UI
- 실제 광고 공급자 서버 검증 및 부정 콜백 방지
- AI 문장·이미지 생성과 S3 비공개 저장·서명 URL 검증
- Redis worker 비동기화, 관측성, 부하·복구 테스트
