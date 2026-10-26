# 오디오 자산과 사용 원칙

## 효과음

- 파일: `apps/mobile/assets/audio/pencil-write.ogg`
- 원본: AntumDeluge, **Pencil Sounds**의 `pencil_write.ogg`
- 출처: https://opengameart.org/content/pencil-sounds
- 라이선스: Creative Commons CC0 1.0. 실제 연필로 종이에 쓰는 소리를 녹음한 파일이다.
- 저장된 안내 사본: `apps/mobile/assets/audio/pencil-sounds-readme.txt`
- 앱 사용: 결과 양피지의 각 본문 줄이 나타날 때 18% 음량으로 짧게 재생한다. 빠른 페이지 전환에서 소리가 겹치지 않도록 기존 재생을 중단한 뒤 처음부터 재생한다.

- 파일: `apps/mobile/assets/audio/choice-heavy.ogg`
- 원본: Kenney, **Impact Sounds** 팩의 `impactBell_heavy_001.ogg`
- 출처: https://kenney.nl/assets/impact-sounds
- 라이선스: Creative Commons CC0 1.0. 상업적 사용과 수정·재배포가 허용되며 저작자 표시는 필수가 아니다.
- 저장된 라이선스 사본: `apps/mobile/assets/audio/kenney-impact-sounds-license.txt`
- 앱 사용: 질문의 보기를 확정할 때 16% 음량으로 짧고 묵직한 종 타격을 한 번 재생한다.

## 배경음악

- 파일: `apps/mobile/assets/audio/empty-city.ogg`
- 제목: **EmptyCity: Background Music**
- 제작자: yd
- 출처: https://opengameart.org/content/emptycity-background-music
- 라이선스: Creative Commons CC0 1.0. 원본 페이지가 어둡고 차분한 반복용 배경음악으로 제공한다.
- 앱 사용: 메인, 안내, 질문 1~6, 분석, 결과, 마지막 순간 화면에서 6.5% 음량으로 반복 재생한다. 설정·로그인·아카이브 화면에서는 중지한다.

## 운영 원칙

- 효과음 설정이 꺼져 있으면 재생하지 않는다.
- 배경 음악 설정이 꺼져 있으면 경험 화면에서도 음악을 재생하지 않는다.
- 동작 줄이기가 켜져 있으면 줄별 등장 애니메이션과 필기 효과음을 모두 생략한다.
- 오디오는 읽기와 화면 이동을 막지 않는다. 재생 실패는 사용자 흐름에 영향을 주지 않는다.
- 출시 전에 실제 Android 기기에서 미디어 음량, 무음 상태, 전화·다른 앱 오디오와의 충돌을 확인한다.
