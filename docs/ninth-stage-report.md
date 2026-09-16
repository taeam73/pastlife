# 9단계 구현 보고서: Google 로그인과 인증 강화

## 완료 범위

- Google 공식 `google-auth-library`를 이용한 서버 측 ID 토큰 검증
- Web/iOS/Android Google OAuth 클라이언트 ID audience 허용 목록
- 운영 환경의 mock 로그인 및 32자 미만 JWT 비밀값 차단
- 이메일 대신 Google `sub`를 기준으로 한 안정적인 사용자 식별
- `(provider, providerSub)` 데이터베이스 유일성 제약과 migration
- 사용자가 직접 시작하는 전용 Google 로그인 화면
- 네이티브 access token의 Expo SecureStore 보관
- 명시적 E2E 전용 mock 로그인과 브라우저 여정 검증

## 운영 전 필요한 외부 설정

1. Google Cloud Console에서 Web, iOS, Android OAuth 클라이언트를 생성합니다.
2. `.env` 또는 배포 secret에 클라이언트 ID와 강한 `JWT_SECRET`을 설정합니다.
3. Web `/login` 및 native `pastlife://login` 리디렉션 URI를 등록합니다.
4. Expo development build에서 iOS와 Android 실계정 로그인을 각각 확인합니다.
5. 배포 데이터베이스에 `202609160002_google_identity` migration을 적용합니다.

클라이언트 ID는 토큰 audience 식별자이며 비밀키는 아니지만, 환경별 설정의 일관성을
위해 `.env`/배포 환경 변수로만 관리합니다. 실제 URL, 데이터베이스 연결 문자열,
JWT 비밀값은 문서나 Git에 기록하지 않습니다.

## 현재 제한

Google 콘솔에서 발급한 실제 클라이언트 ID가 없는 개발 환경에서는 실계정 OAuth
왕복을 자동화할 수 없습니다. 코드 경로와 서버 검증은 단위 테스트로, 전체 사용자
흐름은 명시적으로 격리된 mock 계정으로 검증합니다.
