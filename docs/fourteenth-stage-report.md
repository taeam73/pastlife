# 전생록 14단계 구현 보고서

staging AI 이미지 생성과 비공개 S3 호환 저장소의 실제 연결을 검증할 수 있는
비밀값 비노출 사전검사 및 일회성 스모크 경로를 추가했다.

## 구현

- `staging:preflight`가 AI 이미지 API와 S3 필수 환경 변수 7개를 추가 검증한다.
- staging의 AI/S3 endpoint에 HTTPS를 강제하고 DNS 호환 버킷 이름을 검사한다.
- 검사 결과에는 DB·AI·S3 호스트, 버킷, 리전, 콘텐츠 버전만 포함한다.
- `staging:storage-smoke`가 1픽셀 PNG 업로드, 900초 서명 URL 다운로드, 바이트
  일치 검증, 객체 삭제를 하나의 명령으로 실행한다.
- 스모크 객체는 고유한 `smoke/<timestamp>-<uuid>.png` 키를 사용하며 성공 여부와
  관계없이 `finally`에서 삭제를 시도한다.

## 현재 환경 상태

2026-09-19 로컬 `.env` 점검 결과 `AI_IMAGE_API_URL`, `AI_IMAGE_API_KEY`,
`S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`가 모두
설정되지 않았다. 따라서 실제 외부 저장소에 대한 업로드·서명·다운로드 검증은
아직 실행하지 않았으며 통과로 기록하지 않는다. 값이 staging 비밀 저장소에
주입된 뒤 `corepack pnpm staging:preflight`와
`corepack pnpm staging:storage-smoke`를 차례로 실행해야 한다.

## 보안 성질

- 사전검사와 스모크 로그에 비밀번호, API 키, S3 자격 증명, 전체 endpoint URL,
  서명 URL을 출력하지 않는다.
- 실제 이미지 데이터베이스 레코드는 생성하지 않으며 스모크 객체도 검증 후
  삭제한다.

## 검증

- staging 환경 검사 단위 테스트 8건 통과
- 전체 workspace TypeScript 타입 검사 통과
- API 단위 테스트 24건 통과
- API 수직 흐름 E2E 1건 통과
- 스토리지 스모크 스크립트 구문 검사 통과
- `git diff --check` 통과
- 실제 `staging:preflight`가 누락된 첫 항목인 `AI_IMAGE_API_URL`에서 안전하게
  실패하고 비밀값을 출력하지 않음을 확인
- 실제 저장소 스모크는 필수 설정이 없으므로 실행하지 않음
