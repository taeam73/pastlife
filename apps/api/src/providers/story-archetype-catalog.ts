import type { ResultCore } from '@pastlife/scoring';

export type StoryArchetype = { id: string; title: string; childhoodTurn: string; relationshipTurn: string; decisionFrame: string; legacy: string };

export const storyArchetypes: readonly StoryArchetype[] = [
  { id: 'BUILD_AGAIN', title: '무너진 뒤 다시 세운 사람', childhoodTurn: '어릴 때 익숙한 집이나 마을이 흔들리는 일을 겪었습니다.', relationshipTurn: '중요한 사람과 함께 무너진 일상을 다시 만들었습니다.', decisionFrame: '당신은 떠나는 것보다 남아 고치는 길을 골랐습니다.', legacy: '사람들은 당신이 남긴 수리 방법과 약속을 이어 갔습니다.' },
  { id: 'LEAVE_AND_RETURN', title: '떠났다가 돌아온 사람', childhoodTurn: '어릴 때부터 집 밖의 길과 낯선 사람을 궁금해했습니다.', relationshipTurn: '멀리 떠난 뒤에도 한 사람과 약속을 주고받았습니다.', decisionFrame: '당신은 익숙한 곳을 떠났지만 마지막에는 돌아갈 이유를 찾았습니다.', legacy: '당신의 여행 기록은 다음 사람의 안전한 길이 되었습니다.' },
  { id: 'HIDDEN_WITNESS', title: '사라질 뻔한 일을 기록한 사람', childhoodTurn: '사람들이 지나치는 작은 차이를 잘 알아차렸습니다.', relationshipTurn: '중요한 사람은 당신에게 말하지 못한 사실을 맡겼습니다.', decisionFrame: '당신은 침묵하면 편하지만 누군가를 지킬 수 없다는 상황을 만났습니다.', legacy: '당신이 남긴 이름과 날짜는 잊힐 사람을 다시 불러냈습니다.' },
  { id: 'SKILL_TO_OTHERS', title: '기술을 나눈 사람', childhoodTurn: '손으로 고치고 만드는 일을 하며 자신감을 얻었습니다.', relationshipTurn: '스승이나 동료에게 배운 일을 더 어린 사람에게 전했습니다.', decisionFrame: '당신은 혼자 잘하는 길보다 함께 할 수 있는 방법을 골랐습니다.', legacy: '당신의 가장 큰 유산은 물건이 아니라 배운 사람들입니다.' },
  { id: 'PROTECT_THE_SMALL', title: '작은 사람들을 지킨 사람', childhoodTurn: '어린 사람이나 약한 이웃을 돌보는 일을 일찍 배웠습니다.', relationshipTurn: '당신에게 기대는 사람이 생기면서 책임과 피로를 함께 느꼈습니다.', decisionFrame: '당신은 모두를 구할 수 없다는 사실을 인정하고 가장 필요한 곳을 골랐습니다.', legacy: '당신은 도움을 받는 것도 괜찮다는 문화를 남겼습니다.' },
  { id: 'QUESTION_THE_RULE', title: '오래된 규칙에 질문한 사람', childhoodTurn: '왜 그래야 하는지 설명되지 않는 규칙을 자주 물었습니다.', relationshipTurn: '당신과 다른 생각을 가진 사람이 가장 중요한 동료가 되었습니다.', decisionFrame: '당신은 벌을 피하는 대신 더 공평한 방법을 말하기로 했습니다.', legacy: '사람들은 당신의 질문을 새 규칙을 만드는 출발점으로 기억했습니다.' },
  { id: 'MAKE_A_HOME', title: '혈연 밖에서 집을 만든 사람', childhoodTurn: '한곳에 오래 머물지 못해 사람과 장소를 새로 익혀야 했습니다.', relationshipTurn: '우연히 만난 사람들이 가족처럼 서로의 생활을 챙겼습니다.', decisionFrame: '당신은 혼자 견디는 대신 함께 머물 수 있는 자리를 만들었습니다.', legacy: '당신이 만든 집은 떠난 사람도 다시 찾아올 수 있는 곳이 되었습니다.' },
  { id: 'LAST_MESSAGE', title: '마지막 소식을 전한 사람', childhoodTurn: '멀리 있는 사람과 연락하는 일이 삶에서 큰 의미가 되었습니다.', relationshipTurn: '한 사람에게 꼭 전해야 할 말을 오래 품었습니다.', decisionFrame: '당신은 위험을 감수하고도 소식을 전할 방법을 찾았습니다.', legacy: '그 메시지는 여러 사람의 선택을 바꾸는 계기가 되었습니다.' },
  { id: 'QUIET_CARE', title: '조용히 돌본 사람', childhoodTurn: '큰 말보다 매일 반복하는 일을 통해 사랑을 배웠습니다.', relationshipTurn: '당신의 돌봄을 당연하게 여기던 사람이 뒤늦게 마음을 알아보았습니다.', decisionFrame: '당신은 인정받기보다 계속 필요한 일을 할지 스스로 결정했습니다.', legacy: '사람들은 당신이 남긴 생활 습관을 서로 돌보는 방법으로 사용했습니다.' },
  { id: 'SECOND_CHANCE', title: '다시 선택한 사람', childhoodTurn: '한 번의 실수가 오래 따라오는 경험을 했습니다.', relationshipTurn: '당신에게 다시 기회를 준 사람이 있었습니다.', decisionFrame: '당신은 과거를 지울 수 없지만 다음 행동은 바꿀 수 있다고 선택했습니다.', legacy: '당신의 이야기는 실수 뒤에도 다시 시작할 수 있다는 증거가 되었습니다.' },
];

export function selectStoryArchetype(core: Pick<ResultCore, 'answerHash' | 'recordNo' | 'eventId' | 'relationshipId'>) {
  let hash = 2_166_136_261;
  for (const character of `${core.answerHash}:${core.recordNo}:${core.eventId}:${core.relationshipId}:archetype`) { hash ^= character.charCodeAt(0); hash = Math.imul(hash, 16_777_619); }
  return storyArchetypes[(hash >>> 0) % storyArchetypes.length]!;
}
