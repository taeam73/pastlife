import type { ResultCore } from '@pastlife/scoring';

export type ChoiceOutcomeFacts = {
  choice: string;
  cost: string;
  immediateResult: string;
  laterTime: string;
  laterResult: string;
  relationshipAction: string;
  legacy: string;
};

const sentence = (value: string) => /[.!?…]$/u.test(value.trim()) ? value.trim() : `${value.trim()}.`;

const structures: readonly ((facts: ChoiceOutcomeFacts) => string)[] = [
  (facts) => `${sentence(facts.choice)} 그 과정에서 ${sentence(facts.cost)} ${facts.laterTime}, ${sentence(facts.laterResult)}`,
  (facts) => `${sentence(facts.choice)} ${sentence(facts.relationshipAction)} ${facts.laterTime}, ${sentence(facts.laterResult)}`,
  (facts) => `${sentence(facts.choice)} 당신도 손해를 피할 수는 없었습니다. ${sentence(facts.cost)} 그래도 ${sentence(facts.immediateResult)}`,
  (facts) => `${sentence(facts.cost)} 하지만 당신은 결정을 바꾸지 않았습니다. ${facts.laterTime}, ${sentence(facts.laterResult)}`,
  (facts) => `${sentence(facts.choice)} 혼자 처리하지 않고 곁의 사람과 역할을 나누었습니다. ${facts.laterTime}, ${sentence(facts.laterResult)}`,
  (facts) => `${sentence(facts.choice)} 그 결과 ${sentence(facts.immediateResult)} 시간이 흐른 뒤에도 ${sentence(facts.legacy)}`,
];

function stableIndex(seed: string, length: number) {
  let hash = 2_166_136_261;
  for (const character of seed) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16_777_619);
  }
  return (hash >>> 0) % length;
}

export function selectChoiceOutcome(core: Pick<ResultCore, 'answerHash' | 'recordNo' | 'eventId' | 'relationshipId'>, facts: ChoiceOutcomeFacts) {
  const index = stableIndex(`${core.answerHash}:${core.recordNo}:${core.eventId}:${core.relationshipId}:choice-outcome`, structures.length);
  return { index, text: structures[index]!(facts) };
}

export function choiceOutcomeVariantCount() {
  return structures.length;
}
