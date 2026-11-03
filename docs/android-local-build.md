# Windows 로컬 Android APK 빌드

이 저장소의 Expo 앱을 Windows PC에서 preview APK로 빌드한다. `eas build --local` 대신 Expo prebuild와 Gradle을 사용한다.

## 준비된 도구

- JDK 17: `E:\AndroidToolchain\jdk\jdk-17.0.21.0.2+1`
- Android SDK 36, Build Tools 36, NDK 27.1, CMake 3.22.1: `E:\AndroidToolchain\sdk`
- pnpm 패키지 저장소: `E:\AndroidToolchain\pnpm\store`
- EAS Android 서명 키와 자격 정보: `E:\AndroidToolchain\signing` (저장소 밖, 비공개)

새 PowerShell 창을 열면 사용자 환경 변수 `JAVA_HOME`, `ANDROID_HOME`, `ANDROID_SDK_ROOT`, `GRADLE_USER_HOME`과 도구 경로가 적용된다.

## 빌드

```powershell
cd E:\Project_taeam\pastlife\pastlife
.\scripts\build-android-local.ps1
```

스크립트는 Git `HEAD`의 앱과 콘텐츠를 `E:\p`에 복제해 빌드한다. 따라서 `apps/mobile` 또는 `packages`에 커밋되지 않은 변경이 있으면 빌드를 중단한다. Windows 네이티브 컴파일 경로 제한을 피하려고 pnpm 가상 저장소를 `E:\v`에 만든다. 개발 API, 개발 자산 CDN, AdMob 테스트 광고를 사용하며 `arm64-v8a` APK를 만든다.

완료 파일: `output\pastlife-local-preview-<version>-build<versionCode>.apk`

기존 EAS preview 앱과 같은 Android 키로 서명한다. 키 파일과 `credentials.json`은 Git에 추가하거나 다른 사람에게 전달하지 않는다. 휴대폰을 USB 디버깅으로 연결한 경우 설치는 다음과 같이 한다.

```powershell
& 'E:\AndroidToolchain\sdk\platform-tools\adb.exe' install -r .\output\pastlife-local-preview-<version>-build<versionCode>.apk
```

기기를 연결하지 않았다면 APK 파일을 휴대폰으로 옮겨 직접 설치할 수 있다. 이 빌드의 서명·버전은 PC에서 검증했으며, 휴대폰 실기기 동작은 별도로 확인해야 한다.

## AdMob 운영 후보 APK

운영 광고 ID로 실제 요청 경로를 확인할 때는 일반 preview APK 대신 별도 후보 빌드를 사용한다. 이 빌드는 등록된 테스트 기기 해시가 없으면 시작 전에 중단하며, 광고 화면에는 반드시 `Test Ad` 표시가 보여야 한다. 광고 소재는 절대 클릭하지 않는다.

다음 사용자 환경 변수를 먼저 설정한다. 값은 저장소나 문서에 기록하지 않는다.

- `PASTLIFE_PROD_API_URL`: 운영 HTTPS API의 `/api/v1` 주소
- `PASTLIFE_PROD_ADMOB_APP_ID`: 운영 AdMob 앱 ID
- `PASTLIFE_PROD_ADMOB_INTERSTITIAL_UNIT_ID`: 운영 전면 광고 단위 ID
- `PASTLIFE_PROD_ADMOB_REWARDED_UNIT_ID`: 운영 보상형 광고 단위 ID
- `PASTLIFE_ADMOB_TEST_DEVICE_IDS`: AdMob SDK 로그에서 확인해 등록한 테스트 기기 해시(여러 개면 쉼표 구분)

앱 및 콘텐츠 변경을 먼저 커밋한 뒤 실행한다.

```powershell
corepack pnpm admob:candidate:test
.\scripts\build-android-admob-candidate-local.ps1
```

완료 파일: `output\pastlife-admob-candidate-<version>-build<versionCode>.apk`

이 APK는 직접 설치하는 QA 전용 파일이다. Play Console 제출에는 APK가 아니라 별도의 AAB를 사용한다.

## Google Play 정식 출시 AAB

정식 출시용 AAB는 개발 API와 Google 테스트 광고를 사용하는 내부 테스트 빌드와 완전히 분리한다. 위의 운영 API 및 운영 AdMob 환경 변수 네 개가 모두 설정된 상태에서 실행한다. 테스트 광고 플래그나 테스트 기기 ID가 남아 있으면 스크립트가 제거하며, Google 데모 광고 ID가 들어오면 빌드를 중단한다.

먼저 같은 Git 커밋으로 `build-android-local.ps1`을 한 번 실행해 짧은 빌드 경로를 준비한 뒤 정식 AAB를 만든다. 정식 빌드 단계에서 운영 AdMob 앱 ID가 Android 설정에 반영되도록 네이티브 프로젝트를 다시 생성한다.

```powershell
.\scripts\build-android-play-production-local.ps1
```

완료 파일: `output\pastlife-play-production-<version>-build<versionCode>.aab`

`build-android-play-internal-local.ps1`은 계속 개발 API와 Google 테스트 광고만 사용하며 내부 테스트 트랙에만 올린다. 정식 AAB는 운영 API, 운영 자산 CDN, 운영 AdMob ID를 사용한다.
