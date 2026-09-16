# 전생록 4단계 구현 보고서

- 개발용 Google token exchange: `POST /api/v1/auth/google/exchange`
- HMAC 서명 access token 및 만료 검증
- 로그인 사용자별 아카이브 저장/조회: `POST /api/v1/auth/archive/{resultId}`, `GET /api/v1/auth/archive`
- API vertical E2E에 로그인·보관·목록 흐름 추가

운영 전환 시 `mock-google:` 입력 검증부를 Google OAuth 검증 provider로 교체하고, 메모리 archive 저장소를 Prisma User/Archive 모델로 교체해야 합니다.
