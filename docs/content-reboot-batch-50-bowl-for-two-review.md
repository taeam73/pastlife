# 90번째 원고·그림 검수 — 두 사람의 그릇

## 선행 설정과 역사 경계

- `docs/story-setting-register.md`에 원고 집필 전에 **985년 코르도바 칼리프국 코르도바**, 누라(여성, 946~1010), 가족·일·노년과 짝그릇 하루의 위치를 확정했다.
- [유네스코 코르도바 역사 지구](https://whc.unesco.org/en/list/313/), [유네스코 도시 유산](https://whc.unesco.org/en/urban-heritage-atlas/cordoba/), [메트로폴리탄 미술관 알안달루스 미술](https://www.metmuseum.org/es/met-publications/al-andalus-the-art-of-islamic-spain), [스페인 우마이야 역사](https://www.metmuseum.org/de/learn/educators/curriculum-resources/art-of-the-islamic-world/unit-five/chapter-one/the-spanish-umayyads)를 2026-10-23에 확인했다. 정치권·도시·도기 문화는 역사 근거이고, 인물·작업장·짝그릇과 거래는 창작이다.

## 원고 검수

- 01은 부모의 일, 혼인과 자녀, 직업의 계승과 다른 진로, 사별과 손녀까지 한 사람의 삶을 3쪽에 담았다. 짝그릇 사건의 교훈으로 평생을 정의하지 않는다.
- 02는 빚과 구매자의 제안으로 시작해, 어머니의 친구가 가진 짝그릇과 두 집의 음식 나눔을 발견하고, 판매를 취소하는 누라의 선택으로 끝난다. 계약금 전액에 자기 동전까지 돌려줘 빚이 남는다. 세 답변은 첫 행동이 다르며 사피야를 찾아가는 공통 사건으로 이어진다. 전생록의 도입과 삶 전체로 돌아가는 마무리를 확인했다.
- 03은 출생·부모·혼인·두 아이·작업장·빚·두 자녀의 다른 길·남편 사망·손녀·노년·사망을 15줄로 기록한다. 04의 가족·친구 평가는 같은 사건의 단일 교훈으로 모이지 않는다.
- 검수 중 손님이 준 계약금의 앞부분 언급 누락, 손님에게 일부만 돌려주는 거래 논리, 01 요약의 API 80자 초과를 수정했다. 연도·나이·관계·인과를 다시 대조했다.

## 그림과 앱 검증

- 배경 `cordoba-pottery-courtyard-bg.jpg`는 **1254×1254** 별도 작업장 그림이다. 첫 생성안에는 후대 건물처럼 보이는 먼 첨탑이 들어가 채택하지 않았고, 외부 건물이 보이지 않는 안마당 그림을 새로 생성했다.
- 인물 `cordoba-nura.webp`는 **1024×1536**, 알파 범위 **0~254**인 실제 투명 그림이다. 흙 묻은 손과 소박한 옷, 짝그릇이 원고와 맞는다.
- API 이미지 매핑과 모바일 정적 이미지 매핑을 확인했다. 콘텐츠 검사에서 **90개 고유 그림 쌍**을 확인했다.
- `corepack pnpm typecheck`, `corepack pnpm content:check`, `corepack pnpm test`, `corepack pnpm test:e2e` 통과. 전용 브라우저 E2E `e2e/mobile-bowl-for-two.spec.ts`에서 **320×720**, **768×1024**의 이미지 해상도·3쪽 01·02~04 도달·가로 넘침·문구 겹침을 확인했다. `output/playwright/story-bowl-for-two-*` 실제 화면을 열어 검토했다.
- 실제 독자 반응·실기기·정확한 10세기 복식 재현은 별도 검증 대상이며, 기존 44편의 01·03 전수 보강도 남아 있다. 커밋·푸시·배포하지 않았다.
