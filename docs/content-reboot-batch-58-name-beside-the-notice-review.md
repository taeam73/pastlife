# 98번째 원고·그림 검수 — 부고 옆의 이름 한 줄

2026-10-23. 실제 `storyCards` 98개, 원고 98개, API·모바일에 함께 매핑된 고유 그림 쌍 98개를 확인했다. 대상은 `NAME_BESIDE_THE_NOTICE`(말리아 케알로하)다.

## 역사 조건과 창작 범위

- 1884년 호놀룰루는 칼라카우아가 다스리던 하와이 왕국의 수도였다. [하와이대의 하와이어 신문사](https://coe.hawaii.edu/kahuaao/hawaiian-language/), [하와이 주 기록의 우편 업무](https://ags.hawaii.gov/wp-content/uploads/2020/03/hsa_manuscript-H_fa.pdf)와 [부고 색인](https://ags.hawaii.gov/archives/about-us/genealogy-research-guide/obituary-index/), [하와이 문화센터의 여성 편집자 기록](https://kaiwakiloumoku.ksbe.edu/article/historical-snapshots-three-women-editors), [하와이대 복식 자료](https://www3.ctahr.hawaii.edu/costume/hawaiianbrochure.htm), [하와이대의 왕국·공화국·준주 연대](https://pressbooks.oer.hawaii.edu/lis648/chapter/__unknown__-7/)를 2026-10-23 확인했다.
- 말리아·가족·인쇄소·부고에 빠진 이름·별도 추모 글·대화와 게재비는 창작이다. 실제 부고나 특정 신문의 편집 과정을 재현한다고 주장하지 않는다. 1893년 왕정 전복·1898년 병합·1900년 준주 전환은 생애 후반의 시대 변화로만 쓴다. 실재 시기·장소·정치권, 성별·1844~1911년 생애를 원고와 그림 전에 [설정 대장](story-setting-register.md)에 확정했다.

## 원고와 그림

- 01은 라하이나의 글 읽기·어망 손질, 혼인·딸·이주, 사별 뒤 인쇄소 일, 시대의 변화와 시력이 흐려진 노년을 세 쪽에 담는다. 한 번의 부고 갈등으로 평생을 규정하지 않는다.
- 02는 부고 원고와 교정지에 하나의 이름이 모두 빠진 장면부터 시작한다. 세 답변 신호는 원고 확인, 의뢰인 미카에게 묻기, 당사자 하나에게 묻기로 각각 행동이 된다. 말리아는 부고를 몰래 고치지 않고 하나의 동의를 받아 별도 글을 게재한다. 게재비 때문에 딸에게 새 제본 실을 늦게 사 주며, 하나와 미카의 다툼도 남는다. 전생록 화자의 도입·마무리, 대화, 선택의 대가가 있다.
- 03은 출생부터 사망까지 19개의 삶의 변화를 기록하고, 04는 푸아·하나·벤의 다른 기억을 남긴다. 생몰·나이·관계·정치 시기·인과를 01~04와 대조했다. 작은 활자·등불·실처럼 눈에 보이는 사물과 짧은 대화로 중학생도 사건을 따라갈 수 있게 썼다.
- 배경 `honolulu-newspaper-notice-bg.jpg`는 1254×1254px이며 사람이 없다. 인물 `honolulu-malia-kealoha.webp`는 원본의 투명 영역을 세로로 잘라 1024×1219px이며 실제 알파 0~255다. 첫 생성 인물은 가로 캔버스라 그림 검사에서 실패했고, 인물의 실제 픽셀을 키우지 않고 세로로 잘라 통과시켰다. 두 자산은 API와 모바일의 같은 이야기 ID에 연결했다.

## 검증과 남은 한계

- `corepack pnpm typecheck`, `corepack pnpm content:check`, `corepack pnpm test`, `corepack pnpm test:e2e` 통과. 콘텐츠 검사는 98개의 분리된 배경·인물 쌍과 답변 도달성·다양성을 확인했다. API E2E 2건 통과.
- 전용 Playwright 검사 `e2e/mobile-name-beside-the-notice.spec.ts`가 320×720px·768×1024px에서 질문→결과, 01 프로필 세 쪽, 02~04 접근을 확인했다. 세로로 자른 인물로 재실행한 뒤 휴대전화·태블릿 스크린샷을 열어 합성, 가독성, 가로 넘침이 없음을 확인했다.
- 실제 독자의 흥미·이해도, 실기기 동작, 언어·복식·건축의 고증을 전문 연구 수준으로 재현했는지는 검증하지 못했다. 기존 44편의 01·03 전수 보강도 남아 있다.

**집계:** 98/120 라이브, 22편 남음. 커밋·푸시·배포 없음.
