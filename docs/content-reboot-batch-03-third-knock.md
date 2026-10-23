# 3묶음 원고·그림 감수: THIRD_KNOCK

상태: **라이브 승격** (2026-10-22). 기존 32편과 중복되지 않는 허구의 사람 이야기다. 실제 역사 사건을 소재로 삼지 않았다. 선행 설정은 `docs/story-setting-register.md`의 `THIRD_KNOCK` 항목에 원고 전에 기록했다.

## 고정 설정과 원고의 인과

- 세계·연대: 벨누, 별력 83년 늦가을. 전기 없이 등잔·황동 도르래·목제 문·종이 별지도를 쓴다.
- 지정학적 위치: 누마르 산악연합 남쪽 경계의 오르시 자유시, 서쪽 언덕의 옛 관측소. 새 관측소가 생긴 뒤 옛 건물은 지도 보관소다.
- 주인공: 여성 리나, 30대 야간 경비원. 처음 두 번의 노크를 직접 만든 사람이며, 세 번째 소리는 지도실 안의 보관사에게서 난다. 이 원고는 유령의 실재를 증명하지 않는다.
- 인과: 황동 물건의 도난 걱정 → 혼자 경비하려는 노크 장난 → 비가 샌 지도실 문이 붓고 보관사가 갇힘 → 다른 방향에서 세 번째 노크 → 장난을 밝히고 이웃과 문을 엶 → 구조는 성공하지만 수리비·신뢰·누수 문제가 남음.

## 독자와 기획자 감수

| 관점 | 확인 | 남는 한계 |
| --- | --- | --- |
| 흥미 | ‘두 번은 내 장난인데 세 번째는 누구인가’가 첫 장면의 질문이다. 소리의 방향과 문 아래 젖은 종이가 짧은 단서다. | 정체가 초자연적 존재인지 오래 끌지는 않는다. 공포보다 수수께끼와 행동의 선택에 무게를 뒀다. |
| 재미 | 유령을 꾸미던 경비원이 자기 장난에 놀라 숟가락을 떨어뜨리는 소동과, 무서움을 감추지 못한 채 문을 여는 긴장이 다른 맛을 준다. | ‘가짜 유령’이 너무 가벼운 장난처럼 읽히지 않도록 이웃이 겁먹은 결과를 대가에 남겼다. |
| 공감 | 혼자 괜찮은 척하려다 도움을 부르게 되는 행동으로 연결한다. 현재 사용자가 겁이 많다거나 전생 때문에 그렇다고 단정하지 않는다. | 여운은 질문을 남기며, 실제 독자 반응은 검증되지 않았다. |
| 기획 | 직업·장소·갈등이 기존 광대, 밤길 안내자, 탐정, 전당포와 다르다. `notice`는 두 소리의 방향을 구별, `speak`는 거짓을 밝힘, `connect`는 이웃과 경첩을 들어 올림으로 각각 보인다. | 배수관 자체는 320px 첫 화면의 중심 크롭 밖에 있다. 문·인물·글은 보이며 배수관 단서는 본문이 설명한다. |

## 그림·화면 검수

- 배경: [오르시 옛 관측소 복도](../apps/mobile/assets/stories/v3/third-knock-orsi-observatory-bg.jpg). 내장 이미지 생성 도구 원본 **1254×1254**를 확대 없이 JPEG 품질 79로 압축, 약 **309KB**. 첫 생성본은 열린 테라스라 원고의 실내 복도와 충돌했다. 문·배수관·비·등잔을 보존하면서 닫힌 지도 보관 복도로 편집한 두 번째 배경을 채택했다. 인물은 배경에 없다.
- 인물: [리나 투명 레이어](../apps/mobile/assets/stories/v3/third-knock-rina.webp). 첫 시안은 가로형이라 UI에서 다리가 잘릴 위험이 있었다. 같은 인물·복식·등잔을 세로 **1024×1536**으로 편집하고 실제 알파가 있는 WebP 품질 82로 압축, 약 **202KB**. 최근 메이의 밝은 갈색 재킷, 해원의 한복·겉옷, 라오의 넓은 앞치마와 달리 올리브색 짧은 후드 방수 외투·회색 작업 바지·몸을 굽힌 자세다.
- 생성 지시(배경): `Square pre-electric Belnu observatory map-storage corridor after rain; swollen wooden map-room door and damp star-map edge near center-left, hollow drainpipe on left, brass instruments, oil lamp, teal/amber painterly light; no people, ghosts, writing or modern objects; quiet UI text zones.` 처음의 열린 테라스를 `enclosed timber-roofed corridor with map shelves, preserve door and drainpipe`로 편집했다.
- 생성 지시(인물): `Female 30s night guard Rina, tied dark hair, olive short hooded rain jacket and gray trousers, one oil lantern, bent-knee startled listening pose; true transparent separate character, no scene or second figure, native width 1024+.` 첫 가로형을 `true tall 2:3 portrait, head through boots, preserve identity and alpha`로 편집했다.
- 320px 결과 화면: 닫힌 문, 인물의 등잔·표정, 제목·소개가 읽히고 가로 넘침·소개 패널 겹침이 없다. 배수관은 왼쪽 크롭 밖이라 세 번째 소리의 공간 차이는 본문에서 풀린다. 768px에는 문, 복도, 관측 도구와 인물이 함께 보이고 본문 패널과 겹치지 않는다. 화면 증거는 `output/playwright/story-third-knock-layered-320.png`와 `...-768.png`에 있다.

## 검증 기록

`corepack pnpm typecheck`, `corepack pnpm test`(content 23, scoring 13, mobile 10, API 97), `corepack pnpm content:check`(33편/33 고유 그림 쌍·도달성·다양성), `corepack pnpm test:e2e`(API 2), 격리 3.0 API·모바일 서버 4200/8281에서 `third-knock` 집중 브라우저 1건(320px·768px), 스크린샷 육안 검수가 통과했다. 첫 단위·콘텐츠 검사는 `identityLine`에 등록된 `home` 이름을 그대로 쓰지 않아 실패했고, 문장을 고쳐 재실행해 통과했다. 실제 이용자 반응·실기기 검증은 아니다. 커밋·푸시·배포는 하지 않았다.
