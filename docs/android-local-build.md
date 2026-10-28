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
