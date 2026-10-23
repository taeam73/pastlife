# 3묶음 검수 — 사과 배달부 테오

상태: `APOLOGY_COURIER` 라이브. 검수 시점의 `storyCards`는 **28/120편**, 미완료 **92편**이다. 이 기록은 실제 독자 반응이 아니라 내부 독자·기획자 관점의 자체 감수다.

## 선행 설정과 이야기의 역할

[설정 대장](story-setting-register.md#apology_courier--테오)의 허구 세계 **온베르**, **다리력 156년**, 페른 수로동맹의 **라메르 운하**와 북쪽 붉은 대공국·남쪽 섬들의 교역 관계, 19세 **남성** 테오를 먼저 고정했다. 접이식 다리의 폐쇄 시각과 작은 배의 통행이 배달 선택·지연 비용을 만든다. 밀랍 편지와 기계식 다리는 전기 이전의 설정에 맞는다.

| 기준 | 독자·기획자 감수 |
| --- | --- |
| 흥미 | 양쪽 둑의 수리공이 같은 날 서로에게 사과를 맡긴다. 어느 말을 먼저 전할지와 다리가 올라가기 전의 시간 압박이 첫 질문이다. |
| 재미 | 첫 봉투에서 부러진 쐐기 반쪽이 나오고 받는 사람도 나머지 반쪽을 갖고 있다. 단순한 화해담이 아니라 두 사람이 각자 말하지 않은 사실이 드러나는 작은 미스터리다. |
| 공감 | 사과를 건넨 뒤에도 수리, 손실과 마음의 시간이 남는다. 결과가 사용자의 실제 과거나 성격을 단정하지 않으며, “미안함을 듣고도 시간이 필요한 순간”을 떠올리게 한다. |
| 이름·장소·사건 | 테오·라메르·접이식 다리·갈라진 축 쐐기는 소개부터 뒤 장면까지 같은 설정으로 이어진다. |
| 선택·대가 | 테오는 봉인을 뜯거나 말을 고치지 않는다. 다리가 올라가자 자기 돈으로 작은 배를 빌려 원래의 사과와 새 답을 전한다. 늦은 배달료와 배삯을 잃고, 다리와 관계도 그날 바로 고쳐지지 않는다. |
| 답변 신호 | `notice`: 같은 다리의 반대편 주소와 묵직한 봉투를 알아챔. `connect`: 수리공의 직접 쓴 답만 이어 줌. `repair`: 다음 날 새 쐐기를 재는 동안 등잔을 들어 줌. 직업이나 현재 성격을 답에서 직결해 단정하지 않는다. |
| 차별화 | 최근 `WARM_STONES`는 실수 후 주문을 회복하는 봄눈 배달이고, 이 편은 두 사람이 감춘 사실과 직접 적은 사과를 연결하는 운하의 시간 제한 이야기다. `HEAVY_BOX`의 미완성 인사와도 역할·사건·결말이 다르다. |

수정 기록: 첫 초안의 “올라가는 다리를 다시 건넘”은 위험하고 위치도 모호해, 다리가 오른 뒤 **작은 배를 빌려 건너는 선택**으로 고쳤다. “다리 가운데 배달소”도 “다리 옆”으로 바꿨다. 부러진 쐐기는 재사용하지 않고 새 부품 치수를 재는 데만 쓴다. 초안의 인물 소개가 결론을 미리 말해, 마지막 공감 문장은 뒤에 남겼다.

## 그림과 화면

- 배경: [라메르 운하](../apps/mobile/assets/stories/v3/apology-courier-lamer-bg.jpg) — 생성 원본 1254×1254에서 픽셀 수 유지, JPEG 약 292KB. 주인공 없이 올라간 다리·운하·배·배달소 편지 두 통만 남긴다.
- 인물: [테오](../apps/mobile/assets/stories/v3/apology-courier-theo.webp) — 생성 원본 1024×1536에서 픽셀 수 유지, 알파 WebP 약 132KB. 첫 시안은 뻗은 손이 화면 밖으로 잘려 손만 안으로 넣는 편집을 거쳤다. 투명도 범위와 파일 매핑은 `content:check`로 확인했다.
- 최근 인물 비교: 아델은 흰머리·테라코타 경기복·돌판 앞의 정지 자세, 단우는 눈 묻은 두꺼운 회색 옷·빵과 돌을 든 달리기 자세, 해민은 넓은 멜빵과 짐꾼의 굽힌 자세다. 테오는 짧은 곱슬머리·주근깨·가벼운 황토색 배달 조끼·두 봉투를 가슴에 품고 배에 오르는 옆모습으로 구별된다. 배경과 인물은 같은 구리빛 저녁 빛·청록 운하 반사를 쓴다.
- [320px 결과 화면](../output/playwright/story-apology-courier-layered-320.png)에서는 올라간 다리와 테오의 두 편지, 제목·소개·본문이 보이고 가로 넘침이 없다. 배경의 편지는 중앙 크롭 밖이지만 인물이 두 통을 분명히 보여 준다. [768px 결과 화면](../output/playwright/story-apology-courier-layered-768.png)에서는 양쪽 다리·운하·배달소까지 보이고 인물과 글이 가리지 않는다.

내장 `image_gen` 사용. 배경 최종 생성 지시: *Square 1:1 cinematic painterly BACKGROUND, native short edge at least 1024px: fictional Onber canal city Lamer at sunset, a mechanical folding footbridge lifted enough to block walking while small ferries can pass, stone canal and lock-gate, two sealed paper apology envelopes on a dry dispatch ledge center-left; copper sunset and blue-green water; quiet upper-left title area, lower parchment area, open right-center character space; absolutely no people, text, logos, watermark or modern equipment.*

인물 최종 생성·편집 지시: *Separate truly transparent 2:3 CHARACTER cutout at least 1024px wide: Theo, a nineteen-year-old male apprentice apology courier with lean angular face, freckles, deep warm-brown skin and short tightly curled hair; lightweight mustard-ochre sleeveless vest, pale linen shirt, slate trousers, simple boots, small leather mail pouch; holds two wax-sealed letters against his chest while stepping into a ferry, copper sunset and blue-green fill light; full head and both boots, one human only, no boat or background. Edit only the reaching arm inward so every fingertip stays within the portrait frame; preserve face, outfit, letters, lighting and true alpha.*

## 검증과 남은 경계

`corepack pnpm typecheck`, `corepack pnpm test` (92 API 테스트), `corepack pnpm content:check` (28개 native 1024px급 배경·투명 인물 쌍과 분포), `corepack pnpm test:e2e` (2 API 테스트), 이 편의 320px/768px 브라우저 검사 및 화면 육안 검수 통과. `git diff --check`의 내용 오류는 없었다.

공유 개발 서버를 재사용한 **전체** 브라우저 회귀는 32개 중 27개 통과·5개 실패했다. 기존 여정/관리자 테스트는 현재 서버의 3.0 콘텐츠와 `historical scene`/질문 36개라는 2.5 테스트 기대가 맞지 않았고, 그늘 천막·종의 개별 테스트도 실패했다. 이번 편의 초점 검사는 별도로 통과했다. 다른 실행의 서버를 끄거나 교체하지 않았으며, 전체 회귀가 깨끗하게 통과했다고 기록하지 않는다. 다음 안정된 실행 환경에서 이 5건을 분리 재검증한다.
