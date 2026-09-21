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

type StoryEventType = typeof STORY_EVENT_TAXONOMY[keyof typeof STORY_EVENT_TAXONOMY][number];

export type RelationshipStoryEvent = {
  type: StoryEventType;
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

const supplementalRelationshipEvents: Record<string, readonly RelationshipStoryEvent[]> = {
  REL_COMPANION: [
    { type: 'CONFLICT', title: '서로 다른 책임이 맞선 밤', setup: '같은 사람들을 지키려 했지만 무엇을 먼저 해야 하는지를 두고 두 사람의 판단이 갈렸습니다.', otherAction: '동료는 당신의 계획을 그대로 따르지 않고 가장 위험한 일을 자신이 맡겠다고 나섰습니다.', aftermath: '두 사람은 누가 옳았는지를 따지기보다 다음에는 역할과 철수 기준을 먼저 정하기로 했습니다.' },
    { type: 'RECONCILIATION', title: '말없이 다시 맞춘 작업 순서', setup: '오래된 오해 때문에 필요한 말만 주고받던 시기가 이어졌습니다.', otherAction: '동료는 망가진 도구를 고쳐 당신 자리 앞에 두고, 빠뜨린 작업 표시까지 조용히 채워 놓았습니다.', aftermath: '두 사람은 사과를 길게 말하지 않았지만 다시 서로의 작업을 확인하는 습관으로 신뢰를 회복했습니다.' },
  ],
  REL_FAMILY: [
    { type: 'ROLE_REVERSAL', title: '가족의 짐을 나누어 든 날', setup: '늘 당신이 돌보던 가족이 오히려 당신의 지친 모습을 먼저 알아차렸습니다.', otherAction: '그 사람은 당신이 숨겨 둔 빚과 미완성 일을 함께 펼쳐 놓고 자기 몫을 분명히 맡았습니다.', aftermath: '가족을 지킨다는 말은 혼자 견디는 일이 아니라 약한 모습을 보여 주고 도움을 받는 일까지 포함하게 되었습니다.' },
    { type: 'ENCOUNTER', title: '떠나는 문 앞에서 한 약속', setup: '생계를 위해 한 사람이 익숙한 집을 떠나야 했고 돌아올 날짜는 정할 수 없었습니다.', otherAction: '가족은 값비싼 물건 대신 매달 같은 날 서로의 안부를 전할 방법을 정했습니다.', aftermath: '거리는 멀어졌지만 반복되는 작은 약속 덕분에 관계는 의무가 아니라 서로 선택한 연결로 남았습니다.' },
  ],
  REL_LOST_LOVE: [
    { type: 'CONFLICT', title: '함께 갈 수 없었던 방향', setup: '두 사람은 서로를 아꼈지만 가족과 공동체에 대한 책임 때문에 같은 길을 택할 수 없었습니다.', otherAction: '그 사람은 당신을 붙잡는 대신 각자가 지켜야 할 사람들의 이름을 끝까지 들어 주었습니다.', aftermath: '헤어진 뒤에도 당신은 사랑이 상대의 삶을 줄이는 일이 되어서는 안 된다는 기준을 지켰습니다.' },
    { type: 'RECONCILIATION', title: '오래 뒤 도착한 짧은 소식', setup: '끝내 설명하지 못한 이별의 이유가 오랜 세월 두 사람 사이에 남았습니다.', otherAction: '먼 곳에서 온 전갈에는 원망 대신 그때 당신이 지키려 했던 일을 이제 이해한다는 한마디가 담겨 있었습니다.', aftermath: '다시 만나지는 못했지만 미안함만 남았던 기억에 감사와 이해가 함께 자리 잡았습니다.' },
  ],
  REL_STUDENT: [
    { type: 'CONFLICT', title: '가르침을 거부한 첫 반박', setup: '제자는 오래된 작업 방식이 일부 사람을 계속 배제한다고 공개적으로 반박했습니다.', otherAction: '제자는 말로 그치지 않고 더 안전하고 빠른 새 순서를 직접 시험해 결과를 보여 주었습니다.', aftermath: '당신은 권위를 지키는 대신 틀린 부분을 인정했고, 이후 제자가 스승에게 질문할 권리를 규칙으로 남겼습니다.' },
    { type: 'RECONCILIATION', title: '실패한 제자를 다시 부른 날', setup: '큰 실수를 한 제자는 부끄러움 때문에 작업장과 배움터를 떠났습니다.', otherAction: '당신은 잘못을 감추지 않은 채 다시 시작할 수 있는 가장 작은 일과 필요한 도구를 준비해 두었습니다.', aftermath: '제자는 돌아와 같은 실수를 막는 점검표를 만들었고 훗날 다른 초보자의 실패도 함부로 낙인찍지 않았습니다.' },
  ],
};

const relationshipDepthEvents: Record<string, readonly RelationshipStoryEvent[]> = {
  REL_COMPANION: [
    { type: 'PROMISE', title: '서로의 몫을 지키기로 한 약속', setup: '둘은 일이 끝난 뒤에도 공동체의 약속이 흐려지지 않도록 작은 표식을 남겼습니다.', otherAction: '동료는 먼저 자신의 몫을 내놓고 당신에게 다음 사람의 이름을 기록해 달라고 부탁했습니다.', aftermath: '그 약속은 두 사람이 헤어진 뒤에도 책임을 이어 주는 기준이 되었습니다.' },
    { type: 'RESCUE', title: '돌아오는 길의 손전등', setup: '어두워진 길에서 한 사람이 늦어지자 다른 사람은 위험을 알면서도 되돌아갔습니다.', otherAction: '동료는 길목마다 작은 불빛을 남겨 뒤따르는 사람들이 방향을 잃지 않게 했습니다.', aftermath: '둘은 혼자 살아남는 것보다 함께 돌아오는 일이 더 어렵고 중요하다는 것을 배웠습니다.' },
    { type: 'DISCOVERY', title: '낡은 장부의 빈칸', setup: '둘은 오래된 기록에서 누구의 이름이 빠져 있는지 발견했습니다.', otherAction: '동료는 자신의 평판보다 빠진 사람의 이야기를 먼저 복원했습니다.', aftermath: '그날 이후 두 사람은 성과보다 기록되지 않은 사람을 살피는 동료가 되었습니다.' },
    { type: 'COLLECTIVE_DECISION', title: '모두가 듣는 자리', setup: '공동체의 중요한 결정을 앞두고 두 사람은 서둘러 결론을 내리려 했습니다.', otherAction: '동료는 가장 늦게 말하는 사람부터 의견을 듣자고 제안했습니다.', aftermath: '관계는 같은 의견을 갖는 일이 아니라 함께 결정하는 방식을 지키는 일로 깊어졌습니다.' },
  ],
  REL_FAMILY: [
    { type: 'SHORTAGE', title: '한 그릇을 나누는 저녁', setup: '식량이 부족해 가족 모두가 같은 양을 먹을 수 없는 날이 왔습니다.', otherAction: '가족은 어린 사람의 몫을 빼앗지 않으면서 어른들이 하루를 견디는 방법을 찾았습니다.', aftermath: '그들은 사랑을 말보다 배분과 반복되는 돌봄으로 기억했습니다.' },
    { type: 'SECRET', title: '서랍 안에 남은 편지', setup: '가족은 서로를 지키려 숨겨 둔 편지 한 묶음을 발견했습니다.', otherAction: '한 사람은 비밀을 폭로하기보다 편지를 쓴 사람이 스스로 말할 때까지 기다렸습니다.', aftermath: '숨겨진 마음은 늦게 드러났지만 가족은 침묵과 보호가 다르다는 것을 배웠습니다.' },
    { type: 'MIGRATION', title: '주소를 적는 밤', setup: '가족 중 한 사람이 낯선 도시로 떠나야 했습니다.', otherAction: '남은 가족은 매달 같은 날 새 주소로 안부를 보내기로 했습니다.', aftermath: '거리는 멀어졌지만 가족은 장소가 아니라 계속 확인하는 행동으로 남았습니다.' },
    { type: 'ROLE_REVERSAL', title: '부모의 이름을 대신 쓰다', setup: '늘 보호하던 사람이 병들어 더 이상 서류와 생계를 처리할 수 없었습니다.', otherAction: '당신은 두려워하면서도 가족의 이름으로 필요한 결정을 내렸습니다.', aftermath: '돌봄은 한 방향이 아니라 계절마다 역할을 바꾸는 약속임을 알게 되었습니다.' },
  ],
  REL_LOST_LOVE: [
    { type: 'ENCOUNTER', title: '시장 끝에서 다시 본 얼굴', setup: '오래 헤어진 두 사람은 서로 다른 목적지로 가던 길에 우연히 마주쳤습니다.', otherAction: '상대는 과거를 되돌리려 하지 않고 지금 필요한 소식을 건넸습니다.', aftermath: '재회는 소유가 아니라 서로의 다음 계절을 인정하는 일이 되었습니다.' },
    { type: 'PROMISE', title: '보내지 못한 엽서', setup: '두 사람은 떠나기 전 서로에게 닿을 주소를 적었습니다.', otherAction: '상대는 약속을 지키지 못한 이유를 변명하기보다 늦은 엽서를 끝내 보냈습니다.', aftermath: '도착하지 않은 말도 한때 누군가를 향했다는 사실이 기억으로 남았습니다.' },
    { type: 'REGRET', title: '마지막 전차를 놓친 날', setup: '당신은 한 번만 더 붙잡을 기회를 앞에 두고 망설였습니다.', otherAction: '상대는 기다림을 강요하지 않고 자신의 삶으로 돌아갔습니다.', aftermath: '후회는 돌아가라는 명령이 아니라 다음 사람에게 솔직하라는 신호가 되었습니다.' },
    { type: 'REDEMPTION', title: '뒤늦게 돌려준 이름', setup: '당신은 과거의 침묵 때문에 상대의 명예가 손상되었다는 것을 알게 되었습니다.', otherAction: '상대는 사과를 쉽게 받아 주지 않았지만 사실을 바로잡을 기회를 주었습니다.', aftermath: '사랑은 다시 시작되지 않아도 잘못을 바로잡는 행동으로 남을 수 있었습니다.' },
  ],
  REL_STUDENT: [
    { type: 'DISCOVERY', title: '제자의 독자적인 해답', setup: '제자는 스승에게 배운 방법과 전혀 다른 해답을 가져왔습니다.', otherAction: '스승은 자신의 권위를 지키기보다 그 해답이 누구를 돕는지 먼저 물었습니다.', aftermath: '배움은 닮아가는 일이 아니라 서로의 시야를 넓히는 일이 되었습니다.' },
    { type: 'FAILURE', title: '함께 인정한 실패', setup: '두 사람은 중요한 작업을 망쳤고 서로에게 책임을 떠넘길 수도 있었습니다.', otherAction: '제자는 실수를 숨기지 않았고 스승은 다음 시도를 위한 재료를 남겼습니다.', aftermath: '실패는 관계를 끊는 판정이 아니라 다시 배우는 공동 기록이 되었습니다.' },
    { type: 'MENTORSHIP', title: '다음 사람에게 건넨 도구', setup: '스승은 더 이상 제자 곁에 머물 수 없게 되었습니다.', otherAction: '제자는 받은 도구를 혼자 간직하지 않고 다음 사람에게 사용법을 가르쳤습니다.', aftermath: '두 사람의 관계는 한 사람의 성공보다 이어지는 기술로 남았습니다.' },
    { type: 'POWER_SHIFT', title: '질문하는 제자', setup: '제자가 사람들의 앞에서 스승의 오래된 규칙에 질문을 던졌습니다.', otherAction: '스승은 즉시 침묵시키지 않고 규칙이 누구를 보호하지 못하는지 함께 살폈습니다.', aftermath: '존경은 복종이 아니라 더 나은 기준을 함께 감당하는 용기가 되었습니다.' },
  ],
};

export type HistoricalStoryEvent = RelationshipStoryEvent & { category: keyof typeof STORY_EVENT_TAXONOMY };

const eventSeeds: readonly [keyof typeof STORY_EVENT_TAXONOMY, string, string, string][] = [
  ['WORK', 'FAILURE', '첫 작업이 뜻대로 되지 않은 날', '도구나 기록의 작은 실수로 일이 멈췄습니다'],
  ['WORK', 'DISCOVERY', '아무도 보지 못한 흔적', '오래된 물건과 기록에서 새로운 단서를 찾았습니다'],
  ['WORK', 'COMMISSION', '마을에서 맡긴 일', '사람들은 꼭 필요한 일을 당신에게 부탁했습니다'],
  ['WORK', 'CRAFT_CONFLICT', '빠르게 하자는 사람들', '속도와 안전 중 무엇을 먼저 지킬지 정해야 했습니다'],
  ['WORK', 'LEGACY', '다음 사람을 위한 도구', '당신은 배운 방법을 다음 사람에게 남겼습니다'],
  ['COMMUNITY', 'DISASTER', '갑자기 무너진 길', '비와 바람으로 사람들이 다니던 길이 막혔습니다'],
  ['COMMUNITY', 'SHORTAGE', '줄어든 식량 창고', '마을의 음식이 부족해 모두가 나눌 방법을 찾았습니다'],
  ['COMMUNITY', 'MIGRATION', '새 주소를 적은 가족', '일자리를 찾아 다른 지역으로 떠나는 사람이 생겼습니다'],
  ['COMMUNITY', 'FESTIVAL', '다시 열린 장터', '힘든 일이 지나간 뒤 사람들이 작은 축제를 열었습니다'],
  ['COMMUNITY', 'POWER_SHIFT', '바뀐 시장의 규칙', '새로운 관리자가 오며 오래된 약속이 흔들렸습니다'],
  ['COMMUNITY', 'COLLECTIVE_DECISION', '모두가 모인 밤', '사람들은 한 사람의 결정 대신 함께 정하기로 했습니다'],
  ['JOURNEY', 'DEPARTURE', '새벽 첫 출발', '당신은 익숙한 집을 떠나 먼 곳으로 향했습니다'],
  ['JOURNEY', 'LOST_ROUTE', '사라진 길표지', '안개 속에서 길을 알려 주던 표식이 보이지 않았습니다'],
  ['JOURNEY', 'RESCUE', '돌아오지 않은 배', '사람들은 늦어진 사람을 찾기 위해 함께 움직였습니다'],
  ['JOURNEY', 'RETURN', '다시 밟은 고향길', '오랜 시간이 지나 당신은 익숙한 길로 돌아왔습니다'],
  ['JOURNEY', 'EXPLORATION', '지도에 없는 마을', '처음 보는 마을과 사람을 만나 기록을 남겼습니다'],
  ['INNER', 'PROMISE', '작은 약속 하나', '당신은 지킬 수 있는 약속을 골라 끝까지 기억했습니다'],
  ['INNER', 'SECRET', '말하지 못한 사실', '누군가를 지키려 숨겨 둔 이야기가 있었습니다'],
  ['INNER', 'REGRET', '그날 하지 못한 말', '늦게 깨달은 마음이 오래 남았습니다'],
  ['INNER', 'MORAL_DILEMMA', '둘 다 지킬 수 없는 선택', '누군가를 도우려면 다른 것을 포기해야 했습니다'],
  ['INNER', 'REDEMPTION', '다시 고칠 기회', '당신은 예전의 실수를 바로잡을 행동을 골랐습니다'],
];

export const historicalEventCatalog: readonly HistoricalStoryEvent[] = eventSeeds.map(([category, type, title, setup], index) => ({
  category, type: type as HistoricalStoryEvent['type'], title, setup,
  otherAction: '사람들은 서두르지 않고 각자 할 수 있는 일을 나누었습니다.',
  aftermath: '그날의 선택은 다음 날의 약속과 생활 방식에 작은 변화를 남겼습니다.',
}));

export function historicalEventCounts() {
  return Object.fromEntries(Object.keys(STORY_EVENT_TAXONOMY).map((category) => [category, historicalEventCatalog.filter((event) => event.category === category).length]));
}

export function relationshipEventCounts() {
  return Object.fromEntries(Object.keys(relationshipEvents).map((key) => [key, (relationshipEvents[key]?.length ?? 0) + (supplementalRelationshipEvents[key]?.length ?? 0) + (relationshipDepthEvents[key]?.length ?? 0)]));
}

function stableIndex(seed: string, length: number) {
  let hash = 2_166_136_261;
  for (const character of seed) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16_777_619);
  }
  return (hash >>> 0) % length;
}

export function selectRelationshipEvent(core: Pick<ResultCore, 'answerHash' | 'recordNo' | 'relationshipId'>): RelationshipStoryEvent {
  const base = relationshipEvents[core.relationshipId] ?? relationshipEvents.REL_COMPANION!;
  const candidates = [...base, ...(supplementalRelationshipEvents[core.relationshipId] ?? supplementalRelationshipEvents.REL_COMPANION!), ...(relationshipDepthEvents[core.relationshipId] ?? relationshipDepthEvents.REL_COMPANION!)];
  return candidates[stableIndex(`${core.answerHash}:${core.recordNo}:${core.relationshipId}`, candidates.length)]!;
}
