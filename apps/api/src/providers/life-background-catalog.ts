import type { ResultCore } from '@pastlife/scoring';
import type { StoryProfile } from '../story-profile.js';

type Background = StoryProfile['background'];
type InnerLife = StoryProfile['innerLife'];

const families: readonly Pick<Background, 'familyStructure' | 'parentStory' | 'primaryCaregiver' | 'siblingStory'>[] = [
  { familyStructure: '두 부모와 함께 사는 집', parentStory: '한 사람은 생계를, 다른 한 사람은 집안과 이웃의 돌봄을 맡았지만 잦은 부재로 늘 온전한 가족 식사는 드물었습니다', primaryCaregiver: '두 부모가 번갈아 돌보았습니다', siblingStory: '나이 차가 적은 형제와 물건과 책임을 나누며 자랐습니다' },
  { familyStructure: '한 부모가 지키는 집', parentStory: '다른 부모는 아주 어릴 때 병으로 세상을 떠났고, 남은 부모는 슬픔을 말할 틈도 없이 생계를 이어 갔습니다', primaryCaregiver: '남은 부모와 이웃 한 사람이 함께 돌보았습니다', siblingStory: '어린 동생을 돌보는 일이 일찍부터 당신의 몫이었습니다' },
  { familyStructure: '할머니의 작은 집', parentStory: '부모는 먼 교역로로 떠난 뒤 소식이 드물었고, 계절마다 짧은 편지만 돌아왔습니다', primaryCaregiver: '엄격하지만 손이 따뜻한 할머니가 키웠습니다', siblingStory: '친형제 대신 이웃 아이 둘과 한집의 형제처럼 자랐습니다' },
  { familyStructure: '조부모와 여러 친척이 함께 사는 큰집', parentStory: '부모는 공동체의 일로 집을 자주 비웠으며 사랑은 있었지만 당신과 보내는 시간은 짧았습니다', primaryCaregiver: '할아버지와 큰이모에 해당하는 친족이 생활을 가르쳤습니다', siblingStory: '사촌들과 경쟁하고 화해하며 자기 몫을 주장하는 법을 배웠습니다' },
  { familyStructure: '혈연이 아닌 보호자의 공방', parentStory: '친부모에 관한 기록은 이름 한 줄 외에는 남아 있지 않습니다', primaryCaregiver: '당신을 발견한 장인과 그 동료들이 돌아가며 키웠습니다', siblingStory: '공방의 어린 견습생들이 가족이자 경쟁자였습니다' },
  { familyStructure: '공동체가 함께 돌보는 거처', parentStory: '재난 뒤 부모와 헤어졌고 다시 만났다는 기록은 없습니다', primaryCaregiver: '여러 어른이 식사와 잠자리를 나누어 맡았습니다', siblingStory: '비슷한 처지의 아이들을 지켜야 할 형제처럼 여겼습니다' },
  { familyStructure: '경제적으로 넉넉하지만 조용한 집', parentStory: '두 부모는 모두 살아 있었으나 가문의 의무와 체면을 감정보다 앞세웠습니다', primaryCaregiver: '일상을 챙긴 유모와 나이 든 하인이 정서적인 보호자가 되었습니다', siblingStory: '칭찬을 두고 경쟁하던 손위 형제와 오래 긴장된 관계를 맺었습니다' },
  { familyStructure: '떠돌며 계절마다 거처가 바뀌는 가족', parentStory: '두 부모는 함께 있었지만 이동과 생계 때문에 누구도 오래 머물 여유가 없었습니다', primaryCaregiver: '부모와 이동대의 어른들이 함께 돌보았습니다', siblingStory: '어린 형제를 업고 이동하는 날이 많아 일찍 철이 들었습니다' },
];

const homes: readonly Pick<Background, 'homeAndResources' | 'education' | 'health' | 'displacement'>[] = [
  { homeAndResources: '수입은 빠듯했고 비가 오면 지붕 한쪽이 샜지만, 식탁에는 늘 한 사람 몫의 여분을 두었습니다', education: '정식 교육 대신 장부의 숫자와 표식을 곁눈질로 익혔습니다', health: '어릴 때 앓은 열병 뒤 추위에 쉽게 지쳤습니다', displacement: '큰 흉년 때 한 차례 다른 마을로 이주했습니다' },
  { homeAndResources: '먹을 것은 충분했으나 집안의 규율이 엄격해 개인 물건과 시간은 거의 없었습니다', education: '가정 교사에게 글과 계산을 배웠지만 질문의 범위는 제한되었습니다', health: '큰 병은 없었지만 긴장할 때 숨이 가빠지는 증상이 있었습니다', displacement: '가문의 문제로 익숙한 집을 떠나 낯선 도시에서 다시 시작했습니다' },
  { homeAndResources: '공방 뒤편의 한 칸을 여러 사람과 나눴고 도구를 고치는 능력이 곧 생활비였습니다', education: '스승의 작업을 돕는 대가로 글과 기술을 배웠습니다', health: '한쪽 손에 오래된 화상 자국이 있어 섬세한 동작을 반복해 연습해야 했습니다', displacement: '스승을 따라 두 도시를 옮겨 다녔습니다' },
  { homeAndResources: '계절에 따라 식량 사정이 크게 달라져 저장과 분배가 가족의 가장 큰 일이었습니다', education: '노래와 구전 이야기, 별과 날씨를 읽는 법으로 세상을 배웠습니다', health: '긴 거리를 잘 걸었지만 한쪽 무릎의 통증을 평생 안고 살았습니다', displacement: '전쟁을 피해 밤중에 고향을 떠난 경험이 있습니다' },
  { homeAndResources: '공동 숙소에서 옷과 침구를 물려받았고 사적인 공간은 거의 없었습니다', education: '공동체의 기록 담당자가 재능을 알아보고 늦게 글을 가르쳤습니다', health: '청력 한쪽이 약해 사람의 입 모양과 표정을 유심히 보는 습관이 생겼습니다', displacement: '어릴 때의 재난 이후 고향으로 돌아가지 못했습니다' },
  { homeAndResources: '강과 바다에서 얻은 것으로 살아 물자는 풍부할 때와 없을 때가 뚜렷했습니다', education: '항해와 날씨, 매듭과 노래를 여러 어른에게서 나누어 배웠습니다', health: '몸은 건강했지만 물에 빠졌던 기억 때문에 깊은 물 앞에서 공포가 올라왔습니다', displacement: '긴 항해를 따라 가족 전체가 새 섬에 정착했습니다' },
];

const innerLives: readonly InnerLife[] = [
  { formativeWound: '어린 시절 보호자가 예고 없이 사라진 경험', coreFear: '소중한 사람도 설명 없이 떠날 수 있다는 두려움', copingPattern: '관계가 끊기기 전에 먼저 책임과 일을 떠안았습니다', lifelongDilemma: '사람을 붙잡는 일과 그 사람의 선택을 존중하는 일 사이에서 오래 고민했습니다', deepestPain: '도움을 청하면 짐이 될 것이라 여겨 아픈 순간에도 혼자 견딘 일', secretWish: '아무 역할도 하지 않아도 머물 수 있는 집을 갖는 것' },
  { formativeWound: '가족의 실수까지 대신 꾸중을 들었던 날', coreFear: '작은 오류 하나로 모두의 생활이 무너질 수 있다는 두려움', copingPattern: '모든 것을 두 번 확인하고 통제 가능한 순서를 만들었습니다', lifelongDilemma: '정확함을 지키는 일과 사람의 실수를 용서하는 일 사이에서 흔들렸습니다', deepestPain: '옳은 말을 했지만 가장 가까운 이의 마음을 다치게 한 기억', secretWish: '완벽하지 않아도 신뢰받을 수 있다는 확신' },
  { formativeWound: '가난 때문에 배움의 자리를 동생에게 양보한 경험', coreFear: '기회는 늘 한 사람에게만 돌아온다는 두려움', copingPattern: '자신의 몫을 미루고 다른 사람의 길부터 열었습니다', lifelongDilemma: '희생이 사랑인지 자기 소멸인지 구분하기 어려워했습니다', deepestPain: '원했던 삶을 입 밖에 내기도 전에 포기한 일', secretWish: '누구의 허락도 받지 않고 자기 이름으로 무언가를 완성하는 것' },
  { formativeWound: '공동체 앞에서 출신을 이유로 배제당한 경험', coreFear: '아무리 노력해도 끝내 내부 사람이 될 수 없다는 두려움', copingPattern: '쓸모와 성과로 자리를 증명하려 했습니다', lifelongDilemma: '인정받기 위해 자신을 바꿀지 낯선 채로 남을지 고민했습니다', deepestPain: '사랑하는 이가 사람들의 시선을 견디지 못하고 관계를 숨긴 일', secretWish: '설명하거나 증명하지 않아도 이름 그대로 불리는 것' },
  { formativeWound: '재난 때 한 사람을 구하지 못했다는 기억', coreFear: '자신의 판단이 늦으면 누군가를 잃는다는 두려움', copingPattern: '위기에서 쉬지 않고 가장 위험한 역할을 먼저 맡았습니다', lifelongDilemma: '모두를 구할 수 없다는 현실과 누구도 포기하고 싶지 않은 마음이 충돌했습니다', deepestPain: '살아남았다는 안도와 죄책감을 동시에 품은 일', secretWish: '어떤 경고도 필요 없는 평범한 아침을 맞는 것' },
  { formativeWound: '믿었던 스승이 공을 가로채고 책임을 떠넘긴 경험', coreFear: '마음을 열면 이용당할 수 있다는 두려움', copingPattern: '중요한 감정은 기록하지 않고 혼자만 기억했습니다', lifelongDilemma: '다시 신뢰할지 혼자 완벽해질지 오래 망설였습니다', deepestPain: '뒤늦게 진심을 보인 사람에게 끝내 답하지 못한 일', secretWish: '경계하지 않고 누군가와 일을 나누는 것' },
  { formativeWound: '어린 동생을 지켜야 했지만 병을 막지 못한 경험', coreFear: '사랑하는 만큼 더 큰 상실을 겪게 된다는 두려움', copingPattern: '다정함을 말보다 준비와 돌봄으로만 표현했습니다', lifelongDilemma: '새로운 관계를 받아들이는 일과 다시 잃지 않으려 거리를 두는 일 사이에 머물렀습니다', deepestPain: '마지막 순간에 해 주지 못한 말이 남은 일', secretWish: '떠날 걱정 없이 한 사람과 같은 계절을 반복하는 것' },
  { formativeWound: '가족의 기대와 다른 재능을 숨겨야 했던 시절', coreFear: '진짜 모습을 보이면 사랑과 자리를 잃는다는 두려움', copingPattern: '낮에는 요구받은 역할을, 밤에는 원하는 일을 몰래 이어 갔습니다', lifelongDilemma: '의무를 다하는 삶과 자신의 이름으로 사는 삶 중 무엇을 택할지 고민했습니다', deepestPain: '자신의 작품을 다른 사람의 이름으로 세상에 내보낸 일', secretWish: '가장 아끼는 일을 숨기지 않고 보여 주는 것' },
];

const backgroundAdds = ['아침마다 역할을 나누어 하루를 시작했습니다.', '서로 다른 생각을 듣는 시간이 있었습니다.', '작은 물건 하나를 아껴 쓰는 습관이 있었습니다.', '이웃의 도움으로 어려운 날을 넘겼습니다.', '계절이 바뀔 때 생활 방식도 조금 달라졌습니다.'];
const expandedFamilies = families.flatMap((item) => backgroundAdds.map((add) => ({ ...item, siblingStory: `${item.siblingStory} ${add}` })));
const expandedHomes = homes.flatMap((item) => backgroundAdds.map((add) => ({ ...item, homeAndResources: `${item.homeAndResources} ${add}` })));
const expandedInnerLives = innerLives.flatMap((item) => backgroundAdds.map((add) => ({ ...item, copingPattern: `${item.copingPattern} ${add}` })));

function stableIndex(seed: string, length: number) {
  let hash = 2_166_136_261;
  for (const character of seed) { hash ^= character.charCodeAt(0); hash = Math.imul(hash, 16_777_619); }
  return (hash >>> 0) % length;
}

export function selectLifeBackground(core: Pick<ResultCore, 'answerHash' | 'recordNo' | 'locationId' | 'personalityId'>) {
  const family = expandedFamilies[stableIndex(`${core.answerHash}:${core.recordNo}:family`, expandedFamilies.length)]!;
  const conditions = expandedHomes[stableIndex(`${core.answerHash}:${core.locationId}:conditions`, expandedHomes.length)]!;
  const innerLife = expandedInnerLives[stableIndex(`${core.answerHash}:${core.personalityId}:inner`, expandedInnerLives.length)]!;
  return { background: { ...family, ...conditions }, innerLife };
}
