# 전생록 운영 기준 및 시장 조사 실행 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task with review checkpoints.

**Goal:** 전생록의 기존 질문·결과 로직을 보호하면서 운영 규칙, 현황 문서, 시장 조사 근거, 디자인·콘텐츠 승인 흐름을 정착시킨다.

**Architecture:** 이번 단계는 문서와 증거 수집 중심으로 진행한다. 코드·의존성·질문·선택지·점수·결과 산정 로직은 변경하지 않으며, 검증 환경 문제는 저장소 외부 설정을 우선 점검한다. 시장 조사 결과는 확인·추정·가설을 분리하고 출처와 확인일을 남긴다.

**Tech Stack:** Markdown, Git, pnpm/Corepack, existing TypeScript monorepo, web research.

## Global Constraints

- 기존 질문 의미, 선택지 연결, 결과 산정 알고리즘, 데이터 구조는 승인 없이 변경하지 않는다.
- 문서·코드 변경은 단계별 검토 가능한 단위로 수행한다.
- 디자인은 서로 다른 3개 시안을 비교한 뒤 사람 승인을 받는다.
- 시장 수치와 경쟁 앱 평가는 출처 URL·확인일·측정 방법 없이는 사실로 단정하지 않는다.
- 외부 공급자와 데이터베이스는 실제 운영 검증 전까지 미확인으로 표시한다.

### Task 1: 기준선과 보호 대상 문서화

**Files:**
- Create: `AGENTS.md`
- Create: `docs/decision-log.md`
- Create: `docs/concept.md`

- [ ] 저장소 구조, 사용자 흐름, 테스트 범위, 보호 대상 ID와 계약을 기록한다.
- [ ] AGENTS.md에 문서 링크와 승인 없이 기존 기능·질문/결과 로직을 변경하지 않는 규칙을 기록한다.
- [ ] concept.md에서 확정 사실, 구현 확인 사실, 가설, 미확정 사항을 분리한다.
- [ ] decision-log.md에 이번 승인과 향후 승인 게이트를 날짜와 영향 범위와 함께 기록한다.
- [ ] 문서 변경만 별도 커밋하고 링크와 규칙을 검토한다.

### Task 2: 콘텐츠·디자인 운영 문서 초안

**Files:**
- Create: `docs/content-guide.md`
- Create: `docs/design-guide.md`

- [ ] 콘텐츠 톤, 오락성 고지, 문구 변경 허용 범위를 기록한다.
- [ ] 디자인 3안 비교 기준, 승인된 토큰, 이미지 권한·용량·대체 텍스트·접근성 기준을 기록한다.
- [ ] 실제 승인 전에는 디자인 토큰과 시안을 확정값으로 쓰지 않는다.
- [ ] 기존 화면과 구현 사실은 확인된 항목으로만 적는다.

### Task 3: 시장 조사 수행

**Files:**
- Create: `docs/market-research.md`

- [ ] 한국어·영어권을 우선 조사 범위로 기록한다.
- [ ] 수요, 경쟁 서비스, 리뷰, 콘텐츠/UI, 수익화·원가, 차별화·실행성의 6개 영역을 조사한다.
- [ ] 경쟁 서비스 약 10개를 기능·가격·광고·평점·리뷰 증거로 비교한다.
- [ ] 각 자료에 URL, 확인일, 측정 방식, 확실성 등급을 붙인다.
- [ ] 확인 가능한 자료가 없는 수치는 미확인으로 남긴다.

### Task 4: 검증 환경 복구와 기준선 테스트

**Files:**
- Modify only if required: local pnpm/Corepack or workspace permissions; no product source changes.

- [ ] `node_modules/.pnpm` 접근 권한 원인을 확인한다.
- [ ] 권한 문제 해결 후 `corepack pnpm typecheck`를 실행한다.
- [ ] `corepack pnpm test`와 `corepack pnpm content:check`를 실행한다.
- [ ] 외부 서비스가 필요한 E2E는 환경 조건과 실행 결과를 별도로 기록한다.
- [ ] 실패 원인과 재현 명령을 `docs/decision-log.md`에 남긴다.

### Task 5: 다음 승인 게이트

- [ ] 시장 조사와 문서 초안을 사람이 검토한다.
- [ ] 보편 기능·차별화 기능·제외/보류 기능을 승인한다.
- [ ] 디자인 시안 3개 제작 여부와 대상 화면을 승인한다.
- [ ] 승인 후에만 디자인 구현 또는 콘텐츠 문구 변경 계획을 작성한다.

