import type { StorySignal } from './types.js';
import { storyCardsBatch02 } from './story-catalog-batch-02.js';
import { storyCardsBatch03 } from './story-catalog-batch-03.js';
import { storyCardsBatch04 } from './story-catalog-batch-04.js';
import { storyCardsBatch05 } from './story-catalog-batch-05.js';
import { storyCardsBatch06 } from './story-catalog-batch-06.js';
import { storyCardsBatch07 } from './story-catalog-batch-07.js';
import { storyCardsBatch08 } from './story-catalog-batch-08.js';
import { storyCardsBatch09 } from './story-catalog-batch-09.js';
import { storyCardsBatch10 } from './story-catalog-batch-10.js';
import { storyCardsBatch11 } from './story-catalog-batch-11.js';
import { storyCardsBatch12 } from './story-catalog-batch-12.js';
import { storyCardsBatch13 } from './story-catalog-batch-13.js';
import { storyCardsBatch14 } from './story-catalog-batch-14.js';
import { storyCardsBatch15 } from './story-catalog-batch-15.js';
import { storyCardsBatch16 } from './story-catalog-batch-16.js';
import { storyCardsBatch17 } from './story-catalog-batch-17.js';
import { storyCardsBatch18 } from './story-catalog-batch-18.js';
import { storyCardsBatch19 } from './story-catalog-batch-19.js';
import { storyCardsBatch20 } from './story-catalog-batch-20.js';
import { storyCardsBatch21 } from './story-catalog-batch-21.js';
import { storyCardsBatch22 } from './story-catalog-batch-22.js';
import { storyCardsBatch23 } from './story-catalog-batch-23.js';
import { storyCardsBatch24 } from './story-catalog-batch-24.js';
import { storyCardsBatch25 } from './story-catalog-batch-25.js';
import { storyCardsBatch26 } from './story-catalog-batch-26.js';
import { storyCardsBatch27 } from './story-catalog-batch-27.js';
import { storyCardsBatch28 } from './story-catalog-batch-28.js';
import { storyCardsBatch29 } from './story-catalog-batch-29.js';
import { storyCardsBatch30 } from './story-catalog-batch-30.js';
import { storyCardsBatch31 } from './story-catalog-batch-31.js';
import { storyCardsBatch32 } from './story-catalog-batch-32.js';
import { storyCardsBatch33 } from './story-catalog-batch-33.js';
import { storyCardsBatch34 } from './story-catalog-batch-34.js';
import { storyCardsBatch35 } from './story-catalog-batch-35.js';
import { storyCardsBatch36 } from './story-catalog-batch-36.js';
import { storyCardsBatch37 } from './story-catalog-batch-37.js';
import { storyCardsBatch38 } from './story-catalog-batch-38.js';
import { storyCardsBatch39 } from './story-catalog-batch-39.js';
import { storyCardsBatch40 } from './story-catalog-batch-40.js';
import { storyCardsBatch41 } from './story-catalog-batch-41.js';
import { storyCardsBatch42 } from './story-catalog-batch-42.js';
import { storyCardsBatch43 } from './story-catalog-batch-43.js';
import { storyCardsBatch44 } from './story-catalog-batch-44.js';
import { storyCardsBatch45 } from './story-catalog-batch-45.js';
import { storyCardsBatch46 } from './story-catalog-batch-46.js';
import { storyCardsBatch47 } from './story-catalog-batch-47.js';
import { storyCardsBatch48 } from './story-catalog-batch-48.js';
import { storyCardsBatch49 } from './story-catalog-batch-49.js';
import { storyCardsBatch50 } from './story-catalog-batch-50.js';
import { storyCardsBatch51 } from './story-catalog-batch-51.js';
import { storyCardsBatch52 } from './story-catalog-batch-52.js';
import { storyCardsBatch53 } from './story-catalog-batch-53.js';
import { storyCardsBatch54 } from './story-catalog-batch-54.js';
import { storyCardsBatch55 } from './story-catalog-batch-55.js';
import { storyCardsBatch56 } from './story-catalog-batch-56.js';
import { storyCardsBatch57 } from './story-catalog-batch-57.js';
import { storyCardsBatch58 } from './story-catalog-batch-58.js';
import { storyCardsBatch59 } from './story-catalog-batch-59.js';
import { storyCardsBatch60 } from './story-catalog-batch-60.js';
import { storyCardsBatch61 } from './story-catalog-batch-61.js';

export type StoryCard = {
  id: string;
  setting?: { worldName: string; year: string; polity: string; region: string; gender: '여성' | '남성' };
  name: string;
  home: string;
  identityLine: string;
  title: string;
  role: string;
  world: string;
  flavor: string;
  signals: readonly StorySignal[];
  opening: string;
  life: string;
  turn: string;
  decision: string;
  cost: string;
  after: string;
  presentEcho: string;
  secondLook: string;
  unresolved: string;
  readerQuestion: string;
  signalMoments: Partial<Record<StorySignal, string>>;
  rare?: true;
};

// Each card owns its character's circumstances. Answers influence the scene and echo,
// never invent a diagnosis or claim the user's present life was caused by a past one.
const storyCardsBatch01: readonly StoryCard[] = [
  {
    id: 'CLOWN', name: '루보', home: '바람골 장터', identityLine: '그 삶에서 당신은 바람골 장터에서 공연하던 광대 루보였습니다. 사람들이 조용해질 때면 누구보다 먼저 무대에 오르던 사람이었죠.', title: '가장 늦게 웃은 광대', role: '시장 광대', world: '어느 오래된 시장', flavor: '웃음', signals: ['speak', 'connect', 'release'],
    opening: '그날 시장에서 가장 늦게 웃은 사람은 광대인 당신이었습니다.',
    life: '사람들이 조용해지면 당신은 늘 먼저 무대에 올랐어요. 웃음이 끊기면 자기 차례가 끝난 것만 같았거든요. 동료는 그 버릇을 누구보다 잘 알았습니다.',
    turn: '공연 날, 동료가 당신을 객석 맨 앞 의자에 앉혔습니다. 무대에는 당신 신발보다 세 배쯤 큰 신발이 놓였죠. 동료가 한쪽 발을 넣자 신발만 무대에 남고 발은 양말째 앞으로 미끄러졌습니다. 그는 신발을 향해 “오늘은 네가 주인공이야?” 하고 따졌어요.',
    decision: '당신은 습관처럼 일어나 무대를 구하려 했지만, 동료가 손짓했습니다. “오늘은 여기서 봐.” 당신은 잠깐 손을 무릎 위에 얹고, 객석에서 그 장난의 다음을 기다렸습니다.',
    cost: '준비한 자기 장면 하나는 못 했습니다. 그러나 남이 준비한 웃음을 끝까지 받은 건 처음이었어요.',
    after: '집 앞에서 신발을 벗다가, 당신은 낮의 무대를 떠올리고 혼자 피식 웃었습니다. 내일은 첫 농담을 동료에게 맡겨 볼까, 신발 한 짝을 든 채 잠깐 생각했죠.',
    presentEcho: '늘 먼저 웃음을 건네는 사람에게도, 가끔은 객석에 앉고 싶은 날이 있을지 모릅니다.',
    secondLook: '동료는 당신이 못 웃어서가 아니라, 늘 웃길 차례를 먼저 차지한다는 걸 봤습니다. 그래서 장난의 주인공을 신발로 바꾸고 당신에게 객석 한 자리를 남겼죠.',
    unresolved: '내일의 공연에서는 당신이 다시 무대에 오를 겁니다. 그렇지만 꼭 매번 첫 농담을 맡아야 하는지는 아직 정하지 않았어요.',
    readerQuestion: '누군가를 즐겁게 한 날, 내가 웃을 자리는 있었나요?',
    signalMoments: { speak: '당신은 먼저 “저 신발이 우리보다 공연을 잘하겠는데?” 하고 받아쳤습니다. 객석의 웃음이 동료의 다음 동작을 열었죠.', connect: '당신은 옆자리 아이에게 “저 신발, 어디로 갈까?” 하고 물었습니다. 아이가 가리킨 방향으로 동료가 비틀거리며 걸어갔어요.', release: '당신은 무대에 뛰어들려던 손을 멈췄습니다. 오늘의 장면을 동료에게 맡기기로 한 거죠.' },
  },
  {
    id: 'ROOM7', name: '이루', home: '비돌개 고개', identityLine: '그 삶에서 당신은 비돌개 고개에서 작은 여관을 지키던 이루였습니다. 손님을 맞으며 살았지만 7번 방만은 늘 비워 두었죠.', title: '7번 방의 두 번째 박수', role: '여관 주인', world: '비 오는 길목의 여관', flavor: '조용한 미스터리', signals: ['rest', 'connect', 'notice'],
    opening: '비어 있는 7번 방에서는 밤마다 박수 소리가 났습니다.',
    life: '여관 주인인 당신은 그 방을 손님에게 내주지 않았어요. 천식이 있던 당신에게 계단을 오르내린 뒤 혼자 쉬는 시간은 필요했습니다. 그렇다고 사람을 싫어한 것은 아니었죠.',
    turn: '어느 밤 손님이 문틈으로 방을 보았습니다. 방 안에서는 나무 인형 둘이 서로 부딪히고 있었어요. 문밖에서 박수처럼 들리던 소리였죠. 당신은 혼자 인형극을 연습하고 있었습니다.',
    decision: '손님은 이유를 캐묻지 않고 옆에 앉아 종이로 인형의 작은 모자를 접었습니다. 당신은 그날 공연은 혼자 마쳤지만, 다음 날을 위해 의자 하나를 더 놓아 두었습니다.',
    cost: '방 하나를 빌려줄 기회는 놓쳤습니다. 또 누군가를 들이면 혼자 쉬던 시간도 조금 달라질 겁니다.',
    after: '다음 밤 인형들이 부딪힐 때는 나무 소리가, 막이 내린 뒤에는 손님의 손에서 진짜 박수가 났습니다. 두 소리를 당신은 이제 구별할 수 있었어요.',
    presentEcho: '혼자 숨을 고르는 자리와 누군가를 들일 자리가 꼭 서로를 밀어내지는 않을지도 모릅니다.',
    secondLook: '7번 방을 비워 둔 이유는 숨을 고를 자리와 혼자만의 놀이터가 필요해서였습니다. 그 방에 의자 하나를 더 놓는 일은 방을 포기하는 것과 달랐죠.',
    unresolved: '손님은 언제까지 머물지 모릅니다. 빈 의자를 다시 혼자 보게 되는 밤도 오겠지만, 그날의 박수까지 없어지는 것은 아니에요.',
    readerQuestion: '혼자만의 시간을 지키면서 누군가를 들일 수 있는 작은 자리가 있을까요?',
    signalMoments: { rest: '당신은 문을 바로 열지 않고 잠시 숨을 골랐습니다. 손님도 재촉하지 않고 문밖에서 기다렸죠.', connect: '당신은 손님에게 작은 인형 하나를 건넸습니다. 손님은 대사 대신 인형 모자를 먼저 만들었어요.', notice: '당신은 문밖의 손님이 박수 소리를 흉내 내는 대신, 나무가 부딪히는 박자를 맞추고 있다는 걸 알아챘습니다.' },
  },
  {
    id: 'BLANK_ORDER', name: '세아', home: '안개성', identityLine: '그 삶에서 당신은 안개성의 왕궁 서기관 세아였습니다. 명령 한 줄이 누군가의 내일을 바꿀 수 있어 종이를 두 번씩 읽던 사람이었죠.', title: '글자 없는 왕명', role: '왕궁 서기관', world: '비 내리는 성문', flavor: '선택의 긴장', signals: ['notice', 'speak', 'protect'],
    opening: '성문이 닫히던 밤, 당신이 읽어야 할 왕명에는 글자가 하나도 없었습니다.',
    life: '당신은 왕궁에서 명령을 베껴 쓰는 사람이었어요. 글자 하나만 잘못 옮겨도 사람들의 길이 달라질 수 있어, 종이를 늘 두 번 살폈습니다.',
    turn: '성문 밖에는 비를 피하려는 사람들이 모여 있었습니다. 관리가 도장 찍힌 종이를 내밀며 문을 닫으라고 읽으라 했죠. 하지만 앞뒤 어디에도 도장 말고는 없었습니다. 문지기는 마지막 빗장을 들고 기다렸습니다.',
    decision: '당신은 종이를 높이 들었습니다. “여기에는 문을 닫으라는 말이 없습니다.” 안쪽의 식량 걱정도 사실이기에 큰문을 열자고만 할 수는 없었어요. 당신은 옆문으로 들어오는 사람의 이름을 적고 자기 이름을 맨 위에 쓰겠다고 했습니다.',
    cost: '옆문은 늦게 열렸고, 모두를 한꺼번에 들이지는 못했습니다. 다음 날 당신 책상에는 다른 서기관이 앉아 있었어요.',
    after: '손가락에 남은 잉크를 지우며 당신은 빈 종이도 사람을 움직일 수 있다는 걸 생각했습니다. 다만 그 종이를 어떻게 읽을지는 결국 누군가의 몫이었죠.',
    presentEcho: '모두가 확신하는 말 앞에서 종이를 한 번 더 뒤집어 보고 싶어지는 마음도 있습니다.',
    secondLook: '관리의 식량 걱정은 거짓말이 아니었습니다. 거짓은 그 걱정을 왕명이라는 글자로 꾸미려 했던 순간에 생겼죠.',
    unresolved: '옆문으로 들어온 사람들의 내일은 여전히 불확실합니다. 당신도 자리를 잃었지만, 이름을 적은 종이는 성문 안에 남아 있었어요.',
    readerQuestion: '모두가 정답을 아는 듯 말할 때, 내가 직접 확인하고 싶은 한 가지는 무엇인가요?',
    signalMoments: { notice: '당신은 도장이 찍힌 면뿐 아니라 젖은 종이의 뒷면까지 확인했습니다. 글자는 끝내 나오지 않았어요.', speak: '당신은 먼저 문지기에게 종이를 보여주며 “이 말이 정말 적혀 있나요?” 하고 물었습니다.', protect: '밖에서 떨고 있는 아이를 본 당신은 문지기에게 안쪽 창고에 남은 식량이 얼마인지 물었습니다. 열어야 할 문과 지켜야 할 밥을 함께 생각했죠.' },
  },
  {
    id: 'SILENT_BELL', name: '다온', home: '갈대강 마을', identityLine: '그 삶에서 당신은 갈대강 마을의 탐정 다온이었습니다. 잃어버린 물건보다 마지막으로 그것을 본 사람의 이야기를 먼저 찾았죠.', title: '사라진 종소리', role: '마을 탐정', world: '강가의 작은 마을', flavor: '추리', signals: ['notice', 'connect', 'speak'],
    opening: '종은 제자리에 있었는데, 마을 사람들은 종소리가 사라졌다고 했습니다.',
    life: '당신은 잃어버린 것을 찾는 일을 했습니다. 물건보다 사람들이 마지막으로 어디를 보았는지 묻는 편이 더 빨랐죠.',
    turn: '종 아래에는 새 밧줄이 묶여 있었고, 울리는 추에는 천이 감겨 있었습니다. 밤에 몰래 강을 건너는 사람을 돕느라 소리를 막은 걸까요? 당신은 천 안쪽에 적힌 작은 글씨를 발견했지만, 젖어서 바로 읽을 수는 없었습니다.',
    decision: '당신은 범인을 찾겠다며 집집마다 문을 두드리지 않았습니다. 천을 말려 펼치자 “저녁에는 아기가 잠듭니다”라는 글씨가 나왔어요. 당신은 마을 사람들을 불러 종이 필요한 때를 물었습니다. 낮에는 길을 알려 주고, 밤에는 잠을 지키기로 했죠.',
    cost: '누가 종을 건드렸는지 끝내 밝히지 않아 당신을 답답해하는 사람도 있었습니다.',
    after: '다음 날 낮에 종이 울렸습니다. 당신은 소리가 돌아온 것보다, 서로 듣지 못하던 말이 들린 게 더 오래 기억났어요.',
    presentEcho: '답을 찾아낸 뒤에야 처음 들리는 사정이 있을지도 모릅니다.',
    secondLook: '종을 찾는 일은 쉬웠습니다. 어려웠던 것은 왜 누군가 그 소리를 숨기고 싶었는지 듣는 일이었죠.',
    unresolved: '낮에만 울리는 종이 모두에게 완벽한 답은 아닙니다. 밤에 길을 잃는 사람이 생기면 마을은 다시 의논해야 할 거예요.',
    readerQuestion: '내가 알아낸 사실 뒤에 아직 듣지 않은 사정이 있을까요?',
    signalMoments: { notice: '당신은 새 밧줄보다 추에 감긴 천 끝의 글씨를 먼저 살폈습니다.', connect: '당신은 강을 건너는 사람과 종 가까이 사는 사람을 함께 불렀습니다.', speak: '당신은 누군가를 탓하기 전에 “왜 천을 감았는지부터 알아보자”고 말했습니다.' },
  },
  {
    id: 'NIGHT_GUIDE', name: '마루', home: '솔등 산골', identityLine: '그 삶에서 당신은 솔등 산골의 밤길 안내자 마루였습니다. 남을 집까지 데려다주는 동안 자기 집의 불빛도 잊지 못하던 사람이었죠.', title: '마지막 길의 안내자', role: '밤길 안내자', world: '병이 돌던 산골 마을', flavor: '생존과 연대', signals: ['protect', 'connect', 'rest'],
    opening: '모두를 집으로 데려다준 밤, 당신만 아직 길 위에 있었습니다.',
    life: '병이 돌던 마을에서 당신은 밤길을 아는 몇 안 되는 사람이었습니다. 누구를 먼저 데려다줄지 정할 때마다 마음이 무거웠죠. 집에는 당신을 기다리는 가족도 있었습니다.',
    turn: '마지막 등불을 든 아이가 갈림길에서 멈췄습니다. 지름길의 좁은 다리는 비에 젖어 흔들렸고, 돌아가는 길은 등불이 꺼지기 전에 다 걸을 수 있을지 알 수 없었어요. 집에는 당신 가족도 기다리고 있었습니다.',
    decision: '당신은 아이에게 “나도 저 다리는 무서워”라고 말하고 돌아가는 길을 골랐습니다. 한 사람은 등불을 들고, 다른 사람은 바람을 손으로 가리며 걸었죠. 아이가 집에 들어간 뒤 당신은 돌 위에 잠깐 앉아 자기 집 불빛을 찾았습니다.',
    cost: '당신은 약속한 시각보다 한참 늦게 집에 닿았습니다. 가족을 기다리게 한 미안함은 쉽게 사라지지 않았어요.',
    after: '문을 열자 가족이 물 한 컵을 내밀었습니다. 그 밤 당신은 누군가를 돌보는 사람도 돌아갈 곳을 바란다는 사실을 오래 붙들었습니다.',
    presentEcho: '누군가를 끝까지 챙기고 싶은 마음과 나도 돌아가 쉬고 싶은 마음은 함께 있을 수 있습니다.',
    secondLook: '당신이 마지막 길을 택한 것은 겁이 없어서가 아닙니다. 아이의 발과 자기 집 문을 둘 다 떠올렸기에 속도를 늦춘 거였죠.',
    unresolved: '늦게 돌아온 까닭을 가족에게 설명해야 했습니다. 돌봄은 밤길이 끝난 뒤에도 서로의 시간을 헤아리는 일로 이어졌어요.',
    readerQuestion: '다른 사람을 챙길 때 내게도 필요한 것은 무엇일까요?',
    signalMoments: { protect: '당신은 아이보다 먼저 젖은 돌을 밟아 보고 안전한 쪽으로 손을 내밀었습니다.', connect: '당신은 아이에게 등불을 함께 들자고 했습니다. 빛이 두 사람 사이에서 흔들렸어요.', rest: '당신은 갈림길에서 무리해 걷지 않고 잠시 멈춰 아이와 따뜻한 물을 나눠 마셨습니다.' },
  },
  {
    id: 'MIRROR', name: '모아', home: '비늘빛 골목', identityLine: '그 삶에서 당신은 비늘빛 골목의 거울 수선공 모아였습니다. 남의 깨진 거울은 이어 붙이면서 자기 거울의 빈칸은 오래 바라보던 사람이었죠.', title: '마지막 조각의 얼굴', role: '거울 수선공', world: '거울이 말을 건네는 골목', flavor: '기묘한 동화', signals: ['repair', 'notice', 'release'],
    opening: '당신은 남의 거울은 모두 고쳤지만 자기 거울만 맞출 수 없었습니다.',
    life: '깨진 거울 조각을 이어 붙이는 일을 했어요. 당신의 작업대는 창문 앞에 있었지만, 늘 거울을 세워 두어 바깥을 볼 틈이 없었습니다.',
    turn: '어느 날 자신의 거울을 붙이자 눈과 입이 서로 다른 방향을 보였어요. 빠진 조각을 찾던 당신은 빈틈 사이로 누군가 손을 흔드는 걸 봤습니다. 거울 뒤 창밖의 아이였습니다. 아이가 입 모양으로 말했죠. “그 틈으로도 보여요!”',
    decision: '당신은 빠진 조각을 다시 끼우지 않고 거울을 창문 앞에 그대로 두었습니다. 낮에는 빈틈으로 골목의 하루가 보였어요. 처음에는 어색했지만, 자기 얼굴만 보던 자리에서 밖을 바라보게 됐습니다.',
    cost: '예전처럼 한 장의 반듯한 거울은 갖지 못했습니다.',
    after: '해 질 무렵, 당신은 비친 얼굴보다 거울 뒤 창밖에서 손을 흔드는 아이를 먼저 봤습니다. 자신을 보는 방법이 하나일 필요는 없을지도 몰랐죠.',
    presentEcho: '완벽하게 맞추려던 틈에서 뜻밖에 바깥이 보이는 날도 있습니다.',
    secondLook: '당신은 수선이 실패했다고 여겼지만, 창밖 아이는 거울의 빈틈에서 먼저 당신을 봤습니다. 같은 틈이 한 사람에게는 흠이고 다른 사람에게는 인사할 자리였죠.',
    unresolved: '거울은 여전히 반듯하지 않습니다. 내일 아침에는 다시 맞추고 싶어질 수도 있지만, 오늘은 그 틈으로 골목을 보았어요.',
    readerQuestion: '맞추려 애쓰던 것에 다른 쓰임이 있다면 어떤 모습일까요?',
    signalMoments: { repair: '당신은 조각을 끼워 보다가 창밖 아이의 손이 가려지는 것을 보고 다시 빼냈습니다.', notice: '당신은 거울 속 자기 얼굴 사이로, 바깥 아이의 손이 실제로 보인다는 걸 알아챘습니다.', release: '당신은 마지막 조각을 끼우려던 손을 멈췄습니다. 아이의 손이 보이는 빈틈을 남겨 두었죠.' },
  },
  {
    id: 'HERBALIST', name: '라비', home: '안개숲 마을', identityLine: '그 삶에서 당신은 안개숲 마을의 약초지기 라비였습니다. 비가 오기 전에 산길과 물길을 살피는 일이 몸에 밴 사람이었죠.', title: '빨간 실의 비밀', role: '약초지기', world: '안개 낀 동화 속 마을', flavor: '두려움과 진실', signals: ['notice', 'protect', 'speak'],
    opening: '마을의 모든 문에 빨간 실이 묶인 아침, 사람들은 당신을 마법사라고 불렀습니다.',
    life: '당신은 산에서 약초를 돌보며 살았어요. 비 오기 전 약초를 옮기느라 하늘과 물길을 자주 살폈죠. 마을 사람들은 당신이 남보다 먼저 날씨를 아는 걸 이상하게 여겼습니다.',
    turn: '사람들이 당신 집 앞에 모였을 때, 비가 쏟아지기 시작했습니다. 빨간 실이 묶인 문 앞에만 물이 먼저 고였어요. 그때 겁먹은 아이가 몰래 쓴 쪽지가 당신 손에 들어왔습니다. 아이는 왜 그 문들을 표시했을까요?',
    decision: '당신은 아이를 끌어내지 않았습니다. 쪽지에는 “문턱이 낮은 집이에요. 비 오기 전에 알려 주고 싶었어요”라고 적혀 있었죠. 당신은 같은 실을 자기 문에도 묶고, 사람들이 젖은 문턱을 보게 했습니다. 아이는 뒤늦게 나와 자신이 표시했다고 말했습니다.',
    cost: '오해가 풀렸다고 모두 곧바로 다정해지지는 않았습니다. 아이도 처음엔 당신을 혼자 두었다며 미안해했죠.',
    after: '다음 비가 온 날, 사람들은 빨간 실이 달린 문부터 모래주머니를 놓았습니다. 당신은 그 일에 아이와 함께 손을 보탰습니다.',
    presentEcho: '오해를 풀고 싶은 마음과 누군가를 먼저 지키고 싶은 마음은 같은 날에도 생길 수 있습니다.',
    secondLook: '아이가 실을 묶은 까닭을 모르는 동안, 사람들은 익숙하게 의심하던 사람에게 답을 구했습니다. 진실을 보여주는 일은 아이를 희생시키는 일과 같지 않았어요.',
    unresolved: '사람들의 시선은 한 번에 바뀌지 않았습니다. 다음 비가 올 때 누가 먼저 당신 문을 두드릴지는 아직 모릅니다.',
    readerQuestion: '오해를 풀고 싶을 때, 함께 지키고 싶은 사람은 누구인가요?',
    signalMoments: { notice: '당신은 실이 묶인 집마다 문턱이 낮다는 공통점을 알아챘습니다.', protect: '당신은 아이 이름이 적힌 쪽지를 접어 주머니에 넣었습니다. 먼저 아이를 사람들 앞에 세우지 않았어요.', speak: '당신은 사람들에게 “비가 어디로 흐르는지 먼저 보세요”라고 말했습니다. 아이 이름은 아직 꺼내지 않았죠.' },
  },
  {
    id: 'DRAGON_DREAM', name: '오르', home: '잠든 용의 도서관', identityLine: '그 삶에서 당신은 잠든 용의 도서관에 살던 꿈 기록자 오르였습니다. 밤마다 용이 부르는 이름을 책에 옮겨 적었죠.', title: '용의 꿈에서 지워진 이름', role: '꿈 기록자', world: '잠든 용의 도서관', flavor: '경이로운 미스터리', signals: ['notice', 'connect', 'release'],
    opening: '잠든 용의 꿈을 적던 날, 책에서 당신 이름만 사라졌습니다.',
    life: '당신은 용이 잠꼬대로 부르는 이름을 밤마다 책에 적었습니다. 누군가의 꿈에 남는 것이 오래 사는 일처럼 느껴졌어요.',
    turn: '그날 용은 이름 대신 작은 종소리를 반복했습니다. 당신은 책장이 젖은 줄 알았지만, 다른 이름은 멀쩡했죠. 창가에 달린 종을 울리자 용은 처음으로 꿈속에서 “이제 네가 깨워 줘”라고 말했습니다.',
    decision: '당신은 빈 칸을 남겨 두고 종을 한 번 더 울렸어요. 용은 눈을 뜨지 않았지만 깊게 숨을 쉬었고, 밤새 이어지던 악몽은 멎었습니다.',
    cost: '그 책을 읽는 사람은 당신이 거기 있었다는 것을 모를 겁니다.',
    after: '아침에 도서관을 나서며 당신은 종을 만져 봤어요. 이름이 남지 않은 밤에도 자신이 한 일은 사라지지 않았습니다.',
    presentEcho: '누가 알아주지 않아도 내가 했던 작은 일을 오래 기억하는 때가 있습니다.',
    secondLook: '당신은 이름이 지워진 것을 버려졌다는 뜻으로 읽었습니다. 그러나 용의 꿈은 누가 종을 울릴지 묻고 있었죠.',
    unresolved: '빈 칸은 그대로 남았습니다. 다음 기록자가 거기에 무엇을 쓸지는 알 수 없지만, 당신은 종을 제자리에 걸어 두었어요.',
    readerQuestion: '이름이 남지 않아도 내가 한 일의 의미가 사라지지 않는 순간은 언제일까요?',
    signalMoments: { notice: '당신은 사라진 이름보다 책장에 반복된 종 모양을 먼저 보았습니다.', connect: '당신은 혼자 기록을 고집하지 않고 옆 방의 종지기에게 꿈 이야기를 들려주었습니다.', release: '당신은 자기 이름을 빈 칸에 다시 쓰려던 손을 거뒀습니다.' },
  },
  {
    id: 'LAST_SIGNAL', name: '한결', home: '여울호 우주선', identityLine: '그 삶에서 당신은 먼 별로 향하는 여울호 우주선의 통신 기록관 한결이었습니다. 답장이 오지 않은 칸도 지우지 않던 사람이었죠.', title: '오지 않은 답장', role: '우주선 통신 기록관', world: '먼 별을 향하던 우주선', flavor: '고독과 수수께끼', signals: ['connect', 'notice', 'speak'],
    opening: '당신은 도착하지 않은 답장을 매일 정리하는 기록관이었습니다.',
    life: '우주선이 먼 별로 갈수록 지구의 답장은 늦어졌어요. 당신은 수신 시각이 비어 있는 줄도 버리지 않았습니다.',
    turn: '어느 날 비어 있던 칸에 소리 없는 신호가 찍혔습니다. 고장이라 여겼지만 간격은 오래전 당신이 보낸 노래의 박자와 같았죠. 답장이 아니라 우주선 밖에서 반사되어 돌아온 옛 신호였습니다.',
    decision: '당신은 그 신호를 누군가의 목소리라고 꾸미지 않았어요. 대신 “아직 여기 있다”고 새 메시지를 보냈습니다. 동료가 옆에 앉아 마지막 문장을 함께 읽어 주었죠.',
    cost: '그 메시지에도 답이 올지 알 수 없었습니다.',
    after: '전송 표시가 꺼진 뒤에도 당신은 빈 칸을 지우지 않았습니다. 기다리는 일과 먼저 말하는 일은 함께 있을 수 있었어요.',
    presentEcho: '답이 없을까 봐 망설이면서도 먼저 한마디를 남겨 보고 싶은 순간이 있습니다.',
    secondLook: '옛 노래가 돌아왔을 때 당신은 답장을 찾았다고 말할 수 있었습니다. 하지만 반사된 자기 신호를 다른 사람의 목소리로 꾸미지 않았어요.',
    unresolved: '새 메시지에도 답이 없을지 모릅니다. 다만 이번 빈 칸은 아무 말도 못 한 자리가 아니라, 이미 한마디를 보낸 뒤의 자리였죠.',
    readerQuestion: '답을 기다리면서 내가 먼저 전하고 싶은 말은 무엇인가요?',
    signalMoments: { connect: '당신은 동료를 불러 신호의 박자를 함께 들었습니다. 둘은 한동안 아무 말도 하지 않았어요.', notice: '당신은 신호의 간격을 오래된 노래 기록과 하나씩 대조했습니다.', speak: '당신은 먼저 짧은 인사를 녹음하고, 그 뒤에 정말 전하고 싶던 문장을 덧붙였습니다.' },
  },
  {
    id: 'SHADE_TENT', name: '이로', home: '낮별 행성', identityLine: '그 삶에서 당신은 밤이 오지 않는 낮별 행성의 천막 배달자 이로였습니다. 사람들이 잠들 수 있도록 빛을 가리는 천막을 빌려주었죠.', title: '구멍 난 그늘', role: '그늘 천막 배달자', world: '밤이 오지 않는 행성', flavor: '낯선 세계의 장난', signals: ['repair', 'rest', 'release'],
    opening: '밤이 오지 않는 별에서, 당신은 잠들 시간을 배달했습니다.',
    life: '당신이 빌려주는 두꺼운 천막 안에서는 햇빛을 피하고 잘 수 있었어요. 작은 구멍도 그냥 두지 않았습니다. 빛이 새면 잠을 설칠 수 있으니까요.',
    turn: '돌아온 천막에는 구멍 일곱 개가 있었습니다. 빌려 간 아이가 허락 없이 낸 것이었죠. 당신이 안에 앉자 바닥에 점 일곱 개가 맺혔습니다. 아이는 책에서 본 밤하늘을 흉내 낸 거였습니다.',
    decision: '당신은 아이에게 빌린 물건을 바꾸기 전에는 물어야 한다고 말했습니다. 아이는 실을 가져와 함께 수선했어요. 잠이 필요한 사람을 위해 큰 구멍은 모두 막고, 작은 빛 몇 개를 남길지 두 사람은 누워서 직접 시험했습니다.',
    cost: '수선 때문에 다음 손님에게 천막을 늦게 가져다주고 직접 사과해야 했습니다.',
    after: '아이를 보낸 뒤 당신은 천막 안에 다시 앉았습니다. 달라진 천을 마음에 들어 하면서도 원래처럼 어둡던 천막이 조금 그리웠어요.',
    presentEcho: '아끼던 모양이 달라져 속상한 마음과 새 모습이 마음에 드는 마음은 함께 남을 수 있습니다.',
    secondLook: '아이에게 별은 선물이었지만, 누군가에게는 잠을 깨우는 구멍이었습니다. 당신은 둘 중 하나만 옳다고 정하지 않고 천막 안에 직접 누워 봤죠.',
    unresolved: '다음 손님은 세 개의 작은 빛도 싫어할 수 있습니다. 그래서 별이 있는 천막을 원하는지 먼저 물을 생각이에요.',
    readerQuestion: '아끼던 것을 바꿀 때, 누구의 허락이나 마음을 먼저 살펴야 할까요?',
    signalMoments: { repair: '당신은 빛이 가장 많이 새는 구멍부터 기웠습니다. 아이는 실의 반대편을 잡았어요.', rest: '당신은 수선을 시작하기 전 천막 아래 누워 눈을 감았습니다. 얼마나 밝은지 직접 느껴 봐야 했죠.', release: '당신은 일곱 구멍을 모두 없애려던 계획을 접고, 잠을 방해하지 않는 작은 빛만 남겼습니다.' },
  },
  {
    id: 'REVERSE_MAP', name: '누리', home: '물방울 바다', identityLine: '그 삶에서 당신은 물방울 바다의 길잡이 누리였습니다. 물이 하늘로 솟는 항로를 누구보다 잘 안다고 믿던 사람이었죠.', title: '거꾸로 든 지도', role: '낮은 중력의 바다 길잡이', world: '물방울이 떠오르는 행성', flavor: '탐험과 발견', signals: ['explore', 'notice', 'connect'],
    opening: '바다 위에서 길을 잃은 사람은 지도가 아니라 당신이었습니다.',
    life: '당신은 중력이 약한 바다에서 길을 안내했어요. 파도가 위로 솟으면 작은 물방울이 공중에 오래 머물렀죠. 그 움직임만 보고도 섬을 찾을 수 있다고 믿었습니다.',
    turn: '여행자가 지도를 거꾸로 들고도 자꾸 오른쪽을 가리켰습니다. 당신은 웃으려다 멈췄어요. 지도에 찍힌 점들의 간격이 섬의 자리가 아니라, 하늘에 떠 있는 물방울 무리와 같았거든요. 물방울은 바람을 타고 섬 쪽으로 천천히 흘렀습니다.',
    decision: '당신은 익숙한 수평선 대신 머리 위의 물방울을 길잡이로 삼았습니다. 여행자는 지도를 계속 거꾸로 든 채 방향을 불렀어요.',
    cost: '빠른 길은 아니었습니다. 늦게 도착해 기다리던 사람들에게 이유를 설명해야 했죠.',
    after: '섬에 닿자 여행자가 지도를 바로 돌렸습니다. 방금 지나온 섬이 종이 위에서는 다시 엉뚱한 자리에 있었어요. 두 사람은 지도를 접고 동시에 고개를 들었습니다. 머리 위 물방울은 아직도 길을 그리고 있었죠.',
    presentEcho: '늘 길을 알려 주던 사람도 다른 사람에게 길을 묻는 날이 있습니다.',
    secondLook: '길잡이는 익숙한 길을 잘 알았지만, 그 익숙함 때문에 하늘에 떠 있는 물방울을 한동안 지도에서 빼놓았습니다.',
    unresolved: '다음 항해에도 모든 물방울이 같은 곳을 가리키지는 않을 겁니다. 그래도 두 사람은 위를 보는 방법을 하나 더 얻었어요.',
    readerQuestion: '익숙한 문제를 다른 방향에서 본다면 무엇이 먼저 보일까요?',
    signalMoments: { explore: '당신은 익숙한 항로를 벗어나 물방울이 향하는 쪽으로 먼저 배를 틀었습니다.', notice: '당신은 지도 점과 머리 위 물방울의 간격이 같다는 걸 하나씩 확인했습니다.', connect: '당신은 여행자에게 지도를 계속 들고 방향을 불러 달라고 부탁했습니다. 두 사람의 눈이 다른 곳을 봤죠.' },
  },
  {
    id: 'SHORE_ROCK', name: '파도틈', home: '바람턱 해안', identityLine: '그 삶에서 당신은 바람턱 해안에서 파도틈이라 불리던 바위였습니다. 수백 해 동안 같은 자리에서 파도와 소라를 맞았죠.', title: '해안가 바위의 마지막 웅덩이', role: '해안가의 바위', world: '오래된 바닷가', flavor: '뜻밖의 시점', signals: ['rest', 'protect', 'release'], rare: true,
    opening: '당신은 수백 해 동안 같은 자리에서 파도를 맞은 바위였습니다.',
    life: '움직이지 못하는 대신, 물이 빠질 때마다 몸의 작은 웅덩이에 남은 생명들을 지켜보았습니다. 소라 하나가 들어왔다 나가는 데도 계절이 걸린 듯했죠.',
    turn: '어느 큰 파도가 바위를 갈라 놓았습니다. 늘 물을 품던 홈이 바다 쪽으로 열리고, 웅덩이는 더는 남지 않았어요. 다음 썰물에 소라는 그 자리를 찾다가 멈췄습니다.',
    decision: '바위는 파도를 막거나 소라를 부를 수 없었습니다. 다만 갈라진 작은 조각이 모래 위에 남아 새 그늘을 만들었죠. 소라는 그 아래서 물이 다시 찰 때까지 기다렸습니다.',
    cost: '예전의 웅덩이는 돌아오지 않았습니다. 오랫동안 지켜 온 모양이 바뀌었어요.',
    after: '다음 파도는 갈라진 틈으로 지나갔습니다. 바위가 남긴 것은 처음과 같은 자리가 아니라, 누군가 잠시 머물 새 자리였습니다.',
    presentEcho: '원래 모습으로 돌아갈 수 없어도, 뜻밖에 누군가 머물 작은 그늘이 남을 수 있습니다.',
    secondLook: '바위가 소라를 구하려고 몸을 움직인 것은 아닙니다. 깨진 뒤에 생긴 그늘이 우연히 쉼터가 되었어요. 그 우연 때문에 오래된 웅덩이의 빈자리도 없어지지는 않았죠.',
    unresolved: '새 그늘도 언젠가는 달라질 겁니다. 바다는 한 모양을 영원히 보장하지 않지만, 한때 머문 자리의 기억은 남을 수 있어요.',
    readerQuestion: '오래 붙잡던 것이 달라진 뒤에도 남아 있는 작은 자리는 무엇일까요?',
    signalMoments: { rest: '파도가 빠진 뒤, 갈라진 조각 아래에는 한동안 물소리만 머물렀습니다.', protect: '조각이 만든 그늘 아래로 소라가 들어왔고, 다음 밀물까지 마르지 않았습니다.', release: '웅덩이 자리는 비었지만, 물길이 새 틈으로 흘러 모래를 적셨습니다.' },
  },
];

// A drafted life enters the live pool only after its layered art and result UI pass QA.
const promotedBatch02Ids = new Set(['FIREWORKS', 'TASTER', 'CLOUD_PAINTER', 'FESTIVAL_KING', 'SNOW_REFEREE', 'SHADOW_TAILOR', 'UNDERWATER_SCALE', 'DOORLESS_KEEPER', 'LOST_AUTUMN', 'THEATRE_VILLAIN', 'WINDMILL', 'HEAVY_BOX']);
const promotedBatch03Ids = new Set(['GRAVITY_SEEDS', 'PAID_LOSS', 'WARM_STONES', 'APOLOGY_COURIER', 'FIRST_FLIGHT_CAMERA', 'GYEONGSEONG_SHEARS', 'MOON_SIGNAL_WINDOW', 'TIDE_MARK', 'THIRD_KNOCK', 'MARKET_CAT_LOT']);
export const storyCards: readonly StoryCard[] = [
  ...storyCardsBatch01,
  ...storyCardsBatch02.filter(({ id }) => promotedBatch02Ids.has(id)),
  ...storyCardsBatch03.filter(({ id }) => promotedBatch03Ids.has(id)),
  ...storyCardsBatch04,
  ...storyCardsBatch05,
  ...storyCardsBatch06,
  ...storyCardsBatch07,
  ...storyCardsBatch08,
  ...storyCardsBatch09,
  ...storyCardsBatch10,
  ...storyCardsBatch11,
  ...storyCardsBatch12,
  ...storyCardsBatch13,
  ...storyCardsBatch14,
  ...storyCardsBatch15,
  ...storyCardsBatch16,
  ...storyCardsBatch17,
  ...storyCardsBatch18,
  ...storyCardsBatch19,
  ...storyCardsBatch20,
  ...storyCardsBatch21,
  ...storyCardsBatch22,
  ...storyCardsBatch23,
  ...storyCardsBatch24,
  ...storyCardsBatch25,
  ...storyCardsBatch26,
  ...storyCardsBatch27,
  ...storyCardsBatch28,
  ...storyCardsBatch29,
  ...storyCardsBatch30,
  ...storyCardsBatch31,
  ...storyCardsBatch32,
  ...storyCardsBatch33,
  ...storyCardsBatch34,
  ...storyCardsBatch35,
  ...storyCardsBatch36,
  ...storyCardsBatch37,
  ...storyCardsBatch38,
  ...storyCardsBatch39,
  ...storyCardsBatch40,
  ...storyCardsBatch41,
  ...storyCardsBatch42,
  ...storyCardsBatch43,
  ...storyCardsBatch44,
  ...storyCardsBatch45,
  ...storyCardsBatch46,
  ...storyCardsBatch47,
  ...storyCardsBatch48,
  ...storyCardsBatch49,
  ...storyCardsBatch50,
  ...storyCardsBatch51,
  ...storyCardsBatch52,
  ...storyCardsBatch53,
  ...storyCardsBatch54,
  ...storyCardsBatch55,
  ...storyCardsBatch56,
  ...storyCardsBatch57,
  ...storyCardsBatch58,
  ...storyCardsBatch59,
  ...storyCardsBatch60,
  ...storyCardsBatch61,
];

export function findStoryCard(id: string): StoryCard | undefined {
  return storyCards.find((card) => card.id === id);
}
