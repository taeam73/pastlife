import type { ResultCore } from '@pastlife/scoring';
import type { StoryProfile } from '../story-profile.js';

const namesByLocation: Record<string, readonly [string, string, string, string]> = {
  LOC_MESOPOTAMIA: ['아마라', '닌아', '에탄', '루갈'],
  LOC_GANGES: ['아샤', '니라', '아룬', '데브'],
  LOC_ABBASID: ['라일라', '마리암', '하산', '나딤'],
  LOC_VENICE: ['루치아', '비앙카', '마테오', '니콜로'],
  LOC_SWASHILI: ['아미나', '자라', '자바리', '바라카'],
  LOC_ANDES: ['킬라', '사미', '아마루', '인티'],
  LOC_STEPPE: ['사란', '알탄', '테무르', '바투'],
  LOC_POLYNESIA: ['히나', '마레바', '타네', '마우이'],
  LOC_HAN_CHANGAN: ['란', '잉', '웨이', '준'],
  LOC_HEIAN_KYO: ['아키코', '치요', '하루', '마사노리'],
  LOC_JOSEON_HANYANG: ['연화', '복순', '도윤', '성호'],
  LOC_MALI_TIMBUKTU: ['아미나타', '마리암', '바카리', '술레이만'],
  LOC_AZTEC_TENOCHTITLAN: ['쇼치틀', '아토토스틀리', '토날리', '야오틀'],
  LOC_OTTOMAN_ISTANBUL: ['아이셰', '파트마', '메흐메트', '케말'],
  LOC_EDO: ['오하루', '오키누', '신타로', '겐지'],
  LOC_INDUSTRIAL_HANSEONG: ['순옥', '정희', '재필', '창호'],
};

const favoritePlacesByLocation: Record<string, string> = {
  LOC_MESOPOTAMIA: '수로의 물소리가 낮게 들리는 성벽 그늘',
  LOC_GANGES: '해 질 녘 물안개가 피어나는 강가 나루',
  LOC_ABBASID: '종이와 먹 냄새가 남은 공방의 안뜰',
  LOC_VENICE: '저녁 종소리가 물 위로 번지는 운하의 돌계단',
  LOC_SWASHILI: '계절풍을 기다리는 배들이 보이는 산호석 부두',
  LOC_ANDES: '계단밭과 마을의 불빛이 함께 내려다보이는 언덕',
  LOC_STEPPE: '천막 뒤편에서 바람과 말의 숨소리를 들을 수 있는 낮은 언덕',
  LOC_POLYNESIA: '썰물 때만 드러나는 섬 북쪽의 얕은 암초',
  LOC_HAN_CHANGAN: '사람과 수레가 뜸해진 서쪽 시장의 성문 그늘',
  LOC_HEIAN_KYO: '도성 밖 논과 산기슭이 함께 보이는 하천 둑',
  LOC_JOSEON_HANYANG: '개천의 물소리와 시장의 망치 소리가 만나는 돌다리',
  LOC_MALI_TIMBUKTU: '필사본 냄새가 남은 모스크 옆 흙벽 회랑',
  LOC_AZTEC_TENOCHTITLAN: '꽃과 채소를 실은 카누가 지나는 조용한 수로',
  LOC_OTTOMAN_ISTANBUL: '보스포루스의 배와 언덕의 지붕이 보이는 부두 계단',
  LOC_EDO: '짐배와 빨랫배가 천천히 오가는 운하의 버드나무 아래',
  LOC_INDUSTRIAL_HANSEONG: '전차 종소리와 인쇄기 소리가 함께 들리는 성문 안 골목',
};

const appearances = [
  '햇볕에 그을린 얼굴과 웃을 때 먼저 가늘어지는 눈매를 지녔습니다',
  '작은 흉터가 눈썹 끝에 남아 있었고 손가락에는 일의 굳은살이 선명했습니다',
  '마른 체격이지만 걸음이 빨랐고 오래 집중할 때 입술을 살짝 다무는 버릇이 있었습니다',
  '넓은 어깨와 느린 걸음을 지녔으며 옷소매에는 늘 실밥이나 먹 자국이 묻어 있었습니다',
  '곱슬한 머리를 짧게 묶었고 사람을 볼 때 시선을 피하지 않는 인상이었습니다',
  '한쪽 다리를 조금 절었지만 움직임은 단정했고 낡은 겉옷을 깨끗하게 손질해 입었습니다',
];

const manners = [
  '목소리는 낮고 차분했으며 중요한 말을 하기 전 잠시 숨을 고르는 습관이 있었습니다',
  '평소에는 말수가 적었지만 웃을 때에는 주변 사람까지 안심시키는 힘이 있었습니다',
  '설명할 때 손으로 모양을 그렸고 상대가 이해했는지 눈을 맞추어 확인했습니다',
  '급한 순간일수록 말이 또렷해졌고 평상시에는 농담으로 긴장을 풀어 주었습니다',
];

const psychologies = [
  { temperament: '관찰한 뒤 움직이는 신중한 성향', complex: '정식 교육을 충분히 받지 못했다는 열등감 때문에 글을 남들 앞에서 읽을 때 손이 굳었습니다', socialMask: '모르는 것도 이미 이해한 듯 침착하게 행동했습니다', stressResponse: '압박이 커지면 말수가 줄고 주변의 숫자와 물건을 반복해서 확인했습니다' },
  { temperament: '사람의 감정에 빠르게 반응하는 다정한 성향', complex: '한쪽 귀가 잘 들리지 않는 사실을 들키면 무능하게 보일까 두려워했습니다', socialMask: '언제나 괜찮고 도움이 되는 사람처럼 웃었습니다', stressResponse: '갈등이 생기면 자기 잘못이 아닌 일까지 먼저 사과했습니다' },
  { temperament: '새로운 길을 시험해야 마음이 놓이는 독립적인 성향', complex: '가족과 다른 출신 배경이 드러나는 말투와 옷차림을 부끄러워했습니다', socialMask: '누구의 도움도 필요하지 않은 사람처럼 굴었습니다', stressResponse: '궁지에 몰리면 상의 없이 혼자 위험한 선택을 내렸습니다' },
  { temperament: '손에 잡히는 결과로 마음을 표현하는 완성주의 성향', complex: '어린 시절의 흉터와 서툰 걸음 때문에 사람들의 시선이 자신에게 머문다고 느꼈습니다', socialMask: '흠잡을 곳 없는 결과를 내면 약점도 보이지 않을 것처럼 일했습니다', stressResponse: '실패하면 잠을 줄여 같은 일을 처음부터 다시 했습니다' },
  { temperament: '분위기를 밝게 만들지만 속마음은 오래 감추는 성향', complex: '가난했던 집안과 빌린 물건을 들킬까 늘 신경 썼습니다', socialMask: '농담과 이야기로 다른 사람이 질문할 틈을 주지 않았습니다', stressResponse: '불안할수록 더 많은 약속을 잡고 혼자 있는 시간을 피했습니다' },
  { temperament: '규칙을 존중하되 부당함 앞에서는 완고해지는 성향', complex: '사람들 앞에서 목소리가 떨리는 것을 나약함이라 여겼습니다', socialMask: '감정을 배제한 원칙적인 사람처럼 말했습니다', stressResponse: '모욕이나 불공정을 겪으면 며칠 동안 그 장면을 되짚으며 반박할 문장을 만들었습니다' },
];

const hobbies = [
  '일이 끝난 뒤 버려진 재료로 작은 상자와 장난감을 만드는 일',
  '비 오는 날의 냄새와 날짜를 짧게 기록하는 일',
  '시장과 항구에서 낯선 지역의 말과 노래를 한 구절씩 배우는 일',
  '별의 위치와 바람의 방향을 자기만의 표식으로 그리는 일',
  '아이들에게 수수께끼와 오래된 이야기를 들려주는 일',
  '약초와 향신료를 말려 작은 주머니로 만드는 일',
  '강가나 언덕을 오래 걸으며 돌과 조개를 하나씩 모으는 일',
  '낡은 옷과 도구를 고쳐 원래 주인에게 돌려주는 일',
];

const dreams = [
  '누구나 자기 이름을 읽고 기록할 수 있는 작은 배움터를 여는 것',
  '가족과 동료가 계절마다 돌아와 쉴 수 있는 집을 짓는 것',
  '위험한 길과 안전한 물길을 모두 표시한 지도를 완성하는 것',
  '신분과 출신에 상관없이 기술을 배울 수 있는 공방을 만드는 것',
  '헤어진 가족의 이름과 행방을 모은 기록을 완성하는 것',
  '평생 일하지 않아도 되는 하루를 마련해 사랑하는 사람과 먼 곳을 걷는 것',
];

const dailyDetails = [
  { talent: '흩어진 단서에서 빠진 순서를 알아채는 능력', weakness: '자기 피로와 슬픔을 너무 늦게 알아차리는 점', favoritePlace: '사람들이 떠난 뒤 해 질 녘의 작업장 문턱', favoriteFood: '콩과 곡물을 오래 끓인 따뜻한 수프', dailyHabit: '아침마다 출입구와 도구의 수를 확인했습니다', belief: '기록되지 않은 사람도 사라진 사람은 아니라는 믿음' },
  { talent: '사람의 표정과 목소리에서 말하지 않은 걱정을 읽는 능력', weakness: '갈등을 피하려다 자신의 바람을 뒤로 미루는 점', favoritePlace: '바람이 잘 통하고 멀리 길이 보이는 언덕', favoriteFood: '꿀이나 말린 과일을 곁들인 얇은 빵', dailyHabit: '잠들기 전 그날 고마웠던 사람의 이름을 떠올렸습니다', belief: '돌봄은 빚이 아니라 다음 사람에게 건네는 순환이라는 믿음' },
  { talent: '손상된 도구와 관계에서 다시 쓸 수 있는 부분을 찾아내는 능력', weakness: '한번 맡은 책임을 타인에게 나누지 못하는 점', favoritePlace: '물소리와 사람 목소리가 함께 들리는 나루', favoriteFood: '소금과 향신료로 구운 생선 또는 채소', dailyHabit: '주머니에 작은 끈과 수선 도구를 넣어 다녔습니다', belief: '완벽한 새것보다 오래 고쳐 쓴 것에 사람의 시간이 남는다는 믿음' },
  { talent: '낯선 길에서도 방향과 반복되는 표식을 기억하는 능력', weakness: '안전하다는 확신이 없으면 결정을 지나치게 늦추는 점', favoritePlace: '밤하늘을 가리지 않는 성벽이나 해안', favoriteFood: '불에 구운 뿌리채소와 짭짤한 치즈', dailyHabit: '하루가 끝나면 다음 날의 경로를 손가락으로 세 번 짚었습니다', belief: '두려움은 멈추라는 명령이 아니라 더 자세히 보라는 신호라는 믿음' },
];

// 결과가 같은 문장만 반복되지 않도록 각 축에 읽기 쉬운 생활 장면 변형을 만든다.
const sceneVariants = (items: readonly string[], labels: readonly string[]) => items.flatMap((item) => labels.map((label) => {
  const firstSentence = item.trim().replace(/[.!?]+$/u, '');
  return `${firstSentence}. ${label.trim()}`;
}));
const expandedAppearances = sceneVariants(appearances, ['아침 빛에서 보인 모습이었습니다.', '일할 때 더 잘 드러나는 모습이었습니다.', '오래된 사진에도 남은 모습이었습니다.', '친한 사람만 알아본 모습이었습니다.', '계절에 따라 조금 달라진 모습이었습니다.']);
const expandedManners = sceneVariants(manners, ['처음 만난 사람에게도 같은 태도를 보였습니다.', '가까운 사람 앞에서는 조금 달라졌습니다.', '바쁜 날에도 이 습관을 지켰습니다.', '힘든 일이 생기면 이 모습이 더 뚜렷해졌습니다.', '시간이 지나도 쉽게 바뀌지 않았습니다.']);
const expandedHobbies = sceneVariants(hobbies, ['쉬는 날마다 이어 갔습니다.', '친구와 함께 즐겼습니다.', '혼자 있을 때 마음을 가라앉혔습니다.', '작은 도구만 있으면 할 수 있었습니다.', '누군가에게 배워 시작했습니다.']);
const expandedDreams = sceneVariants(dreams, ['그 꿈을 위해 작은 준비를 했습니다.', '끝까지 포기하지 않은 바람이었습니다.', '사람들과 나누고 싶은 꿈이었습니다.', '쉽지 않았지만 다시 생각한 꿈이었습니다.', '다음 세대에 남기고 싶은 꿈이었습니다.']);
const expandedDailyDetails = dailyDetails.flatMap((detail, index) => Array.from({ length: 5 }, (_, variant) => ({
  ...detail,
  talent: `${detail.talent}. ${['작은 일부터 시작했습니다.', '다른 사람의 도움도 받았습니다.', '매일 조금씩 연습했습니다.', '실수 뒤에 더 꼼꼼해졌습니다.', '배운 것을 주변에 나누었습니다.'][variant]}`,
})));

function stableIndex(seed: string, length: number) {
  let hash = 2_166_136_261;
  for (const character of seed) { hash ^= character.charCodeAt(0); hash = Math.imul(hash, 16_777_619); }
  return (hash >>> 0) % length;
}

export function selectLifeIdentity(core: Pick<ResultCore, 'answerHash' | 'recordNo' | 'locationId' | 'occupationId'>) {
  const names = namesByLocation[core.locationId] ?? namesByLocation.LOC_MESOPOTAMIA!;
  const identityIndex = stableIndex(`${core.answerHash}:${core.recordNo}:identity`, 4);
  const gender: StoryProfile['identity']['gender'] = identityIndex < 2 ? '여성' : '남성';
  const name = names[identityIndex]!;
  const detail = expandedDailyDetails[stableIndex(`${core.answerHash}:${core.occupationId}:daily`, expandedDailyDetails.length)]!;
  const psychology = psychologies[stableIndex(`${core.answerHash}:${core.occupationId}:psychology`, psychologies.length)]!;
  const dream = dreams[stableIndex(`${core.answerHash}:dream`, dreams.length)]!;
  const unrealizedDream = dreams[(stableIndex(`${core.answerHash}:unrealized`, dreams.length - 1) + 1) % dreams.length]!;
  return {
    identity: {
      fictional: true as const,
      name,
      gender,
      appearance: expandedAppearances[stableIndex(`${core.answerHash}:appearance`, expandedAppearances.length)]!,
      voiceAndManner: expandedManners[stableIndex(`${core.answerHash}:manner`, expandedManners.length)]!,
      ...psychology,
    },
    dailyLife: {
      occupationMeaning: '생계 수단이면서 공동체에서 자신의 자리를 증명하는 일이었습니다',
      hobby: expandedHobbies[stableIndex(`${core.answerHash}:hobby`, expandedHobbies.length)]!,
      ...detail,
      favoritePlace: favoritePlacesByLocation[core.locationId] ?? detail.favoritePlace,
      dream: expandedDreams[stableIndex(`${core.answerHash}:dream`, expandedDreams.length)]!,
      unrealizedDream: expandedDreams[stableIndex(`${core.answerHash}:unrealized`, expandedDreams.length)]!,
    },
  };
}
