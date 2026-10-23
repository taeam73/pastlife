# 승격 원고: TIDE_MARK — 물고기가 삼킨 파란 선

상태(2026-10-22): **라이브 32/120편 중 하나**. 원고보다 먼저 `docs/story-setting-register.md`에 허구 세계 마렌, 눈금력 94년, 오란 하구 연맹의 칠물문 자유시, 남성 라오와 세 줄의 수위선 규칙을 고정했다. 실재 홍수·도시·제도의 재현이 아니다. 최종 본문은 `packages/content/src/story-catalog-batch-03.ts`의 `TIDE_MARK` 카드다.

## 편집·정합성 검수

- 흥미: 축제 물고기 그림이 경고 선을 가렸다는 첫 장면으로, 장터의 즐거움과 위험을 한 화면에 둔다.
- 재미: 라오가 선을 다시 드러내는 소동과 상류 연락 배의 표식이 선택에 필요한 두 단서다. 아래·가운데·위 세 선의 용도를 원고에 먼저 설명한다.
- 공감: 실제 큰 범람은 없지만 조기 철수로 잃은 장사와 벽화 수리비는 남는다. 라오가 물감 일부를 자기 일당에서 내고, 화가와 상인의 서로 다른 마음을 본다.
- 원고 일치: 상류 너울 자치령의 연락 배는 높은 물을 알리고, 라오는 가운데 선에 물이 닿기 *전* 짐을 옮긴다. 물은 그 선 근처까지 왔다 내려간다. 장터 위원회가 눈금을 없앨 권한은 없다. `notice`는 덧칠 발견, `protect`는 사전 운반, `speak`는 경고와 현재 수위를 함께 전하는 행동이다.
- 독자 질문은 준비가 헛일처럼 보였던 경험을 묻는다. 현재의 성격이나 실제 전생을 단정하지 않는다.

## 그림과 화면

- 최종 배경: `apps/mobile/assets/stories/v3/tide-mark-estuary-bg.jpg`, 원본 크기 **1254×1254**. 빈 하구 장터, 세 파란 선, 가운데 선 위의 물고기 지느러미, 높은 계단과 접힌 천막을 보여 준다. 첫 배경의 가운데 선이 너무 또렷해 지느러미가 선 일부를 덮도록 편집했다. 배경에는 인물이 없다.
- 최종 인물: `apps/mobile/assets/stories/v3/tide-mark-rao.webp`, 원본 크기 **1024×1536**, 실제 투명 알파. 넓은 얼굴과 거의 민 머리의 60대 남성, 황토빛 반소매 셔츠·넓은 남색 작업 앞치마, 작은 긁개를 들고 낮게 굽힌 포즈다. 직전 메이의 갈색 재킷·공구 가방·선 자세, 해원의 한복·장부와 다르다. 허구 도시의 돌벽과 여름 낮빛에 맞는다.
- 320px에서는 물고기와 파란 선의 일부, 라오의 얼굴·손·긁개, 제목과 첫 문단이 보인다. 계단 전체와 선 세 개의 관계는 768px에서 더 분명하다. 두 폭의 스크린샷에서 가로 넘침과 제목·요약 패널 겹침은 보이지 않았다. 파일은 `output/playwright/story-tide-mark-layered-320.png`, `output/playwright/story-tide-mark-layered-768.png`.

## 생성 지시와 검증

- 내장 `imagegen` 배경 지시: *Square painterly fictional Maren estuary market in early summer; empty low stone flood wall with three horizontal blue water marks, central fish festival mural partly covering the middle move-goods mark, folded canvas awnings, crates and high evacuation steps. Keep the fish and clue in the central mobile crop, title and lower copy areas quiet, right center open for a separate subject. No people, readable writing, modern devices or real-world national architecture.* 두 번째 편집에서는 다른 구도를 보존하고 물고기 지느러미가 가운데 선 일부만 가리게 했다.
- 내장 `imagegen` 인물 지시: *Genuinely transparent 2:3 portrait, native width at least 1024px: Rao, one 60-something male flood-level marker keeper, broad weathered face, nearly shaved gray hair, sturdy build, ochre short-sleeved work shirt, broad navy apron, crouching with a blunt paint scraper bearing blue flecks and pointing off-canvas. Warm summer daylight. Full hands and shoes in frame; no ground, wall, other person, writing or watermark.*
- `corepack pnpm typecheck`, `corepack pnpm test`(콘텐츠 22·scoring 13·mobile 10·API 96), `corepack pnpm content:check`(고유 32쌍과 도달성·다양성), `corepack pnpm test:e2e`(API 2건)가 통과했다. 3.0 모의 API·Expo를 별도 포트 4100·8181에서 구동한 이 편의 320px·768px 브라우저 검사 1건과 스크린샷 검수도 통과했다. 커밋·푸시·배포는 하지 않았다.
