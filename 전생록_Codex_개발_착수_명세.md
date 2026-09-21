---
product: 전생록
global_name: Past Life Archive
document_type: Codex development specification
prd_version: 2.0
status: ready_for_implementation
canonical_language: ko
required_question_count: 36

> 사용자 문장 기준: 모든 질문, 결과, 가이드, UI 문구와 AI 생성 문장은 `docs/development-writing-guidelines.md`를 따른다. 10대, 특히 중학생도 한 번 읽고 이해할 수 있는 쉽고 구체적인 표현을 사용한다.
required_choice_count: 216
maximum_ads_per_run: 3
---

# 전생록 Codex 개발 착수 명세

이 파일은 전생록을 구현하는 Codex의 단일 개발 기준서다. 파일 전체를 읽은 다음 작업을 시작한다. 제품 요구사항과 콘텐츠는 아래 본문을 따르고, 구현 순서와 기술 기준은 부록 D를 따른다.

## Codex 작업 규칙

1. 첫 작업은 부록 D의 첫 구현 범위까지만 완료한다.
2. 질문 36개와 선택지 216개는 ID를 보존한 채 seed 데이터로 만든다.
3. 판정은 서버의 순수 함수가 담당하며 같은 answerHash와 contentVersion은 같은 resultCore를 반환해야 한다.
4. 실제 광고, Google 로그인, AI 공급자 키가 없어도 mock과 fallback으로 전체 흐름이 실행돼야 한다.
5. 범위를 바꾸는 추측은 하지 않는다. 데이터 손실, 외부 비용, 보안 또는 사용자 경험을 바꾸는 결정만 사용자에게 확인한다.
6. 구현 후 실행 명령, 테스트 결과, mock 사용 여부, 남은 범위를 보고한다.

## 첫 Codex 지시문

다음 문장을 이 파일과 함께 Codex에 전달한다.

> 이 명세 전체를 읽고 부록 D의 첫 구현 범위를 순서대로 구현해 주세요. 먼저 현재 저장소를 점검하고, 기존 구조가 없으면 pnpm TypeScript 모노레포를 만드세요. 실제 외부 서비스 키가 없어도 mock과 fallback으로 시작부터 기본 결과까지 실행되게 하세요. 구현을 마치면 실행 방법, 테스트 결과, 구현한 요구사항, 남은 범위를 보고해 주세요.

## 문서 목적과 사용 기준

이 문서는 전생록의 제품 방향, 콘텐츠 구조, 판정 로직, 화면 흐름, 데이터 모델, API, 운영 도구와 품질 기준을 하나의 구현 기준으로 정의한다. 기획, 디자인, 콘텐츠 제작, 모바일 앱 개발, 서버 개발, 관리자 개발과 QA는 이 문서를 공통 기준으로 사용한다.

문서의 규범 용어는 다음과 같다. 반드시 는 출시 요건, 권장 은 기본 구현안, 선택 은 운영 설정으로 켜거나 끌 수 있는 기능을 뜻한다. 핵심 결과는 DB와 판정 로직이 결정하며 AI는 문장 표현과 결과별 대표 이미지 생성만 담당한다.

### 문서 구성

| 구분 | 내용 |
| --- | --- |
| 제품 | 브랜드, 목표, 사용자, 전체 흐름, 수익화, 신뢰 정책 |
| 콘텐츠 | 6단계 질문, 36문항 후보, 216선택지, 태그와 점수, 결과 블록 |
| 경험 | 화면 명세, UI UX, 광고 해금, 저장 공유, 로그인과 아카이브 |
| 개발 | 상태, DB, API, 예외 처리, 보안, 분석 이벤트, 관리자 기능 |
| 검증 | 완료 기준, 테스트 시나리오, 출시 순서 |

### 핵심 결정 요약

- 서비스명은 한국 전생록, 글로벌 Past Life Archive로 고정한다.

- 사용자는 로그인 없이 6단계 질문을 진행하며 각 단계에서 6개 후보 중 1개를 직감으로 고른다.

- 질문 풀은 단계별 6문항, 총 36문항이며 각 문항은 6개 선택지를 가져 총 216개 선택지로 구성한다.

- 판정은 18개 핵심 태그와 보조 축의 점수, 시대와 지역 호환 규칙, 결정적 시드로 수행한다.

- 기본 결과 7개, 심화 결과 4개, 현생 가이드 4개 영역을 단계적으로 공개한다.

- 광고는 1회 체험당 최대 3회다. 광고 1 이후 기본 결과, 광고 2 이후 심화 결과, 광고 3 이후 현생 가이드를 공개한다.

- AI 이미지는 결과 상태를 최초 조회할 때 결과별로 1장만 low 품질로 자동 생성하고 저장된 이미지를 재사용한다. 네 번째 광고나 별도 이미지 생성 선택 단계는 추가하지 않는다.

- Google 로그인은 저장 시점에만 제안하며 취소해도 결과 열람은 유지한다.

- 로그인 사용자는 나의 전생 아카이브에서 기록 번호, 날짜, 이미지, 결과를 다시 열람하고 공유할 수 있다.

- 본 서비스는 종교적 또는 과학적 사실을 판정하지 않는 창작형 오락 콘텐츠임을 명확히 고지한다.

## 1 제품 개요

### 1 1 제품 정의

전생록은 사용자가 여섯 번의 직감적 선택을 통해 하나의 전생 기록을 발견하고, 그 기록을 이야기와 이미지로 읽고 보관하는 모바일 콘텐츠 서비스다. 경험은 심리 검사보다 기록 발굴에 가깝게 연출한다. 결과는 다양한 데이터 블록을 조합해 생성하되 같은 입력과 같은 콘텐츠 버전에는 같은 핵심 결과를 반환한다.

### 1 2 브랜드

| 항목 | 한국 | 글로벌 |
| --- | --- | --- |
| 서비스명 | 전생록 | Past Life Archive |
| 메인 카피 | 나는 언제, 어디에서, 어떤 사람이었을까? 당신의 전생을 찾아드립니다. | Who was I, where did I live, and when? Discover your past life. |
| 앱 표시명 권장 | 전생록 6단계 전생 탐색 | Past Life Archive |
| 주요 CTA | 내 전생 찾아보기 | Discover My Past Life |

### 1 3 제품 목표

- 첫 방문 사용자가 로그인 없이 질문을 시작하고 기본 결과까지 완주할 수 있게 한다.

- 6단계라는 구조적 인상을 유지하면서 각 화면의 선택 부담은 낮춘다.

- 전생 결과를 한 번 소비하는 테스트가 아니라 기록 번호와 아카이브가 쌓이는 재방문형 서비스로 만든다.

- 광고 조건을 버튼 문구에 미리 표시하고, 사용자가 심화 콘텐츠 공개 여부를 선택하게 한다.

- 콘텐츠와 번역을 코드에서 분리해 질문, 결과, 국가와 문명권, 가이드 데이터를 계속 확장할 수 있게 한다.

### 1 4 범위

| 포함 | 출시 후 검토 |
| --- | --- |
| 모바일 앱, 6단계 질문, 판정 엔진, 결과 7개, 심화 4개, 현생 가이드, 광고 3회, 이미지, 저장 공유, Google 로그인, 아카이브, 관리자 | Apple 로그인, 유료 광고 제거, 구독, 소셜 피드, 친구 비교, 실시간 상담, 사용자 자유 입력 기반 리딩 |

### 1 5 사용자와 핵심 지표

| 단계 | 대표 지표 | 이벤트 기준 |
| --- | --- | --- |
| 유입 | 시작 전환율 | start_tap / app_open |
| 질문 | 6단계 완료율 | question_complete / question_start |
| 수익 | 광고별 완료율 | ad_complete / ad_offer |
| 몰입 | 기본과 심화 열람률 | section_view / result_ready |
| 저장 | 로그인 선택률과 저장 성공률 | archive_saved / save_offer |
| 공유 | 공유 완료율 | share_complete / result_ready |
| 품질 | 결과 분포와 실패율 | result_type distribution, generation_failed |

## 2 세계관과 신뢰 정책

### 2 1 경험 원칙

- 사용자는 기억의 조각을 고르고, 서비스는 흩어진 기록을 복원한다.

- 한 화면에는 한 가지 질문 또는 한 가지 결과 메시지만 둔다.

- 정밀, 과학적, 증명, 실제 전생 판정 같은 표현을 사용하지 않는다.

- 결과는 가능성이 큽니다, 기록은 이렇게 남아 있습니다처럼 여지를 둔 문장으로 표현한다.

- 죽음, 전쟁, 상실은 자극적으로 묘사하지 않고 마지막에 남은 감정과 관계에 초점을 둔다.

### 2 2 고지 문구

서비스 소개 권장 문구: 본 콘텐츠는 불교의 윤회 사상과 티베트 불교의 바르도 개념 등에서 영감을 받은 창작형 오락 콘텐츠입니다.

결과 화면 하단 필수 문구: 이 결과는 종교적 또는 과학적 사실을 판정하거나 현재의 성격과 미래를 진단하지 않습니다. 선택을 바탕으로 구성된 창작 스토리텔링입니다.

### 2 3 AI 역할 제한

| 구분 | 허용 | 금지 |
| --- | --- | --- |
| 판정 | 확정된 DB 결과를 읽기 | 시대, 지역, 국가, 직업, 인연, 사건을 임의 변경 |
| 문장 | 템플릿 안에서 연결 문장과 감정선 변형 | 역사적 사실을 새로 만들거나 사실처럼 단정 |
| 이미지 | 확정 속성을 시네마틱 역사 일러스트로 시각화 | 현대 물건, 시대 불일치 복식, 과도한 판타지와 폭력 |
| 현생 가이드 | 미리 검수된 가이드 블록을 자연스럽게 연결 | 의학, 심리, 법률, 재정 진단 또는 조언 |

## 3 전체 사용자 흐름

1. 앱 시작 화면에서 서비스명과 카피를 보고 내 전생 찾아보기를 누른다.

2. 안내 화면에서 직감 선택 원칙을 확인하고 질문 시작하기를 누른다.

3. 6단계 질문을 진행한다. 매 단계는 6개 선택지 중 하나를 선택하며 1/6부터 6/6까지 진행률을 표시한다.

4. 서버가 응답을 고정하고 태그와 점수, 호환 조건, 시드를 사용해 전생 결과를 계산한다.

5. 분석 연출과 광고 1을 거친 뒤 기본 결과 7개와 대표 라이브러리 이미지를 공개한다.

6. 사용자가 광고 보고 심화 내용 보기를 선택하고 광고 2를 완료하면 심화 결과 4개를 공개한다.

7. 사용자가 광고 보고 현생 가이드 보기를 선택하고 광고 3을 완료하면 현생 가이드 4개를 공개한다.

8. 결과 상태를 최초 조회하면 확정 결과로 AI 대표 이미지 1장을 low 품질로 자동 생성한다. 생성 API가 구성되지 않았거나 재시도 후에도 실패하면 기본 라이브러리 이미지를 유지한다.

9. 사용자는 결과 카드와 이미지를 기기에 저장하거나 공유할 수 있다.

10. 사용자가 기록 보관을 선택하면 로그인하고 나의 전생 목록 생성하기 또는 저장 없이 종료하기를 고른다.

11. Google 로그인에 성공하면 같은 resultId를 나의 전생 아카이브에 한 번만 저장한다.

### 3 1 광고와 해금

| 광고 | 형식 | 노출 시점 | 완료 후 해금 | 실패와 취소 |
| --- | --- | --- | --- | --- |
| AD 1 | 전면 | 6단계 완료와 분석 연출 후 | 기본 결과 7개 | 광고 서버 실패 시 재시도 후 운영 설정에 따라 기본 결과 허용 |
| AD 2 | 보상형 | 광고 보고 심화 내용 보기 선택 | 심화 결과 4개 | 미완료 시 잠금 유지, 결과 기본 화면으로 복귀 |
| AD 3 | 보상형 | 광고 보고 현생 가이드 보기 선택 | 현생 가이드 4개 | 미완료 시 잠금 유지, 심화 화면으로 복귀 |

광고 완료 이벤트는 서버가 멱등 처리한다. 동일한 세션과 슬롯에 대해 완료 이벤트가 중복 도착해도 unlock은 한 번만 생성한다. 광고 로드 실패가 반복되면 resultId를 유지하고 재시도 버튼을 제공한다. 광고를 보지 않은 상태에서 보호된 API를 호출하면 403 UNLOCK_REQUIRED를 반환한다.

## 4 질문 시스템

### 4 1 6단계 구조

| 단계 | 이름 | 측정 목적 | 주요 영향 |
| --- | --- | --- | --- |
| 1 | 본능적 선택 | 환경과 이동에 대한 즉각 반응 | 시대, 권역, 생활 환경 |
| 2 | 인연의 기억 | 관계의 거리와 정서 | 성격, 중요한 인연 |
| 3 | 삶의 욕망 | 가장 원하는 가치 | 신분, 직업, 삶의 방향 |
| 4 | 운명의 갈림길 | 위기와 선택 방식 | 성격, 사건, 역할 |
| 5 | 마음에 남은 것 | 행복, 후회, 소망의 흔적 | 심화 결과, 현생 흔적 |
| 6 | 마지막 기억 | 장소, 존재, 감정의 잔상 | 마지막 기억, 미련, 현생 가이드 |

### 4 2 선택 안내

기억은 생각보다 먼저 반응합니다. 너무 오래 고민하지 말고, 가장 먼저 마음이 가는 것을 선택해 주세요.

- 사용자에게 태그, 점수, 측정 목적과 질문 분류를 노출하지 않는다.

- 선택 즉시 저장하고 다음 단계로 자동 이동한다. 이전 단계로 돌아갈 수 있게 하되 결과 확정 후에는 답을 수정하지 못한다.

- 각 단계는 해당 단계의 6개 질문 후보 중 하나를 시드 기반으로 선택한다.

- 같은 sessionSeed와 콘텐츠 버전에는 같은 질문 순서가 나온다.

- 선택지 노출 순서는 문항 정의의 기본 순서를 사용하되 운영 실험에서만 셔플할 수 있다.

## 5 판정 로직

### 5 1 핵심 태그

| 그룹 | 태그 |
| --- | --- |
| 삶의 방향 | 자유 freedom, 안정 stability, 성취 achievement, 명예 honor, 지식 knowledge, 영성 spirituality |
| 행동 방식 | 모험 adventure, 생존 survival, 용기 courage, 독립 independence, 창조 creativity |
| 관계 | 관계 connection, 헌신 devotion, 공감 empathy, 보호 protection |
| 내면 | 평온 calm, 열망 longing, 회한 regret |

### 5 2 보조 축

| 축 | 범위 | 용도 |
| --- | --- | --- |
| mobility | -6 정착부터 +6 이동 | 유목, 항해, 탐험, 이주 가능성 |
| urbanity | -6 자연부터 +6 도시 | 권역과 생활 환경 |
| authority | -6 반권위부터 +6 권력 | 신분과 관료 군사 계열 |
| collectivism | -6 개인부터 +6 공동체 | 관계와 직업군 |
| risk | -6 신중부터 +6 위험 감수 | 사건과 직업 |
| materiality | -6 정신부터 +6 물질 | 종교 학자 상인 생산 계열 |

### 5 3 선택지 점수 규칙

- 각 선택지는 핵심 태그 2개에서 4개에 +1에서 +3점을 부여한다.

- 보조 축은 선택지마다 -2에서 +2 범위로 부여한다.

- 단계별 가중치는 1단계 환경과 권역 1.3, 2단계 인연 1.3, 3단계 직업과 신분 1.4, 4단계 사건 1.4, 5단계 심화와 현생 흔적 1.3, 6단계 엔딩 1.5를 기본값으로 사용한다.

- 점수는 서버에서 계산하며 클라이언트는 choiceId만 전송한다.

### 5 4 판정 순서

1. 6개 응답을 잠그고 응답별 태그 점수와 보조 축을 단계 가중치와 함께 합산한다.

2. 상위 핵심 태그 4개와 보조 축을 사용해 시대 후보와 권역 후보를 각각 최대 3개로 줄인다.

3. 시대와 권역 교집합에서 역사적 국가 또는 문명권 후보를 만든다.

4. 시대, 권역, 역사적 위치, 태그와 보조 축을 사용해 신분과 직업 후보를 만든다.

5. 성격, 인연, 사건, 마지막 기억 후보를 호환 규칙으로 필터링한다.

6. sessionSeed, contentVersion, answerHash를 사용한 결정적 가중 랜덤으로 동점 후보를 선택한다.

7. 기본 결과 7개, 심화 4개, 현생 가이드 4개, 기록 번호와 이미지 프롬프트 속성을 확정하고 resultId에 스냅샷으로 저장한다.

### 5 5 호환 규칙과 재현성

- 시대에 존재하지 않는 국가명, 직업, 복식, 기술은 제외한다.

- historical_location은 eraId와 regionId가 모두 일치해야 한다.

- 직업은 allowedEraIds, allowedLocationIds, allowedClassIds를 만족해야 한다.

- 핵심 사건은 1개, 보조 사건은 최대 1개만 사용한다.

- 같은 answerHash와 contentVersion은 같은 resultCore를 반환한다.

- 번역, 문장 재생성, 이미지 재시도는 resultCore를 변경하지 않는다.

- 콘텐츠 버전이 달라진 새 체험은 새 결과를 만들 수 있지만 기존 아카이브는 저장 당시 스냅샷을 유지한다.

### 5 6 결과 기록 번호

기록 번호는 사실 주장 대신 세계관 장치로 사용한다. 화면에는 전생 기록 No.07처럼 표시한다. 번호는 사용자별 아카이브 내에서 중복되지 않아야 하며, 비회원 결과에는 answerHash 기반의 01에서 99 사이 번호를 안정적으로 부여한다. 로그인 저장 시 이미 사용한 번호와 겹치면 다음 사용 가능한 번호를 결정적으로 선택한다.

## 6 콘텐츠 데이터베이스

### 6 1 초기 규모

| 영역 | 초기 기준 | 필수 속성 |
| --- | --- | --- |
| 시대 | 8개 | 표시명, 연대 범위, 허용 권역, 이미지 태그 |
| 권역 | 8개 | 권역명, 현대 지리 보조 설명 |
| 역사적 국가와 문명권 | 권역별 3개 이상 | 시대, 권역, 당시 명칭, 현대 위치 설명 |
| 신분과 직업 | 대분류 12개, 세부 30개에서 40개 | 시대, 지역, 신분, 태그, 생활 환경, 사건 |
| 성격 | 20개 | 태그, 직업군, 사건, 인연 |
| 중요한 인연 | 12개 이상 | 관계 유형, 정서, 호환 태그 |
| 큰 사건 | 15개 이상 | 시대, 지역, 직업, 필요 태그, 배제 조건 |
| 마지막 기억 | 12개 이상 | 장소, 곁의 존재, 감정, 미련, 흔적 |
| 현생 흔적 | 20개 이상 | 성향, 관계, 일, 마음가짐 연결 |
| 심화 결과 | 4종 각 12개에서 15개 | 태그 조건과 번역 키 |
| 전체 스토리 블록 | 약 250개에서 350개 | 호환 조건, 상태, 버전, 번역 |

### 6 2 시대 8개

| ID | 표시명 | 범위 안내 |
| --- | --- | --- |
| ERA_ANCIENT_CIV | 고대 문명기 | 초기 도시 문명과 왕국 |
| ERA_CLASSICAL | 고전 고대 | 고대 제국과 도시 국가 |
| ERA_MEDIEVAL | 중세 | 지역 왕조와 봉건 사회 |
| ERA_RENAISSANCE_EARLY_MODERN | 르네상스 근세 | 도시 문화와 중앙 권력 확대 |
| ERA_AGE_OF_EXPLORATION | 대항해 시대 | 장거리 항해와 교역 확대 |
| ERA_INDUSTRIAL | 근대 산업화 시대 | 산업과 도시 노동의 확대 |
| ERA_20C_EARLY | 20세기 전반 | 대전과 급격한 사회 변화 |
| ERA_20C_LATE | 20세기 후반 | 전후 재건과 현대화 |

### 6 3 권역 8개

| ID | 권역 | 역사적 위치 예시 |
| --- | --- | --- |
| REG_EAST_ASIA | 동아시아 | 조선, 중국 왕조, 일본 열도, 몽골권 |
| REG_SOUTH_ASIA | 남아시아 | 인도 아대륙, 스리랑카, 네팔, 티베트권 |
| REG_MENA | 중동 북아프리카 | 이집트, 페르시아권, 오스만권, 아라비아 |
| REG_EUROPE | 유럽 | 영국권, 프랑스, 독일권, 이탈리아 도시국가, 이베리아 |
| REG_SUBSAHARAN_AFRICA | 사하라 이남 아프리카 | 서아프리카 왕국, 동아프리카 해안, 남부 지역 |
| REG_AMERICAS | 아메리카 대륙 | 메소아메리카, 안데스, 북아메리카 문화권 |
| REG_CENTRAL_ASIA | 중앙아시아 유목권 | 초원 지대, 실크로드 오아시스, 유목 제국 |
| REG_OCEANIA | 오세아니아 | 폴리네시아, 멜라네시아, 호주 원주민 문화권 |

결과는 현대 국가명을 당시 국가처럼 사용하지 않는다. 예: 15세기 후반, 오늘날 이탈리아 북부에 해당하는 베네치아 공화국. historical_name과 present_day_context를 분리 저장한다.

### 6 4 신분과 직업 대분류 12개

| ID | 대분류 | 세부 직업 예시 |
| --- | --- | --- |
| ROYAL_NOBLE | 왕족 귀족 | 왕실 구성원, 지방 귀족, 궁정인 |
| ADMIN | 관료 행정가 | 서기관, 세금 관리, 외교 사절 |
| SCHOLAR | 학자 교육자 | 학자, 교사, 지도 제작자, 기록관 |
| RELIGIOUS | 종교인 수행자 | 승려, 사제, 수도자, 의례 담당자 |
| MILITARY | 군인 무사 | 보병, 기병, 무사, 경비대 |
| MERCHANT | 상인 무역인 | 시장 상인, 장거리 무역상, 선박 상인 |
| ARTISAN | 장인 기술자 | 대장장이, 도예가, 직조공, 건축 장인 |
| AGRICULTURE | 농업 생산 종사자 | 농부, 목축인, 어부, 양봉인 |
| ARTIST | 예술가 창작자 | 화가, 음악가, 시인, 연희인 |
| EXPLORER | 탐험가 항해자 | 항해사, 길잡이, 탐사대원 |
| HEALER | 의료 치유 종사자 | 의사, 약초가, 산파, 치료사 |
| COMMON_LABOR | 서민 노동 생활직 | 운반인, 하인, 광부, 공방 노동자 |

## 7 결과 콘텐츠

### 7 1 기본 결과 7개

| 순서 | 블록 | 내용 |
| --- | --- | --- |
| 1 | 전생 기록 표지 | 기록 번호, 시대, 역사적 위치, 신분과 직업, 대표 이미지 |
| 2 | 나는 어떤 사람이었는가 | 핵심 성격과 가치관 |
| 3 | 그 시대의 나의 삶 | 생활 환경, 역할, 일상의 리듬 |
| 4 | 나에게 가장 중요했던 인연 | 관계 유형, 상대의 역할, 남은 감정 |
| 5 | 삶을 바꾼 사건 | 핵심 사건 1개와 선택의 영향 |
| 6 | 마지막 기억 | 장소, 곁에 있던 존재, 마지막 감정과 미련 |
| 7 | 현재의 나에게 남아 있는 흔적 | 전생 태그와 연결되는 현재의 성향을 비진단적으로 표현 |

### 7 2 심화 결과 4개

| 순서 | 블록 | 표현 원칙 |
| --- | --- | --- |
| 1 | 가장 행복했던 순간 | 관계, 장소, 감각을 중심으로 짧게 구성 |
| 2 | 가장 후회했던 선택 | 비난보다 당시의 선택과 남은 감정을 설명 |
| 3 | 숨겨진 인연 | 기본 인연과 겹치지 않는 보조 관계 |
| 4 | 끝내 이루지 못한 소망 | 현생 가이드로 자연스럽게 이어지는 미완의 가치 |

### 7 3 현생 가이드 4개

| 영역 | 내용 | 금지 |
| --- | --- | --- |
| 살려야 할 강점 | 상위 태그가 주는 긍정적 행동 힌트 | 성격 진단과 운명 단정 |
| 주의할 패턴 | 과해질 때 나타날 수 있는 반복 패턴 | 불안 유발과 질병 암시 |
| 관계 가이드 | 공감, 경계, 표현 방식의 일반적 제안 | 특정 관계 단절 지시 |
| 지향점 | 작게 실천할 수 있는 방향과 한 줄 메시지 | 재정, 의료, 법률 조언 |

### 7 4 문장 생성

- 전생 기록 표지는 시대, 역사적 위치, 직업의 한 줄 조합으로 고정한다. 예: 16세기 후반 베네치아 공화국의 지도 제작자.

- 각 블록은 검수된 사실 필드와 3개에서 5개의 문장 템플릿을 가진다.

- AI는 템플릿의 순서, 연결어, 어투를 변형할 수 있지만 사실 필드를 바꿀 수 없다.

- 마지막 한 줄은 20개에서 30개의 검수된 문구 풀에서 태그 기반으로 고른다.

- AI가 실패하면 같은 resultCore로 DB 기본 템플릿을 즉시 제공한다.

## 8 이미지 저장 공유

### 8 1 하이브리드 이미지 정책

결과 상태 최초 조회는 확정 결과를 바탕으로 개인화된 AI 대표 이미지 1장을 low 품질로 자동 생성한다. 생성 중복은 resultId 단위로 차단하며 생성된 이미지는 저장해 기본 결과, 심화 결과, 현생 가이드, 재방문, 공유, 다운로드에서 재사용한다. 생성 API가 구성되지 않았거나 재시도 후에도 실패하면 시대, 권역, 직업, 분위기에 맞는 검수된 라이브러리 이미지를 저장해 사용한다.

### 8 2 AI 이미지 입력

| 필드 | 예 |
| --- | --- |
| 시대와 위치 | 16세기 후반, 베네치아 공화국 |
| 인물 | 전생 성별 표현, 연령대, 신분, 직업 |
| 복식과 소품 | 시대와 직업에 맞는 복식, 도구 |
| 생활 환경 | 작업실, 항구, 농장, 궁정, 산길 |
| 성격과 사건 | 차분한 집중, 이별 직전의 분위기 |
| 시각 연출 | 시네마틱 역사 일러스트, 절제된 색감, 인물 중심 |

### 8 3 금지와 대체

- 현대 물건, 시대 불일치 복식, 과도한 판타지, 노골적 폭력과 시신 표현을 금지한다.

- 실존 인물과 유사한 얼굴, 종교와 민족의 희화화, 성적 대상화를 금지한다.

- 생성 실패 시 1회 자동 재시도하고 실패하면 기본 라이브러리 이미지를 유지한다.

- 공유 카드는 대표 이미지, 전생 타이틀, 시대, 직업, 대표 성격, 한 줄 문구, 서비스명을 포함한다.

## 9 계정과 나의 전생 아카이브

### 9 1 로그인 정책

- 앱 시작, 질문, 결과 열람에는 로그인이 필요하지 않다.

- 현생 가이드까지 열람한 뒤 기록을 보관할 때 Google 로그인을 제안한다.

- 버튼은 로그인하고 나의 전생 목록 생성하기와 저장 없이 종료하기로 명확히 표시한다.

- 로그인 취소 또는 실패는 결과와 unlock 상태를 지우지 않는다.

- 서비스는 provider subject, 이메일, 가입일, 최근 로그인, 저장 기록 수 등 최소 정보만 저장한다.

### 9 2 아카이브 기능

| 기능 | 요구사항 |
| --- | --- |
| 목록 | 기록 번호, 제목, 대표 이미지, 생성 날짜를 최신순으로 표시 |
| 상세 | 저장 당시 결과 스냅샷과 이미지, 공개된 심화와 가이드 재열람 |
| 중복 방지 | userId와 resultId 조합을 유일 키로 사용 |
| 저장과 공유 | 대표 이미지와 공유 카드의 기기 저장 및 시스템 공유 시트 |
| 기록 삭제 | 사용자 요청 시 개별 아카이브 삭제. 원본 익명 분석 데이터 보존 정책은 개인정보 처리방침에 명시 |

## 10 다국어 구조

- 로직 ID와 콘텐츠 번역을 분리한다. 코드와 판정 규칙에는 사용자 노출 문장을 넣지 않는다.

- 초기 언어는 한국어, 영어, 일본어를 권장하며 중국어 간체와 스페인어를 다음 우선순위로 둔다.

- 모든 질문, 선택지, 시대, 위치, 직업, 결과 블록, 가이드, CTA, 오류 문구는 translationKey를 가진다.

- 자동 번역을 바로 게시하지 않는다. 언어별 상태는 draft, review, published로 관리한다.

- 결과 스냅샷은 contentId와 contentVersion을 저장하고 표시 시 현재 번역 또는 저장 당시 번역 정책을 선택할 수 있게 한다. 초기에는 저장 당시 텍스트를 유지한다.

| 예시 키 | 한국어 | 영어 |
| --- | --- | --- |
| brand.name | 전생록 | Past Life Archive |
| onboarding.intuition | 기억은 생각보다 먼저 반응합니다. 너무 오래 고민하지 말고, 가장 먼저 마음이 가는 것을 선택해 주세요. | Memory responds before thought. Choose what draws you first. |
| cta.deep | 광고 보고 심화 내용 보기 | Watch an ad to reveal deeper memories |
| cta.guide | 광고 보고 현생 가이드 보기 | Watch an ad to view your present-life guide |

## 11 UI UX 디자인 가이드

### 11 1 시각 방향

전체 콘셉트는 조용히 잊힌 기억을 발견하는 기록형 경험이다. 기록, 조용함, 여백, 발견을 핵심 키워드로 사용한다.

| 영역 | 기준 |
| --- | --- |
| 색 | 짙은 네이비 또는 차콜을 기본으로 하고 은은한 금색 또는 청록 한 가지를 포인트로 사용 |
| 타이포그래피 | 가독성 높은 산세리프 기본. 결과 제목에만 제한적으로 개성 있는 서체 사용 |
| 레이아웃 | 한 화면에 하나의 메시지, 넓은 여백, 짧은 스크롤, 단일 주요 CTA |
| 컴포넌트 | 기록 카드, 단계 진행 바, 단순 아이콘, 44pt 이상의 터치 영역 |
| 모션 | 짧은 페이드와 소폭 슬라이드. 장식적 회전, 번쩍임, 긴 대기 연출 금지 |
| 이미지 | 감성적이고 과장되지 않은 시네마틱 역사 일러스트 |
| 접근성 | 텍스트 대비 WCAG AA, 글자 확대, 스크린리더 레이블, 모션 감소 설정 지원 |

### 11 2 핵심 문구

| 위치 | 문구 |
| --- | --- |
| 시작 | 내 전생 찾아보기 |
| 안내 | 기억은 생각보다 먼저 반응합니다. 너무 오래 고민하지 말고, 가장 먼저 마음이 가는 것을 선택해 주세요. |
| 분석 | 당신의 전생 기록을 복원하고 있습니다 |
| 심화 CTA | 광고 보고 심화 내용 보기 |
| 가이드 CTA | 광고 보고 현생 가이드 보기 |
| 이미지 생성 상태 | AI로 전생 대표 이미지를 만들고 있습니다 |
| 로그인 | 로그인하고 나의 전생 목록 생성하기 |
| 종료 | 저장 없이 종료하기 |

## 12 화면 명세

| ID | 화면 | 핵심 요소 | API | 다음 |
| --- | --- | --- | --- | --- |
| SCR 001 | 시작 | 브랜드, 카피, 내 전생 찾아보기 | POST /sessions | SCR 002 |
| SCR 002 | 직감 안내 | 안내 문구, 질문 시작하기 | 없음 | SCR 101 |
| SCR 101 106 | 질문 1 6 | 단계, 질문, 선택지 6개 | GET question, POST answer | 다음 질문 또는 SCR 200 |
| SCR 200 | 분석 | 복원 연출, AI 대표 이미지 자동 생성, 오류 재시도 | POST complete, GET status | AD 1 |
| SCR 300 | 기본 결과 | 대표 이미지, 7개 블록, 심화 CTA | GET basic | AD 2 또는 공유 |
| SCR 310 | 심화 결과 | 보너스 4개, 가이드 CTA | GET deep | AD 3 |
| SCR 320 | 현생 가이드 | 가이드 4개, 자동 생성된 대표 이미지와 저장 CTA | GET guide | SCR 400 |
| SCR 330 | AI 이미지 | 별도 선택 화면 없이 SCR 200의 결과 상태 조회에 통합 | GET status | SCR 300 |
| SCR 400 | 저장 선택 | 로그인 저장, 저장 없이 종료 | POST auth google | SCR 410 또는 종료 |
| SCR 410 | 나의 전생 | 기록 목록, 다시 보기 | GET archives | SCR 420 |
| SCR 420 | 아카이브 상세 | 저장된 결과, 이미지, 공유 | GET archive detail | SCR 410 |

## 13 상태 모델

| 상태 | 진입 조건 | 허용 동작 | 종료 조건 |
| --- | --- | --- | --- |
| CREATED | 세션 생성 | 안내 시작 | QUESTION_IN_PROGRESS |
| QUESTION_IN_PROGRESS | 첫 질문 로드 | 응답 저장과 이전 응답 수정 | 6개 응답 완료 |
| QUESTION_COMPLETE | 6개 응답 잠금 | 결과 계산 요청 | CALCULATING |
| CALCULATING | complete 수락 | 상태 조회 | NARRATIVE_GENERATING 또는 FAILED |
| NARRATIVE_GENERATING | resultCore 확정 | 상태 조회 | RESULT_READY |
| RESULT_READY | 기본 결과 준비 | AD 1 완료 | BASIC_UNLOCKED |
| BASIC_UNLOCKED | AD 1 해금 | 기본 열람, AD 2 | DEEP_UNLOCKED |
| DEEP_UNLOCKED | AD 2 해금 | 심화 열람, AD 3 | GUIDE_UNLOCKED |
| GUIDE_UNLOCKED | AD 3 해금 | 가이드, 이미지, 저장 공유 | COMPLETED 또는 ARCHIVED |
| IMAGE_GENERATING | 저장 이미지가 없는 결과의 최초 상태 조회 | 동일 resultId 상태 재조회 | IMAGE_READY 또는 IMAGE_FAILED |
| ARCHIVED | 로그인 후 저장 | 재열람, 공유, 삭제 | 사용자 삭제 |
| FAILED | 복구 불가 오류 | 같은 resultId로 재시도 | 이전 정상 상태 또는 취소 |

## 14 데이터 모델

| 테이블 | 핵심 필드 | 목적 |
| --- | --- | --- |
| content_versions | id, version, status, published_at | 판정과 콘텐츠 버전 |
| questions | id, stage, translation_key, weight_profile, status | 36개 질문 |
| choices | id, question_id, translation_key, display_order | 216개 선택지 |
| tags | id, code, group | 18개 핵심 태그 |
| choice_tag_scores | choice_id, tag_id, score | 선택지 태그 점수 |
| choice_axis_scores | choice_id, axis_code, score | 보조 축 점수 |
| eras | id, code, year_start, year_end, translation_key | 시대 |
| regions | id, code, translation_key | 권역 |
| historical_locations | id, era_id, region_id, historical_name_key, present_context_key | 역사적 국가와 문명권 |
| social_classes | id, code, translation_key | 신분 |
| occupations | id, class_id, translation_key, prompt_tags | 직업 |
| occupation_rules | occupation_id, era_id, location_id, min_scores, exclusions | 직업 호환 |
| personalities | id, translation_key, tag_rules | 성격 |
| relationships | id, translation_key, tag_rules, exclusions | 인연 |
| life_events | id, translation_key, era_rules, location_rules, tag_rules | 사건 |
| last_memories | id, place_key, companion_key, emotion_key, regret_key | 마지막 기억 |
| bonus_blocks | id, bonus_type, translation_key, tag_rules | 심화 4종 |
| present_life_guides | id, guide_type, translation_key, tag_rules | 현생 가이드 |
| translations | locale, key, text, status, version | 다국어 |
| sessions | id, anonymous_id, locale, seed, content_version, status, expires_at | 비회원 세션 |
| session_answers | session_id, stage, question_id, choice_id, answered_at | 6개 응답 |
| results | id, session_id, answer_hash, record_no, core_json, status | 확정 결과 |
| result_texts | result_id, locale, blocks_json, generator_version | 결과 문장 |
| result_images | result_id, source_type, storage_url, prompt_hash, status | 라이브러리 또는 AI 이미지 |
| ad_events | id, session_id, slot, provider_event_id, status, occurred_at | 광고 이벤트 |
| session_unlocks | session_id, unlock_type, ad_event_id, unlocked_at | 해금 상태 |
| users | id, provider, provider_subject, email, created_at, last_login_at | 로그인 사용자 |
| user_archives | id, user_id, result_id, snapshot_json, saved_at | 나의 전생 |
| admin_users | id, role, status | 관리자 권한 |
| audit_logs | id, admin_id, action, entity, before_json, after_json | 변경 이력 |

### 14 1 제약과 인덱스

- session_answers는 session_id와 stage를 유일 키로 사용한다.

- results.answer_hash와 content_version 조합을 인덱싱한다.

- session_unlocks는 session_id와 unlock_type을 유일 키로 사용한다.

- user_archives는 user_id와 result_id를 유일 키로 사용한다.

- ad_events.provider_event_id는 중복 콜백 방지를 위해 유일해야 한다.

- published 콘텐츠는 직접 수정하지 않고 새 content_version으로 게시한다.

## 15 API 명세

| 메서드 | 경로 | 목적 | 응답 |
| --- | --- | --- | --- |
| POST | /api/v1/sessions | 익명 세션과 seed 생성 | 201 sessionId |
| GET | /api/v1/sessions/{id}/questions/{stage} | 단계 질문과 선택지 6개 | 200 question |
| PUT | /api/v1/sessions/{id}/answers/{stage} | 선택 저장 또는 확정 전 수정 | 200 progress |
| POST | /api/v1/sessions/{id}/complete | 응답 잠금과 결과 계산 | 202 resultId |
| GET | /api/v1/results/{id}/status | 결과 상태 조회와 결과별 대표 이미지 1장 생성 보장 | 200 status |
| POST | /api/v1/sessions/{id}/ads/{slot}/complete | 검증된 광고 완료 기록 | 200 unlock |
| GET | /api/v1/results/{id}/basic | 기본 결과 7개 | 200 or 403 |
| GET | /api/v1/results/{id}/deep | 심화 결과 4개 | 200 or 403 |
| GET | /api/v1/results/{id}/guide | 현생 가이드 4개 | 200 or 403 |
| GET | /api/v1/results/{id}/share-card | 공유 카드 URL 또는 파일 | 200 asset |
| POST | /api/v1/auth/google | Google ID 토큰 검증과 계정 연결 | 200 access session |
| POST | /api/v1/me/archives | 결과 중복 없이 저장 | 201 or 200 existing |
| GET | /api/v1/me/archives | 나의 전생 목록 | 200 paged list |
| GET | /api/v1/me/archives/{id} | 아카이브 상세 | 200 snapshot |
| DELETE | /api/v1/me/archives/{id} | 개별 기록 삭제 | 204 |

### 15 1 공통 오류

| 코드 | HTTP | 처리 |
| --- | --- | --- |
| VALIDATION_ERROR | 400 | 필드별 메시지 표시 |
| SESSION_EXPIRED | 410 | 저장된 resultId가 있으면 결과 복구, 없으면 새 세션 제안 |
| INVALID_STATE | 409 | 서버 상태 재조회 후 올바른 화면으로 이동 |
| UNLOCK_REQUIRED | 403 | 해당 광고 CTA 표시 |
| AD_NOT_VERIFIED | 409 | 광고 상태 재확인 또는 재시도 |
| RESULT_NOT_READY | 425 | 지수 백오프로 상태 재조회 |
| RATE_LIMITED | 429 | 재시도 가능 시각 표시 |
| GENERATION_FAILED | 502 | DB 기본 문장 또는 라이브러리 이미지로 대체 |

## 16 예외 처리

| 상황 | 필수 처리 |
| --- | --- |
| 네트워크 단절 중 질문 | 로컬 큐에 stage와 choiceId를 저장하고 연결 후 순서대로 동기화 |
| complete 중 재시도 | 멱등 키 sessionId를 사용해 같은 resultId 반환 |
| 앱 종료 후 재진입 | 마지막 서버 상태와 resultId를 조회해 해당 화면 복구 |
| 광고 로드 실패 | 짧은 오류 안내, 재시도, resultId 유지. 운영 설정에 따른 grace unlock은 서버만 결정 |
| 광고 시청 중 앱 백그라운드 | 광고 SDK 완료 검증 전까지 잠금 유지 |
| AI 문장 실패 | 1회 재시도 후 DB 템플릿으로 대체 |
| AI 이미지 실패 | 1회 재시도 후 라이브러리 이미지 유지 |
| Google 로그인 취소 | 결과 화면으로 복귀하고 저장 선택 다시 제공 |
| 아카이브 중복 저장 | 기존 archiveId를 성공 응답으로 반환 |
| 번역 누락 | 영어 fallback 후 관리자 경고 이벤트 기록 |

## 17 관리자 기능

| 영역 | 기능 | 권한 |
| --- | --- | --- |
| 질문 선택지 | 36문항과 216선택지 등록 수정, 순서, 미리 보기 | 콘텐츠 관리자 |
| 태그 판정 | 태그 점수, 보조 축, 단계 가중치, 호환 규칙 | 슈퍼 관리자 |
| 콘텐츠 DB | 시대, 위치, 신분, 직업, 성격, 인연, 사건, 마지막 기억 | 콘텐츠 관리자 |
| 현생 가이드 | 가이드 블록과 tag rule 관리 | 콘텐츠 관리자 |
| 다국어 | locale별 초안 검수 게시, 누락 검사 | 콘텐츠 관리자 |
| 시뮬레이터 | 6개 선택 입력 후 점수, 필터, 최종 결과 미리 보기 | 콘텐츠 관리자 이상 |
| 사용자 | 이메일, 가입일, 최근 로그인, 저장 기록 수 조회 | 운영 관리자 |
| 통계 | 완료율, 광고 완료율, 저장 공유, 결과 분포, 실패율 | 운영 관리자 |
| 버전 | 초안 복제, 검증, 게시, 롤백 | 슈퍼 관리자 |
| 감사 로그 | 누가 무엇을 언제 변경했는지 조회 | 슈퍼 관리자 |

### 17 1 게시 전 검증

- 각 단계에 활성 질문이 정확히 6개인지 확인한다.

- 각 활성 질문에 활성 선택지가 정확히 6개인지 확인한다.

- 모든 선택지에 핵심 태그 2개 이상과 보조 축 값이 있는지 확인한다.

- 모든 published translationKey에 필수 locale 번역이 있는지 확인한다.

- 시대와 위치, 직업과 신분, 사건과 위치의 호환 규칙에서 고립 후보가 없는지 확인한다.

- 최소 10,000회 시뮬레이션에서 결과 분포, 동일 결과 과다, 불가능 조합을 보고한다.

## 18 개인정보 보안 운영

- 비회원 세션은 무작위 anonymousId를 사용하며 광고 식별자와 결과 내용을 직접 결합하지 않는다.

- Google 비밀번호와 장기 provider token을 저장하지 않는다. ID 토큰을 검증한 뒤 내부 세션을 발급한다.

- 이메일은 계정 식별과 고객 지원에 필요한 범위에서만 저장한다.

- 관리자 권한은 역할 기반으로 분리하고 판정 규칙 변경은 감사 로그에 남긴다.

- 저장 URL은 비공개 객체 저장소와 시간 제한 서명 URL을 사용한다.

- 로그에는 질문 원문, 이메일, 인증 토큰을 함께 기록하지 않는다.

- 세션, 이미지, 아카이브의 보관 기간과 삭제 정책을 개인정보 처리방침에 명시한다.

## 19 분석 이벤트

| 이벤트 | 속성 |
| --- | --- |
| app_open | locale, app_version |
| start_tap | session_id |
| question_view | stage, question_id |
| choice_selected | stage, question_id, choice_id |
| question_complete | duration_ms |
| result_requested | content_version |
| result_ready | latency_ms, fallback_used |
| ad_offer | slot |
| ad_complete | slot, provider |
| ad_failed | slot, error_code |
| section_view | basic, deep, guide |
| image_requested | result_id |
| image_ready | latency_ms, retry_count |
| save_offer | result_id |
| login_result | success, cancel, error |
| archive_saved | existing |
| share_complete | asset_type |

## 20 구현 순서

1. 스키마와 콘텐츠 버전, 36문항과 216선택지 seed 데이터를 구현한다.

2. 태그 점수 엔진, 호환 필터, 결정적 시드와 시뮬레이터를 구현한다.

3. 익명 세션, 질문 저장, resultCore 스냅샷 API를 구현한다.

4. 시작, 안내, 6단계 질문, 분석, 기본 결과 화면을 구현한다.

5. 광고 이벤트 검증과 세 단계 unlock을 구현한다.

6. 심화 결과, 현생 가이드, 공유 카드와 기기 저장을 구현한다.

7. Google 로그인, 아카이브, 중복 저장과 삭제를 구현한다.

8. AI 문장과 이미지 생성, 재시도와 fallback을 구현한다.

9. 관리자 콘텐츠, 번역, 판정 규칙, 시뮬레이터, 통계를 구현한다.

10. 분포, 접근성, 개인정보, 광고, 복구 시나리오를 검증하고 출시한다.

## 21 출시 완료 기준

| 영역 | 완료 기준 |
| --- | --- |
| 질문 | 6단계마다 질문 1개와 선택지 6개가 표시되고 6개 응답이 서버에 정확히 저장된다. |
| 판정 | 같은 응답과 콘텐츠 버전은 반복 호출에서도 같은 resultCore와 기록 번호를 반환한다. |
| 호환 | 시대, 역사적 위치, 직업, 복식, 사건에 불가능 조합이 없다. |
| 결과 | 기본 7개, 심화 4개, 가이드 4개가 정해진 광고 unlock 뒤에만 열린다. |
| 광고 | 완료, 취소, 실패, 중복 콜백에서 unlock 상태가 정확하다. |
| 복구 | 앱 종료, 네트워크 단절, complete 재시도 후 같은 resultId로 복구된다. |
| 이미지 | 최초 결과 상태 조회에서 AI 이미지가 low 품질로 최대 1장 생성되고, 실패 시 라이브러리 이미지로 대체되며 재방문 때 재생성하지 않는다. |
| 계정 | 로그인 취소 시 결과가 유지되고 같은 결과가 중복 저장되지 않는다. |
| 다국어 | 필수 locale에 누락 키가 없고 긴 문자열에서도 레이아웃이 깨지지 않는다. |
| 접근성 | 핵심 흐름이 스크린리더와 글자 확대, 모션 감소 설정에서 사용 가능하다. |
| 관리자 | 콘텐츠 수정, 검증, 미리 보기, 게시, 롤백과 감사 로그가 동작한다. |

## 22 핵심 테스트 시나리오

| ID | 시나리오 | 기대 결과 |
| --- | --- | --- |
| T01 | 비회원으로 6단계 완료 | 로그인 없이 기본 결과 준비 |
| T02 | AD 1 완료 콜백 중복 | 기본 unlock 1개만 생성 |
| T03 | AD 2 중간 취소 | 심화 잠금 유지, 기본 결과 유지 |
| T04 | AD 3 서버 실패 | resultId 유지, 재시도 표시 |
| T05 | complete 요청 3회 | 동일 resultId 반환 |
| T06 | AI 문장 API 실패 | DB 템플릿으로 전체 결과 표시 |
| T07 | AI 이미지 API 실패 | 기본 이미지와 저장 공유 유지 |
| T08 | Google 로그인 취소 | 결과 화면 복귀, 재선택 가능 |
| T09 | 같은 결과 두 번 저장 | 기존 archiveId 반환 |
| T10 | 번역 키 누락 | 영어 fallback과 관리자 경고 |
| T11 | 게시 버전 변경 후 과거 기록 열람 | 저장 당시 스냅샷 유지 |
| T12 | 극단 점수 조합 | 후보 없음 없이 fallback hierarchy로 결과 생성 |

## 부록 A 36문항 후보와 216선택지

다음 문항은 단계별 활성 후보 6개로 구성한다. 각 문항은 선택지 6개를 가지며 괄호 안은 구현용 핵심 태그와 예시 점수다. 실제 점수는 관리자와 시뮬레이션으로 조정하되 ID는 변경하지 않는다.

### A 1단계 본능적 선택

#### Q1_01 눈을 떠보니 낯선 장소에 서 있습니다. 가장 먼저 어디로 향하고 싶나요?

| 선택지 ID | 선택지와 예시 점수 |
| --- | --- |
| Q1_01_C1 | 오래된 골목길 (knowledge+2, connection+1, urbanity+2) |
| Q1_01_C2 | 끝없이 펼쳐진 바다 (freedom+3, adventure+2, mobility+2) |
| Q1_01_C3 | 깊은 숲 (calm+2, survival+2, urbanity-2) |
| Q1_01_C4 | 높은 산길 (independence+2, courage+2, risk+1) |
| Q1_01_C5 | 사람들이 모인 광장 (connection+3, achievement+1, urbanity+2) |
| Q1_01_C6 | 희미한 불빛이 보이는 집 (stability+3, protection+2, mobility-1) |

#### Q1_02 멀리서 하나의 소리가 들립니다. 가장 먼저 끌리는 소리는 무엇인가요?

| 선택지 ID | 선택지와 예시 점수 |
| --- | --- |
| Q1_02_C1 | 파도가 바위에 부딪히는 소리 (freedom+2, adventure+2) |
| Q1_02_C2 | 시장 사람들의 웅성거림 (connection+2, achievement+1) |
| Q1_02_C3 | 종이나 목탁이 울리는 소리 (spirituality+3, calm+2) |
| Q1_02_C4 | 말발굽과 수레가 지나가는 소리 (mobility+2, survival+1) |
| Q1_02_C5 | 망치로 금속을 두드리는 소리 (creativity+2, achievement+2) |
| Q1_02_C6 | 장작불이 타는 소리 (stability+2, protection+2) |

#### Q1_03 손에 하나의 물건이 쥐어져 있습니다. 무엇이 가장 익숙하게 느껴지나요?

| 선택지 ID | 선택지와 예시 점수 |
| --- | --- |
| Q1_03_C1 | 낡은 지도 (knowledge+3, adventure+1) |
| Q1_03_C2 | 작은 열쇠 (independence+2, longing+2) |
| Q1_03_C3 | 반듯한 붓과 먹 (knowledge+2, creativity+2) |
| Q1_03_C4 | 짧은 칼 (courage+2, survival+2) |
| Q1_03_C5 | 바늘과 실 (creativity+2, devotion+2) |
| Q1_03_C6 | 씨앗이 든 주머니 (stability+2, protection+2) |

#### Q1_04 봄, 여름, 가을, 겨울 중 어느 길로 가고 싶나요?

| 선택지 ID | 선택지와 예시 점수 |
| --- | --- |
| Q1_04_C1 | 꽃이 막 피는 봄 (connection+2, longing+1) |
| Q1_04_C2 | 빛이 강한 여름 (achievement+2, courage+1) |
| Q1_04_C3 | 바람이 선선한 가을 (calm+2, knowledge+1) |
| Q1_04_C4 | 눈이 깊게 쌓인 겨울 (survival+2, independence+2) |
| Q1_04_C5 | 비가 내리는 때 (empathy+2, regret+1) |
| Q1_04_C6 | 계절이 느껴지지 않는 실내 (stability+2, urbanity+1) |

#### Q1_05 낯선 길에서 잠시 쉴 곳을 골라야 합니다. 어디가 가장 편한가요?

| 선택지 ID | 선택지와 예시 점수 |
| --- | --- |
| Q1_05_C1 | 성벽 안의 작은 방 (stability+2, authority+1) |
| Q1_05_C2 | 강가의 나무집 (calm+2, protection+1) |
| Q1_05_C3 | 항구의 여관 (adventure+2, connection+1) |
| Q1_05_C4 | 산사의 빈 방 (spirituality+3, calm+1) |
| Q1_05_C5 | 공방 한쪽의 침상 (creativity+3, achievement+1) |
| Q1_05_C6 | 들판의 천막 (freedom+2, survival+2) |

#### Q1_06 새벽빛 속에서 한 가지 풍경만 선명하게 보입니다. 무엇인가요?

| 선택지 ID | 선택지와 예시 점수 |
| --- | --- |
| Q1_06_C1 | 도시의 지붕들 (urbanity+2, achievement+2) |
| Q1_06_C2 | 논과 밭의 물결 (stability+2, protection+1) |
| Q1_06_C3 | 사막의 긴 길 (survival+2, spirituality+1) |
| Q1_06_C4 | 눈 덮인 초원 (freedom+2, mobility+2) |
| Q1_06_C5 | 커다란 강과 배 (adventure+2, connection+1) |
| Q1_06_C6 | 돌로 지은 궁전 (honor+2, authority+2) |

### A 2단계 인연의 기억

#### Q2_01 오래 찾던 사람을 만났습니다. 가장 먼저 어떤 기분이 드나요?

| 선택지 ID | 선택지와 예시 점수 |
| --- | --- |
| Q2_01_C1 | 안도 (stability+2, connection+2) |
| Q2_01_C2 | 그리움 (longing+3, devotion+1) |
| Q2_01_C3 | 미안함 (regret+3, empathy+1) |
| Q2_01_C4 | 경계심 (survival+2, independence+1) |
| Q2_01_C5 | 벅찬 기쁨 (connection+3, devotion+1) |
| Q2_01_C6 | 마음이 편안해지는 느낌 (calm+3, spirituality+1) |

#### Q2_02 누군가가 위험에 처했습니다. 당신은 어떻게 하나요?

| 선택지 ID | 선택지와 예시 점수 |
| --- | --- |
| Q2_02_C1 | 생각하기 전에 몸을 던진다 (courage+3, protection+2) |
| Q2_02_C2 | 주변 사람을 모아 함께 돕는다 (connection+2, protection+2) |
| Q2_02_C3 | 가장 안전한 방법부터 찾는다 (stability+2, knowledge+1) |
| Q2_02_C4 | 멀리서 상황을 읽고 길을 만든다 (knowledge+2, independence+1) |
| Q2_02_C5 | 내가 대신 책임지겠다고 한다 (devotion+3, honor+1) |
| Q2_02_C6 | 상대가 스스로 나올 수 있도록 손을 내민다 (empathy+3, freedom+1) |

#### Q2_03 가장 소중한 사람이 먼 길을 떠나려 합니다. 당신의 선택은 무엇인가요?

| 선택지 ID | 선택지와 예시 점수 |
| --- | --- |
| Q2_03_C1 | 함께 떠난다 (devotion+3, adventure+1) |
| Q2_03_C2 | 돌아올 곳을 지킨다 (stability+3, protection+2) |
| Q2_03_C3 | 떠나지 말라고 붙잡는다 (connection+2, longing+2) |
| Q2_03_C4 | 말없이 필요한 것을 챙겨준다 (empathy+2, devotion+2) |
| Q2_03_C5 | 각자의 길을 존중한다 (freedom+3, independence+2) |
| Q2_03_C6 | 나중에 만날 약속을 기록한다 (knowledge+1, longing+2) |

#### Q2_04 많은 사람 사이에서 유독 눈에 들어오는 사람은 누구인가요?

| 선택지 ID | 선택지와 예시 점수 |
| --- | --- |
| Q2_04_C1 | 말없이 주변을 돌보는 사람 (protection+2, empathy+2) |
| Q2_04_C2 | 모두를 이끄는 사람 (honor+2, authority+2) |
| Q2_04_C3 | 혼자 기록을 읽는 사람 (knowledge+3, independence+1) |
| Q2_04_C4 | 낯선 이야기를 들려주는 여행자 (adventure+2, freedom+2) |
| Q2_04_C5 | 손으로 무언가를 만드는 사람 (creativity+3, calm+1) |
| Q2_04_C6 | 슬픔을 숨기고 웃는 사람 (empathy+3, regret+1) |

#### Q2_05 갈등이 생겼을 때 가장 먼저 지키고 싶은 것은 무엇인가요?

| 선택지 ID | 선택지와 예시 점수 |
| --- | --- |
| Q2_05_C1 | 서로의 믿음 (devotion+2, honor+2) |
| Q2_05_C2 | 가족과 공동체 (protection+3, collectivism+2) |
| Q2_05_C3 | 내 선택의 자유 (freedom+3, independence+2) |
| Q2_05_C4 | 약속과 원칙 (honor+3, stability+1) |
| Q2_05_C5 | 상대의 마음 (empathy+3, connection+1) |
| Q2_05_C6 | 사실과 기록 (knowledge+3, achievement+1) |

#### Q2_06 누군가 비밀을 말해 줍니다. 어떻게 지킬 건가요?

| 선택지 ID | 선택지와 예시 점수 |
| --- | --- |
| Q2_06_C1 | 평생 말하지 않는다 (devotion+3, honor+2) |
| Q2_06_C2 | 기록하되 누구도 찾지 못하게 한다 (knowledge+2, independence+1) |
| Q2_06_C3 | 위험해지면 진실을 밝힌다 (courage+2, protection+2) |
| Q2_06_C4 | 상대가 다시 선택할 때까지 기다린다 (empathy+2, calm+2) |
| Q2_06_C5 | 함께 책임질 사람 한 명에게만 말한다 (connection+2, stability+1) |
| Q2_06_C6 | 비밀이 사람을 해치면 약속을 깨더라도 막는다 (protection+3, courage+1) |

### A 3단계 삶의 욕망

#### Q3_01 무엇이든 하나를 얻을 수 있다면 무엇을 원하나요?

| 선택지 ID | 선택지와 예시 점수 |
| --- | --- |
| Q3_01_C1 | 누구에게도 얽매이지 않는 자유 (freedom+3, independence+2) |
| Q3_01_C2 | 오래 지속되는 사랑 (connection+3, devotion+2) |
| Q3_01_C3 | 세상에 남을 명예 (honor+3, achievement+2) |
| Q3_01_C4 | 감춰진 지식 (knowledge+3, spirituality+1) |
| Q3_01_C5 | 가족을 지킬 풍요 (stability+3, protection+2) |
| Q3_01_C6 | 새로운 세계를 만날 기회 (adventure+3, mobility+2) |

#### Q3_02 사람들이 당신을 어떻게 기억하면 좋겠나요?

| 선택지 ID | 선택지와 예시 점수 |
| --- | --- |
| Q3_02_C1 | 사람들을 지킨 이름 (protection+3, honor+1) |
| Q3_02_C2 | 새 길을 연 이름 (adventure+2, achievement+2) |
| Q3_02_C3 | 아름다운 것을 만든 이름 (creativity+3, achievement+1) |
| Q3_02_C4 | 지혜를 전한 이름 (knowledge+3, devotion+1) |
| Q3_02_C5 | 큰 권한을 가졌던 이름 (honor+2, authority+3) |
| Q3_02_C6 | 아무 기록 없이 자유롭게 살다 간 이름 (freedom+3, independence+2) |

#### Q3_03 하루를 온전히 쓸 수 있다면 무엇을 하고 싶나요?

| 선택지 ID | 선택지와 예시 점수 |
| --- | --- |
| Q3_03_C1 | 새로운 기술을 익힌다 (knowledge+2, achievement+2) |
| Q3_03_C2 | 사람들과 잔치를 연다 (connection+3, collectivism+1) |
| Q3_03_C3 | 혼자 먼 곳까지 걷는다 (freedom+2, calm+2) |
| Q3_03_C4 | 가족의 집을 고친다 (protection+2, stability+2) |
| Q3_03_C5 | 기도하거나 명상한다 (spirituality+3, calm+2) |
| Q3_03_C6 | 아무도 해보지 않은 일을 시도한다 (adventure+3, creativity+1) |

#### Q3_04 당신에게 가장 큰 힘이 되는 것은 무엇인가요?

| 선택지 ID | 선택지와 예시 점수 |
| --- | --- |
| Q3_04_C1 | 사람들의 신뢰 (honor+2, connection+2) |
| Q3_04_C2 | 쌓아온 기술 (achievement+2, creativity+2) |
| Q3_04_C3 | 내가 가진 지식 (knowledge+3, independence+1) |
| Q3_04_C4 | 위기에서 버틴 경험 (survival+3, courage+1) |
| Q3_04_C5 | 믿음과 기도 (spirituality+3, devotion+1) |
| Q3_04_C6 | 선택할 수 있다는 감각 (freedom+3, independence+2) |

#### Q3_05 많은 돈과 물건을 맡게 된다면 어디에 먼저 쓰나요?

| 선택지 ID | 선택지와 예시 점수 |
| --- | --- |
| Q3_05_C1 | 가족과 마을의 안전 (protection+3, collectivism+2) |
| Q3_05_C2 | 학교와 기록 보관소 (knowledge+3, achievement+1) |
| Q3_05_C3 | 길과 배를 만드는 일 (adventure+2, achievement+2) |
| Q3_05_C4 | 예술과 축제 (creativity+3, connection+1) |
| Q3_05_C5 | 군대와 성벽 (survival+2, authority+2) |
| Q3_05_C6 | 굶주린 사람을 돕는 일 (empathy+3, devotion+1) |

#### Q3_06 어떤 삶이 가장 힘들 것 같나요?

| 선택지 ID | 선택지와 예시 점수 |
| --- | --- |
| Q3_06_C1 | 선택권이 없는 삶 (freedom+3, authority-2) |
| Q3_06_C2 | 사랑하는 이를 지키지 못하는 삶 (protection+3, regret+1) |
| Q3_06_C3 | 아무것도 배우지 못하는 삶 (knowledge+3, achievement+1) |
| Q3_06_C4 | 아무도 나를 기억하지 않는 삶 (honor+2, connection+2) |
| Q3_06_C5 | 계속 불안한 삶 (stability+3, survival+1) |
| Q3_06_C6 | 만든 것을 세상에 남기지 못하는 삶 (creativity+3, longing+1) |

### A 4단계 운명의 갈림길

#### Q4_01 지키던 것이 위협받을 때 어떻게 하나요?

| 선택지 ID | 선택지와 예시 점수 |
| --- | --- |
| Q4_01_C1 | 앞에 서서 맞선다 (courage+3, honor+2) |
| Q4_01_C2 | 사람들을 먼저 피신시킨다 (protection+3, collectivism+1) |
| Q4_01_C3 | 협상할 방법을 찾는다 (knowledge+2, connection+2) |
| Q4_01_C4 | 상대의 약점을 관찰한다 (survival+2, independence+1) |
| Q4_01_C5 | 중요한 것만 챙겨 떠난다 (freedom+2, mobility+2) |
| Q4_01_C6 | 끝까지 자리를 지킨다 (devotion+3, stability+2) |

#### Q4_02 두 길 중 하나를 골라야 합니다. 무엇을 기준으로 고르나요?

| 선택지 ID | 선택지와 예시 점수 |
| --- | --- |
| Q4_02_C1 | 오래 지켜온 약속 (devotion+3, honor+2) |
| Q4_02_C2 | 새롭게 열린 기회 (adventure+3, achievement+1) |
| Q4_02_C3 | 가족의 필요 (protection+3, stability+1) |
| Q4_02_C4 | 내 안의 직감 (independence+3, spirituality+1) |
| Q4_02_C5 | 가장 많은 사람에게 도움이 되는 길 (empathy+2, collectivism+2) |
| Q4_02_C6 | 사실과 증거가 가리키는 길 (knowledge+3, calm+1) |

#### Q4_03 큰 실수를 한 뒤 가장 먼저 무엇을 하나요?

| 선택지 ID | 선택지와 예시 점수 |
| --- | --- |
| Q4_03_C1 | 원인을 기록하고 다시 시도한다 (achievement+3, knowledge+2) |
| Q4_03_C2 | 혼자 멀리 떠나 마음을 정리한다 (freedom+2, calm+2) |
| Q4_03_C3 | 함께한 사람을 먼저 돌본다 (empathy+3, protection+1) |
| Q4_03_C4 | 실패를 감추고 버틴다 (survival+2, regret+1) |
| Q4_03_C5 | 새로운 방식으로 바꾼다 (creativity+3, courage+1) |
| Q4_03_C6 | 어쩔 수 없는 일로 받아들이고 기도한다 (spirituality+2, calm+2) |

#### Q4_04 권력자가 부당한 명령을 내립니다. 당신은 어떻게 하나요?

| 선택지 ID | 선택지와 예시 점수 |
| --- | --- |
| Q4_04_C1 | 공개적으로 거부한다 (courage+3, freedom+2) |
| Q4_04_C2 | 조용히 명령을 바꿀 방법을 찾는다 (knowledge+2, protection+1) |
| Q4_04_C3 | 사람들을 데리고 떠난다 (freedom+2, protection+2) |
| Q4_04_C4 | 피해를 줄이기 위해 일단 따른다 (survival+2, stability+1) |
| Q4_04_C5 | 다른 권력자와 연대한다 (connection+2, authority+1) |
| Q4_04_C6 | 기록을 남겨 훗날 진실을 밝힌다 (knowledge+3, honor+1) |

#### Q4_05 낯선 이가 도움을 청하지만 위험할 수 있습니다. 어떻게 하나요?

| 선택지 ID | 선택지와 예시 점수 |
| --- | --- |
| Q4_05_C1 | 조건 없이 돕는다 (empathy+3, courage+1) |
| Q4_05_C2 | 안전한 장소와 음식을 건넨다 (protection+2, stability+2) |
| Q4_05_C3 | 먼저 정체를 확인한다 (knowledge+2, survival+1) |
| Q4_05_C4 | 다른 사람과 함께 돕는다 (connection+2, collectivism+2) |
| Q4_05_C5 | 위험하면 거절한다 (independence+2, survival+2) |
| Q4_05_C6 | 길만 알려주고 떠난다 (freedom+1, calm+1) |

#### Q4_06 내가 잘되는 동안 누군가 피해를 봤습니다. 어떻게 하나요?

| 선택지 ID | 선택지와 예시 점수 |
| --- | --- |
| Q4_06_C1 | 모든 것을 내려놓고 사과한다 (regret+3, empathy+2) |
| Q4_06_C2 | 피해를 되돌릴 방법을 찾는다 (protection+2, achievement+1) |
| Q4_06_C3 | 진실을 공개한다 (honor+3, courage+1) |
| Q4_06_C4 | 당시에는 어쩔 수 없었다고 받아들인다 (survival+2, calm+1) |
| Q4_06_C5 | 앞으로 같은 일이 없도록 규칙을 만든다 (knowledge+2, stability+2) |
| Q4_06_C6 | 내가 가진 것을 나누며 갚는다 (devotion+2, connection+2) |

### A 5단계 마음에 남은 것

#### Q5_01 삶에서 가장 오래 기억하고 싶은 순간은 무엇인가요?

| 선택지 ID | 선택지와 예시 점수 |
| --- | --- |
| Q5_01_C1 | 사랑하는 사람과 웃던 저녁 (connection+3, calm+2) |
| Q5_01_C2 | 긴 노력 끝에 완성한 작품 (creativity+3, achievement+2) |
| Q5_01_C3 | 위험에서 모두를 구한 순간 (protection+3, courage+1) |
| Q5_01_C4 | 처음 낯선 땅에 닿은 순간 (adventure+3, freedom+1) |
| Q5_01_C5 | 오래 찾던 진실을 깨달은 순간 (knowledge+3, spirituality+1) |
| Q5_01_C6 | 조용히 내 삶을 선택한 순간 (independence+3, calm+1) |

#### Q5_02 돌아갈 수 있다면 바꾸고 싶은 것은 무엇인가요?

| 선택지 ID | 선택지와 예시 점수 |
| --- | --- |
| Q5_02_C1 | 말하지 못한 마음 (regret+3, connection+2) |
| Q5_02_C2 | 지키지 못한 약속 (regret+3, honor+2) |
| Q5_02_C3 | 두려워 포기한 도전 (courage+2, longing+2) |
| Q5_02_C4 | 가족보다 일을 택한 선택 (protection+2, regret+2) |
| Q5_02_C5 | 진실을 너무 늦게 밝힌 일 (knowledge+2, regret+2) |
| Q5_02_C6 | 나 자신을 돌보지 않은 시간 (calm+2, empathy+1) |

#### Q5_03 나중에 사람들이 이어 가면 좋을 것은 무엇인가요?

| 선택지 ID | 선택지와 예시 점수 |
| --- | --- |
| Q5_03_C1 | 사람들이 함께 살 수 있는 터전 (stability+3, protection+2) |
| Q5_03_C2 | 나중 사람들이 읽을 기록 (knowledge+3, honor+1) |
| Q5_03_C3 | 누군가 이어갈 기술 (creativity+2, devotion+2) |
| Q5_03_C4 | 멀리 이어지는 길 (adventure+2, achievement+2) |
| Q5_03_C5 | 마음을 위로하는 노래 (creativity+3, empathy+1) |
| Q5_03_C6 | 어떤 것에도 얽매이지 않은 기억 (freedom+3, independence+1) |

#### Q5_04 무엇을 잃는 일이 가장 슬플 것 같나요?

| 선택지 ID | 선택지와 예시 점수 |
| --- | --- |
| Q5_04_C1 | 가족의 부재 (protection+3, longing+2) |
| Q5_04_C2 | 친구의 배신 (honor+2, regret+2) |
| Q5_04_C3 | 고향을 떠나야 하는 일 (stability+3, mobility-1) |
| Q5_04_C4 | 평생 만든 것이 사라지는 일 (creativity+2, achievement+2) |
| Q5_04_C5 | 믿던 생각이 흔들리는 일 (spirituality+2, regret+2) |
| Q5_04_C6 | 내 이름과 기록이 지워지는 일 (honor+3, knowledge+1) |

#### Q5_05 죽기 전에 꼭 하고 싶은 일은 무엇인가요?

| 선택지 ID | 선택지와 예시 점수 |
| --- | --- |
| Q5_05_C1 | 사랑한다고 말하기 (connection+3, devotion+2) |
| Q5_05_C2 | 멀리 있는 곳을 보기 (adventure+3, freedom+1) |
| Q5_05_C3 | 배운 것을 전하기 (knowledge+3, devotion+1) |
| Q5_05_C4 | 가족이 안전한지 확인하기 (protection+3, stability+2) |
| Q5_05_C5 | 완성하지 못한 것을 마치기 (achievement+3, creativity+1) |
| Q5_05_C6 | 용서하거나 용서받기 (empathy+3, regret+2) |

#### Q5_06 당신의 마음에 가장 오래 남는 한마디는 무엇인가요?

| 선택지 ID | 선택지와 예시 점수 |
| --- | --- |
| Q5_06_C1 | 기다릴게 (longing+3, devotion+1) |
| Q5_06_C2 | 너는 잘못이 없어 (empathy+3, calm+1) |
| Q5_06_C3 | 우리의 이름을 기억해 (honor+2, connection+2) |
| Q5_06_C4 | 두려워도 가야 해 (courage+3, adventure+1) |
| Q5_06_C5 | 이 기록을 지켜줘 (knowledge+2, protection+2) |
| Q5_06_C6 | 이제 자유로워 (freedom+3, calm+2) |

### A 6단계 마지막 기억

#### Q6_01 전생의 마지막 장면을 상상해 보세요. 무엇이 보일까요?

| 선택지 ID | 선택지와 예시 점수 |
| --- | --- |
| Q6_01_C1 | 창밖의 비 (calm+2, regret+1) |
| Q6_01_C2 | 해 질 무렵의 바다 (freedom+2, longing+2) |
| Q6_01_C3 | 사람들이 밝힌 등불 (connection+2, protection+1) |
| Q6_01_C4 | 눈 덮인 산 (independence+2, spirituality+1) |
| Q6_01_C5 | 완성하지 못한 물건 (creativity+2, regret+2) |
| Q6_01_C6 | 누군가의 얼굴 (connection+3, devotion+1) |

#### Q6_02 전생의 마지막 순간을 상상해 보세요. 곁에는 누가 있을까요?

| 선택지 ID | 선택지와 예시 점수 |
| --- | --- |
| Q6_02_C1 | 가족 (protection+3, devotion+2) |
| Q6_02_C2 | 오랜 동료 (connection+2, honor+2) |
| Q6_02_C3 | 사랑했던 사람 (longing+3, connection+2) |
| Q6_02_C4 | 나를 돌보던 낯선 이 (empathy+3, calm+1) |
| Q6_02_C5 | 아무도 없었다 (independence+3, regret+1) |
| Q6_02_C6 | 이름을 모르는 아이 (protection+2, spirituality+2) |

#### Q6_03 전생의 마지막 순간을 상상해 보세요. 어떤 기분이 들까요?

| 선택지 ID | 선택지와 예시 점수 |
| --- | --- |
| Q6_03_C1 | 평온 (calm+3, spirituality+1) |
| Q6_03_C2 | 아쉬움 (regret+3, longing+1) |
| Q6_03_C3 | 사랑 (connection+3, devotion+2) |
| Q6_03_C4 | 두려움 (survival+3, protection+1) |
| Q6_03_C5 | 해방감 (freedom+3, independence+1) |
| Q6_03_C6 | 해냈다는 안도 (achievement+3, honor+1) |

#### Q6_04 전생의 마지막 순간을 상상해 보세요. 손에는 무엇이 닿아 있을까요?

| 선택지 ID | 선택지와 예시 점수 |
| --- | --- |
| Q6_04_C1 | 누군가의 손 (connection+3, devotion+2) |
| Q6_04_C2 | 낡은 책이나 문서 (knowledge+3, honor+1) |
| Q6_04_C3 | 작업 도구 (creativity+3, achievement+1) |
| Q6_04_C4 | 작은 부적이나 기도 도구 (spirituality+3, calm+1) |
| Q6_04_C5 | 흙과 풀 (stability+2, protection+1) |
| Q6_04_C6 | 여행 가방이나 지도 (adventure+2, freedom+2) |

#### Q6_05 전생의 마지막 순간을 상상해 보세요. 어떤 말을 남기고 싶을까요?

| 선택지 ID | 선택지와 예시 점수 |
| --- | --- |
| Q6_05_C1 | 다시 만나자 (longing+3, connection+2) |
| Q6_05_C2 | 내가 지키지 못해 미안하다 (regret+3, protection+2) |
| Q6_05_C3 | 이 일을 이어가 달라 (achievement+2, devotion+2) |
| Q6_05_C4 | 진실을 잊지 말라 (knowledge+3, honor+2) |
| Q6_05_C5 | 나는 내 선택을 후회하지 않는다 (freedom+2, courage+2) |
| Q6_05_C6 | 이제 모두 괜찮다 (calm+3, empathy+1) |

#### Q6_06 전생의 마지막 순간을 상상해 보세요. 어디에 가고 싶을까요?

| 선택지 ID | 선택지와 예시 점수 |
| --- | --- |
| Q6_06_C1 | 태어난 집 (stability+3, protection+2) |
| Q6_06_C2 | 사랑하는 사람이 있는 곳 (connection+3, devotion+2) |
| Q6_06_C3 | 평생 일한 공간 (achievement+2, creativity+2) |
| Q6_06_C4 | 한 번도 가보지 못한 먼 곳 (adventure+3, freedom+2) |
| Q6_06_C5 | 조용한 사원이나 숲 (spirituality+3, calm+2) |
| Q6_06_C6 | 사람들이 모여 있는 광장 (connection+2, honor+1) |

문항 수 검증: 36개. 선택지 수 검증: 216개.

## 부록 B 결과 조립 예시

| 항목 | 예시 값 |
| --- | --- |
| 응답 상위 태그 | knowledge 11, creativity 9, calm 7, connection 5 |
| 보조 축 | urbanity +3, mobility +1, authority -1, risk -2 |
| 시대 | 르네상스 근세 |
| 권역 | 유럽 |
| 역사적 위치 | 베네치아 공화국 |
| 신분과 직업 | 도시 장인 계층, 지도 제작자 |
| 성격 | 탐구적이고 조용한 완성주의자 |
| 인연 | 항해를 떠난 오랜 동료 |
| 사건 | 새 항로의 지도를 완성했지만 정치적 이유로 공개하지 못함 |
| 마지막 기억 | 작업실 창밖의 비, 손에 남은 미완성 지도, 아쉬움 |
| 기록 번호 | 전생 기록 No.07 |

### 기본 결과 표지 예시

전생 기록 No.07

16세기 후반 베네치아 공화국의 지도 제작자

당신은 눈에 보이는 길보다 아직 그려지지 않은 길에 더 오래 마음을 두었습니다. 혼자 몰두하는 시간이 편했지만, 한 사람과 나눈 약속은 삶의 방향을 바꾸었습니다.

## 부록 C Codex 구현 체크리스트

- PRD의 ID, 상태, API 경로, 테이블명을 코드의 단일 소스로 사용한다.

- 핵심 결과 계산을 순수 함수로 구현하고 seed와 contentVersion을 입력으로 받는다.

- 질문과 콘텐츠 seed는 마이그레이션 또는 관리자 import 파일로 관리한다.

- 광고 SDK 콜백만 믿지 말고 서버 측 멱등 이벤트와 unlock을 분리한다.

- AI 공급자 인터페이스를 추상화하고 DB 템플릿과 라이브러리 이미지 fallback을 항상 제공한다.

- 상태 복구 테스트를 화면 테스트와 API 통합 테스트에 포함한다.

- 분포 시뮬레이터를 CI 또는 콘텐츠 게시 검증에 포함한다.

- 출시 빌드에서 테스트 광고 ID와 개발용 관리자 기능이 노출되지 않는지 확인한다.

## 부록 D Codex 개발 착수 기준

이 부록은 제품 요구사항을 실제 저장소와 실행 가능한 코드로 옮길 때 적용할 기준이다. Codex는 본문과 부록 A의 콘텐츠를 모두 읽은 뒤 아래 순서로 구현한다. 제품 흐름, 광고 횟수, 결과 구조, 판정 재현성은 임의로 바꾸지 않는다.

### D 1 기준 기술 스택

새 저장소에서는 아래 스택을 그대로 사용한다. 기존 코드가 있는 저장소에서는 먼저 구조와 의존성을 확인하고, 동일한 요구사항을 만족할 수 있을 때만 기존 스택을 유지한다. 새 라이브러리는 프로젝트 생성 시점의 호환 가능한 안정 버전을 선택하고 lockfile에 고정한다.

| 영역 | 기준 | 교체 조건 |
| --- | --- | --- |
| 저장소 | pnpm workspace 기반 TypeScript 모노레포 | 기존 저장소가 있으면 그 구조를 우선 |
| 모바일 | Expo와 React Native, Expo Router | 플랫폼 네이티브 기능이 막힐 때만 bare workflow 검토 |
| API | NestJS 기반 Node.js API | 기존 API가 있을 때만 기존 구조 유지 |
| 관리자 | Next.js 기반 웹 관리자 | 모바일 앱과 분리 배포 |
| 데이터베이스 | PostgreSQL과 Prisma | 관계, 유일 제약, 버전 스냅샷을 유지해야 함 |
| 객체 저장소 | S3 호환 비공개 저장소와 서명 URL | 공개 버킷 금지 |
| 백그라운드 작업 | Redis 기반 큐와 worker | 초기 로컬 개발은 동기 mock 허용 |
| 계약 | OpenAPI와 공유 Zod 스키마 | 모바일, API, 관리자 타입 불일치 금지 |
| 테스트 | 단위, 통합, 모바일 E2E, 관리자 E2E | 핵심 판정과 unlock은 단위 테스트 필수 |

### D 2 권장 저장소 구조

| 경로 | 역할 |
| --- | --- |
| apps/mobile | Expo 모바일 앱, 화면 SCR 001부터 SCR 420 |
| apps/api | 세션, 판정, 결과, 광고 해금, 인증, 아카이브 API |
| apps/admin | 콘텐츠, 번역, 시뮬레이터, 사용자와 통계 관리자 |
| apps/worker | AI 문장, AI 이미지, 공유 카드 생성 작업 |
| packages/contracts | API DTO, 오류 코드, OpenAPI, Zod 스키마 |
| packages/scoring | 부작용 없는 판정 엔진과 시드 함수 |
| packages/content | 36문항, 216선택지, 태그, 초기 콘텐츠 seed |
| packages/ui | 공유 디자인 토큰과 범용 컴포넌트 |
| packages/config | TypeScript, lint, format, test 공통 설정 |
| infra | 로컬 PostgreSQL과 Redis, 배포 예시, 환경 변수 템플릿 |
| docs | 본 PRD, OpenAPI, ADR, 운영 절차 |

### D 3 필수 공급자 어댑터

- AdProvider는 load, show, verifyCompletion을 제공한다. 개발과 테스트에서는 FakeAdProvider를 사용한다.

- NarrativeProvider는 확정 resultCore를 입력으로 받고 블록 문장을 반환한다. 실패 시 TemplateNarrativeProvider가 동작한다.

- ImageProvider는 확정 이미지 속성을 입력으로 받고 한 장의 자산을 반환한다. 실패 시 LibraryImageProvider가 동작한다.

- AuthProvider는 Google ID 토큰 검증과 내부 사용자 연결만 담당한다.

- ObjectStorage는 putPrivate, getSignedUrl, delete를 제공한다.

- 각 공급자 구현은 도메인 계층에서 분리하고 테스트에서 네트워크 없이 대체할 수 있어야 한다.

### D 4 환경 변수

| 변수 | 용도 | 로컬 기본 |
| --- | --- | --- |
| DATABASE_URL | PostgreSQL 연결 | 필수 |
| REDIS_URL | 작업 큐와 잠금 | 로컬 Redis |
| JWT_SECRET | 내부 세션 서명 | 개발용 임시 값 |
| GOOGLE_CLIENT_ID | Google 로그인 검증 | mock 가능 |
| ADMOB_APP_ID | 모바일 광고 | 테스트 ID |
| ADMOB_SLOT_1, ADMOB_SLOT_2, ADMOB_SLOT_3 | 광고 슬롯 | 테스트 ID |
| AI_TEXT_API_KEY | 선택적 문장 생성 | 없으면 템플릿 사용 |
| AI_IMAGE_API_KEY | 자동 대표 이미지 생성 | 없으면 라이브러리 사용 |
| S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY, S3_SECRET_KEY | 비공개 자산 저장 | 로컬 S3 호환 저장소 |
| CONTENT_VERSION | 판정과 seed 버전 | 2.0.0 |

### D 5 첫 구현 범위

1. 모노레포, 공통 설정, 로컬 PostgreSQL과 Redis, 환경 변수 예시를 만든다.

2. Prisma 스키마와 초기 마이그레이션을 작성하고 36문항과 216선택지를 seed 한다.

3. packages scoring에 태그 합산, 후보 필터, 결정적 시드, fallback hierarchy를 순수 함수로 구현한다.

4. 세션 생성, 질문 조회, 응답 저장, complete, status, 기본 결과 API를 구현한다.

5. SCR 001, SCR 002, SCR 101부터 SCR 106, SCR 200, SCR 300의 세로 한 줄 흐름을 모바일에서 완성한다.

6. 실제 광고와 AI 대신 FakeAdProvider, TemplateNarrativeProvider, LibraryImageProvider를 연결한다.

7. 같은 answerHash와 contentVersion에 같은 resultCore가 나오는 단위 테스트와 API 통합 테스트를 통과시킨다.

8. 첫 구현 결과를 실행 방법, 테스트 결과, 남은 범위와 함께 보고한 뒤 다음 단계로 진행한다.

### D 6 구현 금지 사항

- 질문, 선택지, 결과 문장을 화면 코드에 직접 넣지 않는다.

- 클라이언트가 태그 점수 또는 최종 결과를 계산하지 않는다.

- 광고 SDK 콜백만으로 보호 콘텐츠를 해금하지 않는다.

- AI 출력이 eraId, locationId, occupationId, eventId를 변경하게 하지 않는다.

- 실패 재시도에서 새 resultId 또는 새 기록 번호를 만들지 않는다.

- Google 로그인 전 결과 열람을 막거나 로그인 취소 시 결과를 삭제하지 않는다.

- 제품 요구사항과 다른 결정을 조용히 적용하지 않는다. 데이터 손실, 비용, 보안 또는 사용자 경험을 바꾸는 결정은 ADR로 기록하고 승인받는다.

### D 7 개발 완료 보고 형식

- 구현한 화면 ID, API, 테이블과 요구사항을 목록으로 보고한다.

- 실행 명령과 필요한 환경 변수를 제공한다.

- 실행한 테스트와 결과를 제공한다.

- mock과 실제 공급자 중 어떤 구현을 사용했는지 밝힌다.

- 남은 기능, 알려진 제한, 다음 구현 단계를 구분해 기록한다.

### D 8 루트 명령과 로컬 포트

| 항목 | 기준 |
| --- | --- |
| pnpm install | 전체 workspace 의존성 설치 |
| pnpm dev | mobile, api, admin, worker 개발 실행 |
| pnpm lint | 전체 정적 검사 |
| pnpm typecheck | 전체 TypeScript 검사 |
| pnpm test | 단위와 통합 테스트 |
| pnpm test:e2e | 모바일과 관리자 핵심 흐름 E2E |
| pnpm db:migrate | 로컬 데이터베이스 마이그레이션 |
| pnpm db:seed | 질문, 선택지, 핵심 콘텐츠 seed |
| 기본 포트 | admin 3000, api 4000, mobile 8081, PostgreSQL 5432, Redis 6379, S3 호환 저장소 9000 |
