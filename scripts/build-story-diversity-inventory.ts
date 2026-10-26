import { existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { storyManuscripts } from '../packages/content/src/story-manuscripts.js';
import { storyFinalMoments } from '../packages/content/src/story-final-moments.js';

const destination = resolve('docs/final-moment-variety-audit.md');
if (existsSync(destination)) {
  throw new Error(`Refusing to replace an existing manual audit: ${destination}`);
}
const finalIds = new Set(storyFinalMoments.map((moment) => moment.storyId));
const ids = storyManuscripts.map((story) => story.id);

if (ids.length !== 120 || new Set(ids).size !== 120) {
  throw new Error(`Expected 120 distinct manuscript IDs; found ${ids.length} rows and ${new Set(ids).size} IDs.`);
}
if (storyFinalMoments.some((moment) => !ids.includes(moment.storyId))) {
  throw new Error('A final moment refers to an unknown manuscript ID.');
}

function cell(value: unknown): string {
  return String(value ?? '미설정').replaceAll('|', '\\|').replaceAll(/\s+/g, ' ').trim();
}

const rows = storyManuscripts.map((story, index) => {
  const profileCount = story.identity.profilePages?.length ?? 0;
  const lastEvent = story.timeline.at(-1);
  const age = story.identity.ageAtDeath ?? '미설정';
  return `| ${index + 1} | \`${story.id}\` | ${cell(age)} | ${profileCount} | ${cell(lastEvent?.when)}: ${cell(lastEvent?.event)} | ${story.memories.length} | ${finalIds.has(story.id) ? '등록' : '미등록'} | 미검수 |`;
});

const text = [
  '# 마지막 순간·생애 다양성 전수 검수표',
  '',
  '> 자동 추출한 120편 **목록과 형식 정보**다. `미검수`는 편집 검수 미완료를 뜻한다. 등록된 마지막 순간이나 01 세 쪽이 있다고 해서 새 편집 기준을 통과한 것은 아니다. 수동 판정과 수정 기록은 이 표의 별도 섹션에서 관리한다.',
  '',
  `- 원고 ID: ${ids.length}개, 중복 없음`,
  `- 등록된 마지막 순간: ${finalIds.size}/${ids.length}개`,
  `- 01 세 쪽: ${storyManuscripts.filter((story) => story.identity.profilePages?.length === 3).length}/${ids.length}개`,
  `- 사망 나이 숫자 있음: ${storyManuscripts.filter((story) => story.identity.ageAtDeath !== null).length}/${ids.length}개`,
  '- 새 편집 기준 승인: 0/120개 (감사 시작 시점)',
  '',
  '## 전편 목록',
  '',
  '| 순번 | 원고 ID | 사망 나이 | 01 쪽 | 03 마지막 항목 | 04 항목 수 | 마지막 순간 | 편집 판정 |',
  '| ---: | --- | ---: | ---: | --- | ---: | --- | --- |',
  ...rows,
  '',
  '## 편집 검수 기록',
  '',
  '각 편에 대해 `확정 설정 / 출발 조건과 삶의 변화 / 주요 욕구와 두려움 / 압박 속 선택과 비용 / 04의 엇갈린 평가 / 사망 경위의 근거 또는 미설정 / 마지막 순간의 독립 장면 / 가장 닮은 세 편과 실질적 차이 / 01~04·삽화·PDF 정합성 / 판정과 남은 문제`를 기록한다. 검수하지 않은 항목은 추측으로 채우지 않는다.',
  '',
  '## 집계의 한계',
  '',
  '03의 마지막 항목이 단순히 `생을 마침`이라고 적혀 있으면 사망 경위는 미설정이다. 이 표의 04 항목 수는 시점이나 평가의 다양성을 보증하지 않는다. 성격·행동·피해·관계의 실제 다양성은 각 작품을 읽어 판정한다.',
  '',
].join('\n');

writeFileSync(destination, text, 'utf8');
console.log(`Wrote ${destination}: ${ids.length} manuscripts, ${finalIds.size} final moments.`);
