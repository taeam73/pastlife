# 100번째 원고·그림 검수 — 한 박자 늦은 원

- **집계:** 100개 고유 storyCards, 100개 고유 원고, 100쌍의 별도 그림과 API·모바일 매핑. 120편까지 20편 남음. 작업 전에는 각 99개였다.
- **선행 설정:** [설정 대장](story-setting-register.md)에 집필·그림 제작 전에 1905년 영국 보호령 아래 잔지바르 술탄국의 잔지바르 타운, 여성 나피사(1867~1942), 가족·장사·춤·병·노년을 확정했다.
- **역사 근거:** [유네스코 스톤타운](https://whc.unesco.org/en/urban-heritage-atlas/stone-town)의 안뜰·산호석과 시장길·보호령, [스미스소니언 1905년 무렵 여성 응고마 사진](https://africa.si.edu/archives/object/sova-eepa-1986-022-ref35), [스미스소니언 캉가 유래](https://festival.si.edu/blog/2014/a-cloth-of-many-meanings-the-khangas-role-in-kenyan-culture)와 [직물 연구 기록](https://www.si.edu/object/global-reach-fashionable-commodity-manufacturing-and-design-history-kanga-textiles-mackenzie-moon%3Asiris_sil_1104159)을 2026-10-23 확인했다. 나피사·가족·춤 모임·발목 부상·엇나간 공연·대사는 창작이다. 구체적 안무나 비용 제도를 역사 사실로 주장하지 않는다.
- **원고:** 01은 과일 장사, 혼인하지 않은 삶, 언니·조카·친구, 병·이사·노년까지 평생을 짧게 소개한다. 02는 공연 직전 발을 숨기는 친구, 본인에게 묻는 장면, 초보 살마의 실제 실수, 관객의 웃음과 취소된 둘째 곡까지 보여 준다. 세 답변은 발 관찰·주후라에게 묻기·살마와 맞춰 보기로 다르게 출발한다. 03은 출생~사망 16개 사건으로 02 밖의 가족과 장사 변화를 포함한다. 04는 마리암·살마·주후라·이웃 손님의 다른 평가를 담는다. 연도·나이·관계·인과·장면의 이동을 대조했다.
- **그림:** `zanzibar-ngoma-courtyard-bg.jpg` 1254×1254, 사람 없는 잔지바르 안뜰; `zanzibar-nafisa.webp` 1024×1536, 알파 투명 여성 춤꾼. 320px·768px 합성에서 글과 인물의 가독성을 직접 확인했다. 의상과 안뜰의 세부 복원은 전문가 확인 전이다.
- **검사 통과:** `corepack pnpm typecheck`, `corepack pnpm content:check`(100개 그림쌍과 다양성 포함), `corepack pnpm test`, `corepack pnpm test:e2e`. 전용 `e2e/mobile-one-beat-late-circle.spec.ts`를 API+모바일 브라우저에서 320×720 및 768×1024로 실행해 01 세 쪽, 02~04 접근, 그림 로드와 가로 넘침을 확인했다. `output/playwright/story-one-beat-late-circle-320-{1,2,3}.png`와 `-768-3.png`를 시각 검사했다.
- **한계:** 실사용자 이해·흥미, 물리적 기기, 정확한 춤·복식은 검증하지 않았다. 기존 첫 44편의 01·03 전수 보강도 남았다. 커밋·푸시·배포 없음.
