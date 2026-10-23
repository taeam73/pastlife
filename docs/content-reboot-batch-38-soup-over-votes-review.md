# 78번째 원고·그림 검수 — 벽에 쓰인 내 이름

- ID: `SOUP_OVER_VOTES`; 주인공: 사비나, 서기 44~102년. 서기 78년 로마 제국 폼페이에서 친구 페트라와 음식점을 운영하고, 79년 베수비오 화산 폭발 때 도시를 떠나 네아폴리스에서 다시 시작하는 창작 인물이다. 집필 전에 [설정 대장](story-setting-register.md)에 연대·정치권·생애·역사 근거와 창작 범위를 확정했다.
- 역사 근거: 폼페이 고고학공원의 [아셀리나 식당 자료](https://pompeiisites.org/en/exhibitions-and-events/asellina-en/)는 여성 식당 운영과 선거 벽 글씨를, [선거 글씨 조사](https://pompeiisites.org/e-journal-degli-scavi-di-pompei/passione-elettorale-nelle-mura-domestiche-un-larario-una-macina-un-candidato/)와 [흰 바탕 자료](https://pompeiisites.org/en/press-kit-en/discoveries-continue-at-the-regio-v-site/)는 당시 벽 글씨 관행을 뒷받침한다. [폭발 후 주민 자료](https://pompeiisites.org/en/pompeii-map/analysis/pompeii-after-the-eruption/)는 생존자가 있었음을 보여 준다. 사비나·페트라·펠릭스·리키아, 특정 가게·후보·갈등·피난 경로는 창작이다. 자료 확인일 2026-10-23.
- 01: 어머니에게 장사를 배운 어린 시절부터 페트라와 함께한 식당, 도시를 떠난 뒤 재개업, 페트라와 사별 후 리키아에게 일을 나눈 노년까지 세 쪽으로 요약했다. 벽 사건 한 번으로 평생을 규정하지 않는다.
- 02: 허락 없이 식당 벽에 적힌 후보 추천에서 시작한다. 누구의 요청인지 확인하고, 펠릭스의 일자리 기대와 자기 이름의 뜻이 부딪히는 장면을 거쳐 글을 고친다. 두 번째 글씨 품삯, 떠난 손님, 남매 사이의 거리라는 대가가 남는다. 전생록 화자의 도입과 이후 생애의 마무리가 있고, `notice`·`speak`·`repair` 각각 구체적인 선택 행동이 있다.
- 03: 출생부터 사망까지 15개 사건. 02 밖의 장사·어머니와 친구의 죽음·피난·새 가게·노년의 몸과 일 변화를 포함한다. 04는 어머니·페트라·펠릭스·리키아·단골을 통해 다른 관계의 기억을 담는다. 생몰·나이·관계·인과를 대조했다.
- 그림: `apps/mobile/assets/stories/v3/soup-over-votes-pompeii-bg.jpg`(1254×1254, 별도 배경)와 `soup-over-votes-sabina.webp`(1024×1536, 실제 알파 0~254). 배경은 폼페이의 작은 음식점과 흰 벽, 인물은 국자를 든 34세 여성으로 설정했다. 최근 편의 캘커타 세탁터·앙코르 논과 배경·의복·소품이 구별된다. 생성 그림은 고고학적 복원도가 아니라 원고를 위한 창작 삽화다.
- 검증: `corepack pnpm typecheck`, `corepack pnpm content:check`, API E2E 통과. `e2e/mobile-soup-over-votes.spec.ts`가 320×720과 768×1024에서 그림 로드·01 세 쪽·02~04 도달성·가로 넘침·인용문과 양피지 간격을 통과했다. 실제 합성 스크린샷을 두 크기에서 확인했다. 전체 78개의 고유 원고·그림 매핑, 중복 ID 없음.
- 한계: 실제 독자의 재미·이해도와 실기기 터치·화면 검사는 아직 없다. 기존 44편 01·03 전수 보강도 별도 작업으로 남는다. 커밋·푸시·배포하지 않았다.
