import { eras, historicalLocations, relationships } from '@pastlife/content';
import type { ResultCore } from '@pastlife/scoring';
import type { NarrativeBlock } from '../repositories/assessment.repository.js';
import type { StoryProfile } from '../story-profile.js';
import { describeOccupation, occupationLabel } from './occupation-narrative.js';

function sentence(value: string) {
  const trimmed = value.trim();
  return /[.!?。]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function labelOf(items: readonly { id: string; label: string }[], id: string, fallback: string) {
  return items.find((item) => item.id === id)?.label ?? fallback;
}

function withRoleParticle(value: string) {
  const last = value.charCodeAt(value.length - 1);
  if (last < 0xac00 || last > 0xd7a3) return `${value}로`;
  const finalConsonant = (last - 0xac00) % 28;
  return `${value}${finalConsonant === 0 || finalConsonant === 8 ? '로' : '으로'}`;
}

function withParticle(value: string, consonantForm: string, vowelForm: string) {
  const last = value.charCodeAt(value.length - 1);
  if (last < 0xac00 || last > 0xd7a3) return `${value}${vowelForm}`;
  return `${value}${(last - 0xac00) % 28 === 0 ? vowelForm : consonantForm}`;
}

function describePastWound(value: string) {
  const trimmed = value.trim().replace(/[.!?]+$/u, '');
  if (trimmed.endsWith('경험')) return `${trimmed.slice(0, -2).trimEnd()} 일이 있었습니다.`;
  if (trimmed.endsWith('기억')) return `${trimmed.slice(0, -2).trimEnd()} 일이 있었습니다.`;
  if (trimmed.endsWith('시절')) return `${trimmed.slice(0, -2).trimEnd()} 때가 있었습니다.`;
  if (trimmed.endsWith('날')) return `${trimmed}이 있었습니다.`;
  return `${trimmed} 일이 있었습니다.`;
}

function describeFear(value: string) {
  const trimmed = value.trim().replace(/[.!?]+$/u, '');
  return trimmed.endsWith('두려움')
    ? `${trimmed.slice(0, -3).trimEnd()} 두려워했습니다.`
    : sentence(trimmed);
}

function describeWish(value: string) {
  const trimmed = value.trim().replace(/[.!?]+$/u, '');
  return `${withParticle(trimmed, '이었습니다', '였습니다')}.`;
}

export function buildDeepNarrative(core: ResultCore, profile: StoryProfile): NarrativeBlock[] {
  const era = labelOf(eras, core.eraId, '오래전 어느 시대');
  const location = labelOf(historicalLocations, core.locationId, '이름이 남지 않은 도시');
  const occupation = occupationLabel(core.occupationId, '자신의 일을 묵묵히 하던 사람');
  const relationship = labelOf(relationships, core.relationshipId, '소중한 사람');
  const keyRelationship = profile.relationshipNetwork.find(({ role }) => role === '핵심 인연');
  const mentorRelationship = profile.relationshipNetwork.find(({ role }) => role === '스승·라이벌');
  const decisiveMoment = profile.timeline.find(({ stage }) => stage === '삶의 전환기');
  const occupationDescription = describeOccupation(core);

  return [
    {
      id: 'DEEP_INNER_SELF',
      title: '제1장 · 아무도 몰랐던 마음',
      body: [
        `${era}, ${location}. 그곳에서 ${withParticle(profile.identity.name, '은', '는')} ${withRoleParticle(occupation)} 살았습니다. ${occupationDescription}`,
        `${sentence(profile.identity.voiceAndManner)} 겉으로는 ${sentence(profile.identity.socialMask)} 그래서 주변 사람들은 ${profile.identity.name}이 흔들리거나 지치는 모습을 거의 보지 못했습니다.`,
        `어린 시절에는 ${describePastWound(profile.innerLife.formativeWound)} 그 일 이후 당신은 ${describeFear(profile.innerLife.coreFear)} 그래서 힘든 일이 생기면 ${sentence(profile.innerLife.copingPattern)}`,
        `${sentence(profile.characterArc.centralContradiction)} 이런 모습 때문에 쉬어야 할 때도 자신을 계속 몰아붙였습니다. ${sentence(profile.identity.stressResponse)} 누구에게 기대고 싶어도 먼저 손을 내미는 일은 쉽지 않았습니다.`,
        `${profile.identity.name}에게 정말 필요했던 것은 ${describeWish(profile.characterArc.innerNeed)} 오랜 시간이 흐른 뒤에야, 강한 사람도 두려운 마음을 말하고 다른 사람과 책임을 나눌 수 있다는 사실을 받아들였습니다.`,
      ].join('\n\n'),
    },
    {
      id: 'DEEP_RELATIONSHIP',
      title: '제2장 · 마음의 문을 연 사람',
      body: [
        `${withParticle(relationship, '과', '와')}의 만남은 평범하게 시작되었습니다. ${sentence(keyRelationship?.bond ?? '처음에는 필요한 말을 주고받는 사이였습니다')} 두 사람은 성격도, 문제를 해결하는 방식도 달랐습니다. 그래서 가까워지는 데에는 생각보다 긴 시간이 필요했습니다.`,
        `${sentence(keyRelationship?.tension ?? profile.innerLife.lifelongDilemma)} 당신은 상대를 믿고 싶었지만, 믿었다가 다시 상처받을까 봐 한 걸음 물러서곤 했습니다. 상대가 곁에 있어도 중요한 걱정은 혼자 해결하려 했고, 괜찮지 않은 날에도 괜찮다고 말했습니다.`,
        `관계가 달라진 것은 거창한 약속 때문이 아니었습니다. 어느 힘든 날, 그 사람은 답을 재촉하지 않고 당신 곁에 머물렀습니다. ${sentence(keyRelationship?.change ?? '그 경험은 누군가와 책임을 나눠도 된다는 생각을 남겼습니다')} 그날부터 당신은 아주 조금씩 진짜 마음을 보여 주기 시작했습니다.`,
        `${sentence(mentorRelationship?.tension ?? '한편 인정받고 싶은 마음과 내 방식을 지키고 싶은 마음도 계속 부딪혔습니다')} 이 관계들을 지나며 당신은 배웠습니다. 가까운 사이는 서로의 문제를 대신 해결하는 관계가 아니라, 도망치지 않고 같은 자리에 있어 주는 관계라는 것을요.`,
      ].join('\n\n'),
    },
    {
      id: 'DEEP_DECISION',
      title: '제3장 · 선택 뒤에 남은 대가',
      body: [
        `인생의 방향이 바뀐 날, 당신은 익숙한 일상을 버릴 수 있는 선택 앞에 섰습니다. ${sentence(decisiveMoment?.event ?? profile.characterArc.outwardGoal)} 눈앞의 손해를 피하면 조용히 지나갈 수 있었습니다. 하지만 그렇게 하면 누군가는 당신 대신 더 큰 어려움을 겪어야 했습니다.`,
        `당신은 한참 동안 움직이지 못했습니다. 머릿속에는 실패하면 모두의 삶이 무너질 수 있다는 두려움이 떠올랐습니다. 동시에 누구도 포기하고 싶지 않은 마음도 커졌습니다. 결국 당신은 가장 편한 길이 아니라, 자신이 옳다고 믿는 길을 골랐습니다.`,
        `${sentence(profile.ending.finalChoice)} 그 선택으로 삶의 방향이 달라졌습니다. ${sentence(profile.ending.aftermath)} 사람들은 용감한 결정이었다고 말했지만, 당신은 그 과정에서 잃은 것과 상처받은 사람들도 오래 기억했습니다.`,
        `그날 이후 당신은 희생을 멋진 이야기로 꾸미지 않았습니다. 같은 문제가 다시 생겼을 때 누군가 혼자 감당하지 않도록 일하는 순서와 책임을 나누었습니다. 그 선택이 완벽해서가 아니라, 부족했던 점까지 다음 사람에게 알려 주었기 때문에 삶의 방향이 달라졌습니다.`,
      ].join('\n\n'),
    },
    {
      id: 'DEEP_LEGACY',
      title: '제4장 · 삶이 끝난 뒤에도 남은 것',
      body: [
        `시간이 흐르면서 당신의 걸음도 느려졌습니다. 가장 오래 마음에 남은 아픔은 ${describeWish(profile.innerLife.deepestPain)} 아무에게도 쉽게 말하지 못한 바람은 ${describeWish(profile.innerLife.secretWish)} 이루지 못한 일이 있었지만, 그것이 삶 전체를 실패로 만들지는 않았습니다.`,
        `${profile.ageAtDeath}세에 이른 마지막 순간, 당신은 자신의 이름보다 곁에 남겨질 사람들을 먼저 생각했습니다. ${sentence(profile.ending.cause)} ${sentence(profile.ending.aftermath)} 당신이 떠난 뒤 사람들은 화려한 업적보다 평소에 반복하던 작은 행동을 더 오래 기억했습니다.`,
        `${sentence(profile.legacy)} 누군가는 당신이 정리해 둔 방법으로 일을 이어 갔고, 누군가는 당신에게 배운 말을 다른 사람에게 건넸습니다. 한 사람의 삶은 그렇게 눈에 잘 띄지 않는 방식으로 여러 사람의 다음 날에 남았습니다.`,
        `마지막에 남은 것은 죽음이 아니었습니다. 상처가 있어도 다시 사람을 믿은 일, 두려워도 필요한 선택을 한 일, 그리고 혼자만 살아남지 않으려 했던 마음이었습니다. 그것이 ${withParticle(profile.identity.name, '이', '가')} 끝까지 지키고 남긴 삶의 기록이었습니다.`,
      ].join('\n\n'),
    },
  ];
}

export function buildPresentGuideNarrative(core: ResultCore, profile: StoryProfile): NarrativeBlock[] {
  const occupation = occupationLabel(core.occupationId, '맡은 일을 해내는 사람');
  const relationship = labelOf(relationships, core.relationshipId, '소중한 사람');

  return [
    {
      id: 'GUIDE_TODAY_PACE',
      title: '제1장 · 오늘은 조금 천천히',
      body: [
        `${withRoleParticle(profile.identity.name)} 살던 때, 문제가 생기면 ${sentence(profile.identity.stressResponse)} 쉬는 순간에도 다음 일을 생각하느라 마음을 내려놓지 못했습니다.`,
        `지금도 해야 할 일이 한꺼번에 떠오르는 날이 있을 수 있습니다. 그럴 때는 모든 일을 붙잡지 말고, 오늘 꼭 할 한 가지와 내일로 미뤄도 되는 한 가지를 나누어 적어 보세요.`,
        `그리고 십 분만 아무것도 해결하지 않는 시간을 가져 보세요. 음악 한 곡을 듣거나 창밖을 보는 정도면 충분합니다. 쉬는 것은 포기가 아니라 다음 선택을 위한 준비일 수 있습니다. 처음에는 어색해도 오늘 한 번 해볼 수 있어요.`,
        `하루가 끝났을 때 완성한 일의 개수만 세지 않아도 됩니다. 무리하고 있다는 신호를 알아챈 순간도 중요한 기록입니다. 속도를 늦춘 하루가 오히려 더 오래 갈 수 있는 출발점이 될 수 있어요.`,
      ].join('\n\n'),
    },
    {
      id: 'GUIDE_TODAY_RELATIONSHIP',
      title: '제2장 · 혼자 참지 않는 연습',
      body: [
        `${withParticle(profile.identity.name, '은', '는')} 마음이 힘든 날에도 괜찮다고 말하곤 했습니다. ${sentence(profile.innerLife.copingPattern)} ${withParticle(relationship, '이', '가')} 곁에 있어도 걱정을 나누기까지 오랜 시간이 걸렸습니다. 상처받지 않으려고 만든 거리가 도움을 받을 기회까지 막았습니다.`,
        `오늘 떠오르는 사람이 있다면 긴 설명부터 준비하지 않아도 됩니다. “요즘 조금 지쳐” 또는 “잠깐 이야기할 수 있어?”처럼 짧은 한 문장을 보내 보세요. 상대가 문제를 해결해 주지 않아도, 혼자 품고 있던 마음을 밖으로 꺼내는 것만으로 달라질 수 있습니다.`,
        `반대로 누군가 먼저 고민을 말해 온다면 정답을 서둘러 주지 않아도 됩니다. “그랬구나”라고 듣고, 지금 필요한 것이 조언인지 그냥 들어주는 것인지 물어보세요. ${profile.identity.name}에게 가장 중요했던 인연도 거창한 약속보다 곁에 머무는 행동에서 시작되었습니다.`,
        `관계는 한 번의 큰 결심보다 작은 연락이 쌓이며 깊어집니다. 오늘 한 사람에게 먼저 안부를 묻는 일부터 해볼 수 있어요. 답장이 늦더라도 그 행동 자체가 관계의 문을 여는 첫 장면이 됩니다.`,
      ].join('\n\n'),
    },
    {
      id: 'GUIDE_TODAY_WORK',
      title: '제3장 · 잘하는 일을 나누는 방법',
      body: [
        `${withParticle(profile.identity.name, '은', '는')} ${withRoleParticle(occupation)} 살며 ${sentence(profile.dailyLife.talent)} 하지만 잘하고 싶은 마음이 커질수록 ${sentence(profile.dailyLife.weakness)} 완벽하게 해내려다가 시작이 늦어지거나, 다른 사람에게 일을 맡기지 못하는 날도 있었습니다.`,
        `지금 배우거나 일하는 곳에서도 비슷한 장면을 만날 수 있습니다. 혼자 끝내려 하기보다 내가 잘 아는 작은 방법 하나를 친구나 동료에게 알려 주세요. 반대로 막히는 부분 하나는 솔직하게 질문해 보세요. 도움을 주고받는 과정도 실력의 일부입니다.`,
        `오늘은 결과물 전체가 아니라 가장 작은 단위를 완성해 볼 수 있어요. 문서라면 제목과 첫 문단, 공부라면 문제 세 개, 운동이라면 십 분처럼 시작점을 낮춰 보세요. 작게 끝낸 경험이 다음 장면으로 넘어갈 힘을 만들어 줍니다.`,
        `${sentence(profile.dailyLife.dream)} 그 삶에서는 이 꿈이 매일 움직이는 이유였습니다. 지금도 좋아하는 일을 바로 직업으로 만들 필요는 없습니다. 일주일에 한 번이라도 계속할 자리를 마련하면 가능성은 끊어지지 않습니다.`,
      ].join('\n\n'),
    },
    {
      id: 'GUIDE_TODAY_CHOICE',
      title: '제4장 · 다음 선택은 작게',
      body: [
        `그 삶의 중요한 선택 앞에서 당신은 ${sentence(profile.innerLife.lifelongDilemma)} 모든 결과를 알고 움직인 것은 아니었습니다. 지키고 싶은 사람과 일을 먼저 정한 뒤 한 걸음을 내디뎠습니다.`,
        `종이나 메모 앱에 세 문장을 적어 보세요. “내가 원하는 것”, “걱정되는 것”, “오늘 할 수 있는 것”입니다. 거창한 인생 계획이 아니어도 됩니다. 연락 한 통, 신청 버튼 한 번, 자료 한 페이지처럼 오늘 끝낼 수 있는 행동이면 충분합니다.`,
        `선택한 뒤 마음이 흔들려도 실패한 것은 아닙니다. 새로운 정보를 알게 되면 방향을 다시 바꿀 수 있습니다. ${profile.identity.name}의 삶이 보여 주었듯, 책임은 혼자 견디는 것이 아니라 상황을 살피고 필요한 사람과 나누는 과정에 더 가깝습니다.`,
        `당장 모든 답을 찾지 않아도 됩니다. 오늘의 작은 행동을 마치고, 그때 든 생각을 한 줄 남겨 보세요. 그 한 줄이 내일의 선택을 더 쉽게 만들어 줍니다. 지금 할 수 있는 가장 작은 일부터 해볼 수 있어요.`,
      ].join('\n\n'),
    },
  ];
}
