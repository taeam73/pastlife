# 97번째 원고·그림 검수 — 배 밑에서 나온 빵 바구니

2026-10-23. 실제 `storyCards` 97개, 원고 97개, API·모바일에 함께 매핑된 고유 그림 쌍 97개를 확인했다. 대상은 `TWO_WRONG_TILE_WALLS`(주앙 마르케스)다.

## 역사 조건과 창작 범위

- 1740년 리스본은 포르투갈 왕국의 수도였다. [국립 아줄레주 박물관의 리스본 제작 패널](https://raiz.museusemonumentos.pt/DetalhesObra?id=231174&tipo=OBJ)과 [타일 시공자 역할 설명](https://artsandculture.google.com/asset/sala-do-ciclo-dos-mestres/cgHDSd-FSZYDKQ?childAssetId=owEorR3_c5YrhA), [메트로폴리탄 미술관의 18세기 포르투갈 타일 소개](https://www.metmuseum.org/perspectives/penafiels-azulejos-and-cellars)를 2026-10-23 확인했다. [리스본 시립 기록](https://arquivomunicipal.lisboa.pt/sobre-nos/historia/)은 1755년 지진과 재건을 뒷받침한다.
- 주앙과 가족·친구·두 의뢰인, 바뀐 마지막 줄의 타일, 대화와 일감 상실은 창작이다. 특정 소장품이나 실제 건물의 사건으로 제시하지 않는다. 시대·정치권·성별·1702~1777년 생애는 원고·그림 제작 전에 [설정 대장](story-setting-register.md)에 확정했다.

## 원고와 그림

- 01은 채소 좌판의 어린 시절, 혼인과 딸, 타일 일, 지진 뒤 재건, 무릎이 아픈 노년을 세 쪽에 담는다. 한 번의 타일 실수로 평생을 규정하지 않는다.
- 02는 배 그림 아래에 빵 바구니 줄이 붙은 장면부터 시작한다. 세 답변 신호는 잘못된 묶음 확인, 의뢰인에게 알리기, 티아구와 함께 다른 상자 확인하기로 각각 실제 행동이 된다. 주앙은 그날 저녁 빈칸을 남기고 며칠 뒤 고치지만 다음 일감을 잃는다. 전생록 화자의 도입·마무리, 대화, 선택의 대가가 있다.
- 03은 출생부터 사망까지 16개 변화를 기록하고, 04는 테레사·마리아·루이스·티아구의 서로 다른 기억을 남긴다. 생몰·나이·관계·인과를 01~04와 대조했다. 짧은 장면 문장과 구체적 사물을 사용해 중학생 독자도 소동과 선택을 따라갈 수 있게 했다.
- 배경 `lisbon-two-tile-walls-bg.jpg`는 1254×1254px이며 사람이 없다. 인물 `lisbon-joao-marques.webp`는 1024×1536px에 실제 투명도(알파 0~254)가 있다. 배·음식 바구니 타일, 비어 있는 자리, 당시 작업복과 도구를 원고와 대조했다. 두 자산은 API와 모바일의 같은 이야기 ID에 연결했다.

## 검증과 남은 한계

- `corepack pnpm typecheck`, `corepack pnpm content:check`, `corepack pnpm test`, `corepack pnpm test:e2e` 통과. 콘텐츠 검사는 97개의 분리된 배경·인물 쌍과 답변 도달성·다양성을 확인했다. API E2E 2건 통과.
- 전용 Playwright 검사 `e2e/mobile-two-wrong-tile-walls.spec.ts`가 320×720px·768×1024px에서 질문→결과, 01 프로필 세 쪽, 02~04 접근을 확인했다. 생성된 휴대전화·태블릿 스크린샷을 열어 인물 합성, 문장 가독성, 가로 넘침이 없음을 확인했다.
- 실제 독자의 흥미·이해도, 실기기 동작, 복식·건축의 고증을 전문 연구 수준으로 재현했는지는 검증하지 못했다. 기존 44편의 01·03 전수 보강도 남아 있다.

**집계:** 97/120 라이브, 23편 남음. 커밋·푸시·배포 없음.
