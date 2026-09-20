import type { ResultCore } from '@pastlife/scoring';

export const STORY_EVENT_TAXONOMY = {
  RELATIONSHIP: [
    'ENCOUNTER',
    'LOVE',
    'SEPARATION',
    'CONFLICT',
    'RIVALRY',
    'RECONCILIATION',
    'MENTORSHIP',
    'ROLE_REVERSAL',
  ],
  WORK: ['FAILURE', 'DISCOVERY', 'COMMISSION', 'CRAFT_CONFLICT', 'LEGACY'],
  COMMUNITY: ['DISASTER', 'SHORTAGE', 'MIGRATION', 'FESTIVAL', 'POWER_SHIFT', 'COLLECTIVE_DECISION'],
  JOURNEY: ['DEPARTURE', 'LOST_ROUTE', 'RESCUE', 'RETURN', 'EXPLORATION'],
  INNER: ['PROMISE', 'SECRET', 'REGRET', 'MORAL_DILEMMA', 'REDEMPTION'],
} as const;

type RelationshipEventType = typeof STORY_EVENT_TAXONOMY.RELATIONSHIP[number];

export type RelationshipStoryEvent = {
  type: RelationshipEventType;
  title: string;
  setup: string;
  otherAction: string;
  aftermath: string;
};

const relationshipEvents: Record<string, readonly RelationshipStoryEvent[]> = {
  REL_COMPANION: [
    {
      type: 'RIVALRY',
      title: '경쟁 끝에 드러난 신뢰',
      setup: '두 사람은 같은 일을 두고 자주 더 빠르고 정확한 쪽을 겨루었고, 며칠 전에도 사소한 오류의 책임을 놓고 말다툼한 적이 있었습니다.',
      otherAction: '평소에는 당신의 판단에 먼저 반박하던 동료가 이번에는 망설임 없이 당신이 가리킨 물건을 품에 안고 앞길을 열었습니다.',
      aftermath: '그날 이후 둘의 경쟁은 서로를 꺾기 위한 일이 아니라, 한 사람이 놓친 부분을 다른 사람이 지켜 주는 약속으로 바뀌었습니다.',
    },
    {
      type: 'ENCOUNTER',
      title: '낯선 만남이 동료가 된 날',
      setup: '처음 같은 일을 맡았을 때 두 사람은 말투도 작업 순서도 달라 필요한 이야기 외에는 거의 나누지 않았습니다.',
      otherAction: '그 사람은 당신이 혼자 감당하려는 것을 보고 말없이 반대편을 들어 올렸고, 사람들이 빠져나갈 길을 먼저 확보했습니다.',
      aftermath: '위기를 함께 건넌 뒤 두 사람은 늦은 작업이 끝날 때마다 도구를 나누어 정리했고, 그 습관은 오래된 우정의 시작이 되었습니다.',
    },
  ],
  REL_FAMILY: [
    {
      type: 'CONFLICT',
      title: '가족과 맞선 선택',
      setup: '가족은 그동안 공동체 일보다 집안의 생계를 먼저 지켜야 한다며 당신의 선택을 여러 차례 만류했습니다.',
      otherAction: '아침까지 당신을 붙잡던 가족 한 사람이 결국 가장 무거운 짐을 받아 들고, 돌아올 길을 표시하며 뒤를 따랐습니다.',
      aftermath: '두 사람의 갈등은 완전히 사라지지 않았지만, 서로의 두려움이 무책임함이 아니라 지키고 싶은 대상의 차이에서 왔음을 이해하게 되었습니다.',
    },
    {
      type: 'RECONCILIATION',
      title: '오래된 서운함 뒤의 화해',
      setup: '한동안 말을 아끼던 가족이 있었습니다. 당신이 일 때문에 중요한 약속을 놓친 뒤로 둘 사이에는 식사 때마다 빈자리가 하나 놓인 듯한 침묵이 이어졌습니다.',
      otherAction: '그 가족은 위험을 보고도 먼저 자리를 뜨지 않고 당신이 챙긴 물건을 마른 천으로 감싼 뒤, 짧게 “이번에는 함께 끝내자”고 말했습니다.',
      aftermath: '사건 뒤 두 사람은 미뤄 둔 식사를 다시 함께했고, 잘못을 없던 일로 만들기보다 다음 약속을 지키는 방식으로 관계를 회복했습니다.',
    },
  ],
  REL_LOST_LOVE: [
    {
      type: 'LOVE',
      title: '말보다 행동으로 남은 사랑',
      setup: '두 사람은 사람들 앞에서 마음을 드러내지 않았지만, 일이 끝난 뒤 같은 길을 천천히 돌아가는 것으로 서로의 하루를 확인하곤 했습니다.',
      otherAction: '그 사람은 당신이 지키려는 것이 무엇인지 묻지 않고 곧바로 필요한 도구를 건넸으며, 자신이 맡을 위험을 손짓으로 나누어 가졌습니다.',
      aftermath: '함께한 시간은 길지 않았어도, 당신은 사랑이 거창한 맹세보다 상대가 중요하게 여기는 것을 함께 지켜 주는 행동임을 기억했습니다.',
    },
    {
      type: 'SEPARATION',
      title: '떠나기 전 마지막 선택',
      setup: '그 사람은 다른 지역으로 떠날 날짜를 이미 정해 두었고, 두 사람은 남은 시간을 붙잡을지 각자의 책임을 다할지 말없이 고민하고 있었습니다.',
      otherAction: '마지막으로 함께 있던 날, 그 사람은 떠날 짐을 내려놓고 당신이 옮기던 물건의 반대편을 들었습니다.',
      aftermath: '둘은 사건을 수습한 다음 예정대로 헤어졌습니다. 다시 만나지는 못했지만, 마지막에 등을 돌리지 않았다는 기억이 오래 남았습니다.',
    },
  ],
  REL_STUDENT: [
    {
      type: 'MENTORSHIP',
      title: '가르침을 행동으로 옮긴 제자',
      setup: '제자는 아직 실수가 잦아 중요한 일을 맡길 때마다 당신이 한 번 더 확인해야 했지만, 질문만큼은 누구보다 정확했습니다.',
      otherAction: '제자는 당신이 알려 준 순서를 소리 내어 되짚으며 주변 사람들에게 할 일을 나누었고, 당신이 미처 챙기지 못한 도구까지 찾아냈습니다.',
      aftermath: '당신은 그날 처음으로 일을 맡긴 뒤 뒤돌아 확인하지 않았습니다. 가르침이 자신의 손을 떠나 다른 사람의 판단이 된 순간이었습니다.',
    },
    {
      type: 'ROLE_REVERSAL',
      title: '제자가 스승을 멈춰 세운 순간',
      setup: '당신은 늘 제자에게 서두르지 말고 흔적을 확인하라고 가르쳤지만, 정작 위기 앞에서는 혼자 모든 일을 해결하려 했습니다.',
      otherAction: '제자는 당신의 팔을 붙잡아 위험한 지름길을 막고, 평소 배운 대로 더 느리지만 안전한 순서를 제안했습니다.',
      aftermath: '당신은 자신의 방식만 고집했다면 더 많은 것을 잃었으리라 인정했습니다. 그날 이후 가르치는 일에는 배우는 순간도 포함된다는 말을 자주 남겼습니다.',
    },
  ],
};

function stableIndex(seed: string, length: number) {
  let hash = 2_166_136_261;
  for (const character of seed) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16_777_619);
  }
  return (hash >>> 0) % length;
}

export function selectRelationshipEvent(core: Pick<ResultCore, 'answerHash' | 'recordNo' | 'relationshipId'>): RelationshipStoryEvent {
  const candidates = relationshipEvents[core.relationshipId] ?? relationshipEvents.REL_COMPANION!;
  return candidates[stableIndex(`${core.answerHash}:${core.recordNo}:${core.relationshipId}`, candidates.length)]!;
}
