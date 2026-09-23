# 캐릭터 이미지 제작 규칙

> 필수 규칙: 이 문서는 모든 신규 캐릭터 이미지에 적용한다. 일부 항목만 적용하거나 임의로 완화해서는 안 된다. 규칙을 충족하지 못한 이미지는 프로젝트에 추가하지 않는다.

결과 화면에 배경 이미지와 합성하는 정적 캐릭터 자산은 아래 기준을 따른다.

- 생성 품질: 초안·폴백용 저품질 설정을 사용한다. 얼굴, 손, 시대 복식과 대표 도구를 식별할 수 있는 수준이면 충분하다.
- 구도: 머리부터 허리 또는 골반 위까지 보이는 상반신 한 명만 배치한다. 전신과 발은 만들지 않는다.
- 배치: 인물은 중앙에 두고 하단 정렬 합성을 위한 여백을 최소화한다. 머리와 양쪽 어깨, 손과 대표 도구가 잘리지 않아야 한다.
- 배경: 실제 알파 채널이 있는 투명 PNG로 만든다. 배경색, 그라데이션, 그림자판, 테두리는 넣지 않는다.
- 표현: 기존 캐릭터와 같은 사실적인 역사극 인물 사진 스타일, 자연스러운 피부와 직물 질감, 차분한 표정을 사용한다.
- 일치 조건: 결과의 시대, 지역, 직업과 성별에 맞는 복식·머리 모양·도구를 사용한다. 정확히 맞는 자산이 없으면 근현대 또는 다른 문화권 자산을 임의로 대체하지 않는다.
- 금지: 현대 물건과 복식, 시대착오적 도구, 문자, 로고, 상표, 워터마크, 실존 인물 닮은꼴, 과도한 장식과 선정적 표현.
- 파일명: `apps/mobile/assets/characters/v2/<setting>-<occupation>-<gender>.png` 형식을 사용한다.
- 검수: 파일 존재, PNG 형식, 투명 픽셀 존재, 모바일 정적 `require()` 등록, 결과 선택기 연결 및 회귀 테스트를 확인한다.

## 고정 생성 프롬프트

신규 캐릭터를 생성할 때 아래 문장을 삭제하거나 의미를 약화하지 않고 사용한다. 대괄호 부분만 해당 결과에 맞게 교체한다.

```text
Use case: historical-scene
Asset type: low-detail fallback character layer for a mobile result screen
Primary request: one fictional [gender] [occupation] in [location and era]
Subject: [period-accurate ethnicity, common clothing, hair, and one representative hand tool]
Style/medium: economical low-complexity photorealistic historical-drama portrait, natural skin and worn fabric, consistent with existing mobile character cutouts
Composition/framing: UPPER BODY ONLY from head to waist, centered, front three-quarter pose; head, shoulders, both hands and tool fully visible; no legs and no feet; tight vertical portrait crop suitable for bottom alignment
Lighting/mood: soft neutral daylight, restrained contrast
Constraints: genuinely transparent background with clean alpha edges; one person only; historically plausible clothing and hand tools; fictional face; PNG with a real alpha channel; no cast shadow or backdrop
Avoid: full body, legs, feet, scenery, background color, gradient, modern objects or clothing, adjacent-culture costume substitution, text, logo, border, watermark
```

첫 생성 결과에 배경색이나 그라데이션이 남으면 해당 결과를 그대로 사용하지 않는다. 인물은 유지하고 `background-extraction` 편집으로 배경만 제거한 뒤 알파값을 검사한다.

## 필수 작업 순서

1. 설정의 연도, 지역, 허용 직업, `visual.clothing`, `visual.avoid`를 확인한다.
2. 위 고정 프롬프트로 저복잡도 상반신 이미지를 생성한다.
3. 얼굴, 복식, 도구, 상반신 구도와 시대착오 여부를 눈으로 검사한다.
4. 실제 알파 채널과 투명 픽셀이 없으면 배경 제거 편집을 수행한다.
5. `characters/v2`에 규칙에 맞는 파일명으로 저장하고 모바일 및 API 선택기에 함께 등록한다.
6. `node scripts/check-character-assets.mjs`와 관련 회귀 테스트를 통과시킨다.

자동 검사는 PNG 시그니처, 1024×1536 크기, RGBA 알파 채널, 실제 투명·불투명 픽셀, 파일명, 모바일 정적 매핑, API 선택기 연결을 확인한다. 자동 검사를 통과하더라도 복식과 상반신 구도에 대한 사람의 시각 검수는 생략할 수 없다.

배경용 역사 장면은 이 문서가 아니라 `image-prompts-v4.md`의 16:9 장면 규칙을 따른다. API가 생성하는 단일 대표 이미지의 `quality: low` 설정과 정적 캐릭터 파일의 제작 규칙은 서로 별개의 항목이다.
