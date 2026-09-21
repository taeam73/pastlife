import type { ContentProvenance, HistoricalSetting } from './types.js';

const accessedOn = '2026-09-21';
const source = (sourceTitle: string, sourceUrl: string, note: string): ContentProvenance => ({ sourceTitle, sourceUrl, accessedOn, note });
const met = (title: string, path: string, note: string) => source(title, `https://www.metmuseum.org/toah/${path}`, note);
const unesco = (title: string, id: number, note: string) => source(title, `https://whc.unesco.org/en/list/${id}`, note);

const baseHistoricalSettings: readonly HistoricalSetting[] = [
  {
    id: 'LOC_MESOPOTAMIA', eraId: 'ERA_ANCIENT_CIV', regionId: 'REG_MENA', label: '수메르 도시 국가', presentDayContext: '오늘날 이라크 남부', yearStart: -2900, yearEnd: -2000,
    affinityTags: ['knowledge', 'stability'], occupationIds: ['OCC_SCRIBE', 'OCC_MERCHANT', 'OCC_CEREMONIAL', 'OCC_FARMER'], fallback: true,
    dailyLifeNotes: ['도시의 식량과 물자는 신전·궁전 창고와 시장을 오가며 배분되었습니다', '점토판 기록과 원통 인장이 거래와 행정에 사용되었습니다', '운하의 물길 관리와 보리 수확이 도시 생존에 직접 연결되었습니다'],
    visual: { fallbackAssetKey: 'library/v3/mesopotamia-ur.jpg', environment: '갈대밭과 운하, 햇볕에 말린 벽돌 건물, 창고가 있는 수메르 도시', clothing: '양모 직물과 단순한 숄 형태의 옷', avoid: ['피라미드', '로마식 갑옷', '현대 아랍 복식'] }, reviewStatus: 'EDITORIAL_REVIEWED',
    provenance: [met('The Art of the First Cities in the Third Millennium B.C.', 'hd/trdm/hd_trdm.htm', '초기 도시, 교역, 기록 문화의 시대 배경'), source('Cuneiform tablet', 'https://www.metmuseum.org/art/collection/search/30000538', '신전 서기관이 유지한 장기 기록 전통')],
  },
  {
    id: 'LOC_GANGES', eraId: 'ERA_CLASSICAL', regionId: 'REG_SOUTH_ASIA', label: '마가다 문화권', presentDayContext: '오늘날 인도 비하르와 갠지스 중류', yearStart: -500, yearEnd: 300,
    affinityTags: ['spirituality', 'knowledge'], occupationIds: ['OCC_MERCHANT', 'OCC_CEREMONIAL', 'OCC_HEALER', 'OCC_FARMER'],
    dailyLifeNotes: ['강과 육로를 잇는 시장에서 곡물·직물·금속품이 거래되었습니다', '도시와 농촌의 생활은 계절풍과 강의 수위에 크게 좌우되었습니다', '여러 수행 전통과 교육 공동체가 왕국과 상업 도시 사이에서 성장했습니다'],
    visual: { fallbackAssetKey: 'library/v3/magadha-ganges.jpg', environment: '갠지스 지류의 나루와 목조 방책, 흙길 시장', clothing: '기후에 맞는 감아 입는 면직물과 얇은 숄', avoid: ['무굴 궁전', '현대 사리 고정형', '히말라야 설경'] }, reviewStatus: 'EDITORIAL_REVIEWED',
    provenance: [met('The Mauryan Empire', 'hd/maur/hd_maur.htm', '마우리아 시대의 국가·종교·미술 환경'), source('Nalanda Mahavihara', 'https://whc.unesco.org/en/list/1502', '비하르 지역의 장기 교육·수행 전통')],
  },
  {
    id: 'LOC_ABBASID', eraId: 'ERA_MEDIEVAL', regionId: 'REG_MENA', label: '아바스 왕조 바그다드 문화권', presentDayContext: '오늘날 이라크 바그다드와 주변 지역', yearStart: 750, yearEnd: 1000,
    affinityTags: ['knowledge', 'achievement'], occupationIds: ['OCC_SCRIBE', 'OCC_MERCHANT', 'OCC_HEALER', 'OCC_TEACHER'],
    dailyLifeNotes: ['종이와 필사가 행정·학문·상업 기록의 유통을 넓혔습니다', '시장에서는 직물·향료·금속품과 먼 지역의 소식이 함께 오갔습니다', '학자와 번역자, 의술 종사자가 후원과 교육망을 통해 지식을 나누었습니다'],
    visual: { fallbackAssetKey: 'library/v3/abbasid-baghdad.jpg', environment: '티그리스 강변의 부두, 벽돌 도시, 차양이 드리운 시장', clothing: '긴 튜닉과 겹쳐 두른 외투, 터번이나 머리천', avoid: ['오스만식 페즈', '사막 유목민만으로 묘사', '현대 바그다드'] }, reviewStatus: 'EDITORIAL_REVIEWED',
    provenance: [met('The Art of the Abbasid Period', 'hd/abba/hd_abba.htm', '아바스 시대의 국제적 예술·도시 문화'), met('The Art of the Book in the Islamic World', 'hd/isbk/hd_isbk.htm', '필사와 책 제작 전통')],
  },
  {
    id: 'LOC_VENICE', eraId: 'ERA_RENAISSANCE_EARLY_MODERN', regionId: 'REG_EUROPE', label: '베네치아 공화국', presentDayContext: '오늘날 이탈리아 베네치아', yearStart: 1450, yearEnd: 1600,
    affinityTags: ['creativity', 'achievement'], occupationIds: ['OCC_MERCHANT', 'OCC_ARTISAN', 'OCC_NAVIGATOR', 'OCC_PRINTER'],
    dailyLifeNotes: ['운하와 좁은 골목이 사람과 화물의 이동로 역할을 했습니다', '상인·선원·장인이 지중해 교역과 도시 공방을 연결했습니다', '인쇄업과 유리·직물 같은 전문 기술이 길드와 작업장에서 전승되었습니다'],
    visual: { fallbackAssetKey: 'library/v3/renaissance-venice.jpg', environment: '석조 운하 건물, 작은 부두, 공방과 상점이 이어진 골목', clothing: '린넨 셔츠와 긴 겉옷, 직업에 맞는 앞치마와 모자', avoid: ['현대 곤돌라 관광', '바로크 가면 축제 중심', '북유럽 판금갑옷'] }, reviewStatus: 'EDITORIAL_REVIEWED',
    provenance: [unesco('Venice and its Lagoon', 394, '해양 권력, 섬 도시, 공방과 교역 환경'), met('Venice and Northern Italy, 1400–1600 A.D.', 'hd/itnr/hd_itnr.htm', '르네상스기 베네치아의 예술·물질문화')],
  },
  {
    id: 'LOC_SWASHILI', eraId: 'ERA_AGE_OF_EXPLORATION', regionId: 'REG_SUBSAHARAN_AFRICA', label: '스와힐리 해안 도시권', presentDayContext: '오늘날 케냐·탄자니아 해안', yearStart: 1250, yearEnd: 1500,
    affinityTags: ['adventure', 'connection'], occupationIds: ['OCC_MERCHANT', 'OCC_NAVIGATOR', 'OCC_SHIPWRIGHT', 'OCC_ARTISAN'],
    dailyLifeNotes: ['계절풍에 맞춰 아라비아·인도·아프리카 연안의 배가 드나들었습니다', '산호석과 석회로 지은 집과 모스크가 좁은 거리와 우물 주변에 모였습니다', '금·상아·목재 등 지역 물산과 직물·도자기·구슬 같은 수입품이 교환되었습니다'],
    visual: { fallbackAssetKey: 'library/v3/swahili-kilwa.jpg', environment: '산호석 건물, 모스크, 우물과 인도양 다우선 부두', clothing: '가벼운 면직물과 머리천, 항해·시장 노동에 맞는 복식', avoid: ['사파리 초원', '아랍 문화로만 묘사', '유럽 범선 중심'] }, reviewStatus: 'EDITORIAL_REVIEWED',
    provenance: [unesco('Ruins of Kilwa Kisiwani and Songo Mnara', 144, '13~16세기 스와힐리 무역 도시와 산호석 건축'), unesco('Historic Town and Archaeological Site of Gedi', 1720, '도시 구조, 우물, 국제 교역품에 대한 고고학적 근거')],
  },
  {
    id: 'LOC_ANDES', eraId: 'ERA_AGE_OF_EXPLORATION', regionId: 'REG_AMERICAS', label: '잉카기 안데스 고원 공동체', presentDayContext: '오늘날 페루·볼리비아 고원', yearStart: 1400, yearEnd: 1530,
    affinityTags: ['stability', 'devotion'], occupationIds: ['OCC_FARMER', 'OCC_TEXTILE', 'OCC_MESSENGER', 'OCC_BUILDER'],
    dailyLifeNotes: ['고도에 따른 여러 생태대를 오가며 감자·옥수수와 가축 자원을 나눴습니다', '계단식 밭과 관개 시설의 유지가 공동 노동에 의존했습니다', '도로·다리·역참을 통해 사람과 물자가 산악 지형을 이동했습니다'],
    visual: { fallbackAssetKey: 'library/v3/inca-andes.jpg', environment: '석축 계단밭, 고산 도로, 어도비와 정교한 석조 건물', clothing: '직조된 모직 튜닉과 망토, 지역 무늬의 머리쓰개', avoid: ['마야 피라미드', '북미 원주민 깃털관', '정글 도시만 묘사'] }, reviewStatus: 'EDITORIAL_REVIEWED',
    provenance: [unesco('Qhapaq Ñan, Andean Road System', 1459, '안데스 도로·교량·역참과 교류 체계'), unesco('City of Cuzco', 273, '잉카 도시계획과 석조 건축')],
  },
  {
    id: 'LOC_STEPPE', eraId: 'ERA_MEDIEVAL', regionId: 'REG_CENTRAL_ASIA', label: '몽골 제국기 초원 교역권', presentDayContext: '오늘날 몽골과 중앙아시아', yearStart: 1200, yearEnd: 1350,
    affinityTags: ['freedom', 'courage'], occupationIds: ['OCC_MESSENGER', 'OCC_MERCHANT', 'OCC_HEALER', 'OCC_ARTISAN'],
    dailyLifeNotes: ['가축의 풀과 물을 따라 계절별로 거처를 옮겼습니다', '말과 역참망이 먼 거리의 명령·소식·물자를 연결했습니다', '이동식 주거와 가죽·모직·금속 도구는 반복적인 이동에 맞춰 관리되었습니다'],
    visual: { fallbackAssetKey: 'library/v3/mongol-steppe.jpg', environment: '넓은 초원, 펠트 천막, 말과 수레가 모인 계절 야영지', clothing: '겹쳐 여미는 긴 델과 허리띠, 가죽 장화', avoid: ['항상 전투 장면', '칭기즈 칸 초상 복제', '사막만 묘사'] }, reviewStatus: 'EDITORIAL_REVIEWED',
    provenance: [source('Orkhon Valley Cultural Landscape', 'https://whc.unesco.org/en/list/1081', '유목 생활과 제국 중심지의 장기적 공존'), met('The Legacy of Genghis Khan', 'hd/khan1/hd_khan1.htm', '몽골 제국의 교류와 물질문화')],
  },
  {
    id: 'LOC_POLYNESIA', eraId: 'ERA_AGE_OF_EXPLORATION', regionId: 'REG_OCEANIA', label: '폴리네시아 항해 공동체', presentDayContext: '남태평양 폴리네시아 도서 지역', yearStart: 1200, yearEnd: 1700,
    affinityTags: ['adventure', 'spirituality'], occupationIds: ['OCC_NAVIGATOR', 'OCC_SHIPWRIGHT', 'OCC_FISHER', 'OCC_CEREMONIAL'],
    dailyLifeNotes: ['별·파도·바람·새의 움직임을 종합해 섬 사이 항로를 찾았습니다', '아웃리거 카누와 돛·밧줄을 공동으로 제작하고 반복해 손질했습니다', '어로·원예·빗물과 식량 저장이 섬의 계절 변화에 맞춰 이루어졌습니다'],
    visual: { fallbackAssetKey: 'library/v3/polynesian-voyagers.jpg', environment: '환초의 얕은 바다, 아웃리거 카누, 야자와 공동 작업 공간', clothing: '식물 섬유와 타파 천 중심의 섬 복식', avoid: ['하와이 관광 의상', '카리브해 해적', '유럽식 범선'] }, reviewStatus: 'EDITORIAL_REVIEWED',
    provenance: [source('Taputapuātea', 'https://whc.unesco.org/en/list/1529', '폴리네시아 항해·의례·교류의 중심지'), source('Polynesian Voyaging Society', 'https://hokulea.com/education-at-sea/polynesian-wayfinding/', '별·파도·바람을 이용한 비계기 항법')],
  },
  {
    id: 'LOC_HAN_CHANGAN', eraId: 'ERA_CLASSICAL', regionId: 'REG_EAST_ASIA', label: '한대 장안과 관중 평야', presentDayContext: '오늘날 중국 산시성 시안 일대', yearStart: -200, yearEnd: 200,
    affinityTags: ['honor', 'knowledge'], occupationIds: ['OCC_OFFICIAL', 'OCC_SCRIBE', 'OCC_ARTISAN', 'OCC_MERCHANT'],
    dailyLifeNotes: ['도성의 관청과 시장은 문서·세금·물자의 흐름을 관리했습니다', '죽간과 목간에 행정 명령과 장부를 적어 묶었습니다', '관중의 농업 생산과 장거리 교역로가 수도의 인구를 뒷받침했습니다'],
    visual: { fallbackAssetKey: 'library/v3/han-changan.jpg', environment: '다져 쌓은 성벽과 목조 관청, 구획된 시장과 흙길', clothing: '겹쳐 여미는 포와 허리띠, 직업별 머리쓰개', avoid: ['청대 변발', '명청 궁궐 색채', '일본식 갑옷'] }, reviewStatus: 'EDITORIAL_REVIEWED',
    provenance: [source('Silk Roads: Chang’an-Tianshan Corridor', 'https://whc.unesco.org/en/list/1442', '한대 장안에서 시작한 육상 교류망'), met('Han Dynasty (206 B.C.–220 A.D.)', 'hd/hand/hd_hand.htm', '한대 사회와 물질문화')],
  },
  {
    id: 'LOC_HEIAN_KYO', eraId: 'ERA_MEDIEVAL', regionId: 'REG_EAST_ASIA', label: '헤이안쿄와 교외 장원', presentDayContext: '오늘날 일본 교토', yearStart: 900, yearEnd: 1180,
    affinityTags: ['creativity', 'calm'], occupationIds: ['OCC_SCRIBE', 'OCC_TEXTILE', 'OCC_CEREMONIAL', 'OCC_ARTISAN'],
    dailyLifeNotes: ['궁정·사찰·장원은 문서와 물자를 주고받는 관계로 연결되었습니다', '종이·붓·염색 직물은 신분과 직업에 따라 다른 방식으로 사용되었습니다', '도성 밖 농업과 하천 운송이 도시 생활의 식량과 연료를 공급했습니다'],
    visual: { fallbackAssetKey: 'library/v3/heian-kyo.jpg', environment: '목조 저택과 회랑, 흙길, 교외 논과 하천', clothing: '시대에 맞는 포와 겹옷, 노동자는 간결한 작업복', avoid: ['에도 사무라이', '현대 기모노', '벚꽃 관광 이미지'] }, reviewStatus: 'EDITORIAL_REVIEWED',
    provenance: [unesco('Historic Monuments of Ancient Kyoto', 688, '헤이안쿄 이후 교토의 도시·종교 건축'), met('Heian Period, 794–1185', 'hd/heia/hd_heia.htm', '헤이안 시대의 예술과 궁정 문화')],
  },
  {
    id: 'LOC_JOSEON_HANYANG', eraId: 'ERA_RENAISSANCE_EARLY_MODERN', regionId: 'REG_EAST_ASIA', label: '조선 전기 한양', presentDayContext: '오늘날 대한민국 서울', yearStart: 1450, yearEnd: 1650,
    affinityTags: ['knowledge', 'honor'], occupationIds: ['OCC_OFFICIAL', 'OCC_SCRIBE', 'OCC_ARTISAN', 'OCC_MERCHANT', 'OCC_PRINTER'],
    dailyLifeNotes: ['궁궐·관청·시장·주거지가 성곽과 물길 안팎에 분포했습니다', '금속활자와 목판, 한지 문서가 행정과 지식 전달에 쓰였습니다', '시전 상인과 장인, 운반 노동자가 수도의 물자 공급을 맡았습니다'],
    visual: { fallbackAssetKey: 'library/v3/joseon-hanyang.jpg', environment: '산을 배경으로 한 성곽, 기와집과 초가, 개천과 시장 골목', clothing: '조선 전기 포와 저고리·바지·치마, 직업별 실용 복식', avoid: ['구한말 사진 복제', '화려한 왕실 의상만 묘사', '현대 한복'] }, reviewStatus: 'EDITORIAL_REVIEWED',
    provenance: [source('Changdeokgung Palace Complex', 'https://whc.unesco.org/en/list/816', '조선 궁궐의 공간 구성과 자연환경'), source('Royal Tombs of the Joseon Dynasty', 'https://whc.unesco.org/en/list/1319', '조선 왕조의 의례·건축·사회적 맥락')],
  },
  {
    id: 'LOC_MALI_TIMBUKTU', eraId: 'ERA_MEDIEVAL', regionId: 'REG_SUBSAHARAN_AFRICA', label: '말리 제국기 팀북투 교역권', presentDayContext: '오늘날 말리 중부 니제르강 북부', yearStart: 1300, yearEnd: 1550,
    affinityTags: ['knowledge', 'connection'], occupationIds: ['OCC_MERCHANT', 'OCC_TEACHER', 'OCC_SCRIBE', 'OCC_BUILDER'],
    dailyLifeNotes: ['사하라 횡단 대상과 니제르강 교통이 소금·금·직물·책의 흐름을 이었습니다', '모스크와 학습 공동체 주변에서 필사·교육·숙박 서비스가 이루어졌습니다', '흙 건축물은 비와 바람 뒤 공동 보수로 유지되었습니다'],
    visual: { fallbackAssetKey: 'library/v3/mali-timbuktu.jpg', environment: '흙벽 모스크와 낮은 주택, 대상 동물이 머무는 시장 가장자리', clothing: '사헬 기후의 넉넉한 직물 옷과 머리천', avoid: ['정글 왕국', '중동 도시로 대체', '유럽식 중세 성'] }, reviewStatus: 'EDITORIAL_REVIEWED',
    provenance: [unesco('Timbuktu', 119, '모스크, 학문, 사하라 교역의 역사'), source('Ancient Ksour of Ouadane, Chinguetti, Tichitt and Oualata', 'https://whc.unesco.org/en/list/750', '사하라 대상 도시와 이슬람 학문·교역 환경')],
  },
  {
    id: 'LOC_AZTEC_TENOCHTITLAN', eraId: 'ERA_AGE_OF_EXPLORATION', regionId: 'REG_AMERICAS', label: '멕시카 테노치티틀란', presentDayContext: '오늘날 멕시코시티 중심부', yearStart: 1400, yearEnd: 1520,
    affinityTags: ['achievement', 'devotion'], occupationIds: ['OCC_MERCHANT', 'OCC_ARTISAN', 'OCC_FARMER', 'OCC_CEREMONIAL'],
    dailyLifeNotes: ['호수 위 둑길과 카누가 도시의 사람·식량·상품 이동을 담당했습니다', '치남파 농업이 옥수수·채소·꽃을 밀집 도시로 공급했습니다', '대형 시장에는 전문 상인과 장인이 품목별로 모였습니다'],
    visual: { fallbackAssetKey: 'library/v3/mexica-tenochtitlan.jpg', environment: '호수 도시의 둑길과 카누, 수로, 시장과 회반죽 건물', clothing: '면직 망토와 치마·허리천, 직업과 지위에 따른 무늬', avoid: ['마야 정글 피라미드', '깃털관을 모두에게 적용', '스페인 식민 건축 중심'] }, reviewStatus: 'EDITORIAL_REVIEWED',
    provenance: [source('Historic Centre of Mexico City and Xochimilco', 'https://whc.unesco.org/en/list/412', '테노치티틀란의 호수 도시 기반과 치남파'), met('Aztec Art', 'hd/azte/hd_azte.htm', '멕시카의 도시·시장·물질문화')],
  },
  {
    id: 'LOC_OTTOMAN_ISTANBUL', eraId: 'ERA_RENAISSANCE_EARLY_MODERN', regionId: 'REG_MENA', label: '오스만 이스탄불', presentDayContext: '오늘날 튀르키예 이스탄불', yearStart: 1550, yearEnd: 1750,
    affinityTags: ['connection', 'achievement'], occupationIds: ['OCC_MERCHANT', 'OCC_ARTISAN', 'OCC_OFFICIAL', 'OCC_SHIPWRIGHT'],
    dailyLifeNotes: ['보스포루스의 부두와 시장이 흑해·지중해의 사람과 화물을 연결했습니다', '종교·언어·출신이 다양한 주민이 구역과 길드를 통해 일했습니다', '공공 급수·목욕탕·시장·종교 시설이 밀집 도시의 일상을 지탱했습니다'],
    visual: { fallbackAssetKey: 'library/v3/ottoman-istanbul.jpg', environment: '언덕의 목조 주택, 돔과 시장, 보스포루스 부두와 소형선', clothing: '긴 카프탄과 실용적인 작업복, 다양한 머리쓰개', avoid: ['현대 페즈 고정', '하렘 환상화', '아랍 사막 도시'] }, reviewStatus: 'EDITORIAL_REVIEWED',
    provenance: [unesco('Historic Areas of Istanbul', 356, '도시 경관과 오스만 기념물'), met('The Age of Süleyman the Magnificent', 'hd/suly/hd_suly.htm', '16세기 오스만 제국의 예술과 사회')],
  },
  {
    id: 'LOC_EDO', eraId: 'ERA_INDUSTRIAL', regionId: 'REG_EAST_ASIA', label: '에도 후기 도시 생활권', presentDayContext: '오늘날 일본 도쿄', yearStart: 1750, yearEnd: 1860,
    affinityTags: ['creativity', 'connection'], occupationIds: ['OCC_ARTISAN', 'OCC_MERCHANT', 'OCC_PRINTER', 'OCC_GUARD'],
    dailyLifeNotes: ['목조 장옥과 상점이 밀집해 화재 예방과 공동 우물이 중요했습니다', '출판·공연·그림과 생활용품 시장이 큰 소비 도시를 이루었습니다', '하천과 운하의 배가 쌀·장작·건축 자재를 도심 창고로 옮겼습니다'],
    visual: { fallbackAssetKey: 'library/v3/late-edo.jpg', environment: '목조 장옥과 상점, 운하의 짐배, 화재 감시 망루', clothing: '에도 후기 서민의 고소데와 작업용 앞치마·각반', avoid: ['메이지 서양복', '전투 중인 사무라이 중심', '교토 귀족 문화'] }, reviewStatus: 'EDITORIAL_REVIEWED',
    provenance: [met('Art of the Edo Period (1615–1868)', 'hd/edop/hd_edop.htm', '에도 시대의 도시 문화와 시각예술'), source('Sites of Japan’s Meiji Industrial Revolution', 'https://whc.unesco.org/en/list/1484', '에도 말기에서 근대 산업화로 이어지는 기술 환경 비교')],
  },
  {
    id: 'LOC_INDUSTRIAL_HANSEONG', eraId: 'ERA_INDUSTRIAL', regionId: 'REG_EAST_ASIA', label: '개항기 한성', presentDayContext: '오늘날 대한민국 서울', yearStart: 1880, yearEnd: 1910,
    affinityTags: ['achievement', 'survival'], occupationIds: ['OCC_OFFICIAL', 'OCC_MERCHANT', 'OCC_PRINTER', 'OCC_MESSENGER'],
    dailyLifeNotes: ['전통 시장과 새 상점·우편·전신·신문사가 같은 도시에 공존했습니다', '성문과 나루를 통해 지방 물산과 수입품이 도심으로 들어왔습니다', '신식 교육과 인쇄 매체가 새로운 직업과 정치적 논쟁을 만들었습니다'],
    visual: { fallbackAssetKey: 'library/v3/industrial-hanseong.jpg', environment: '성곽과 기와집 사이의 전차 선로, 인쇄소와 시장 거리', clothing: '한복 작업복과 두루마기, 일부 제복·서양식 모자의 혼재', avoid: ['완전한 현대 서울', '일제강점기 후기 복식', '조선 초기 궁중만 묘사'] }, reviewStatus: 'EDITORIAL_REVIEWED',
    provenance: [source('Changdeokgung Palace Complex', 'https://whc.unesco.org/en/list/816', '근대 전환기에도 이어진 수도의 궁궐 공간'), source('Seoul Museum of History', 'https://museum.seoul.go.kr/eng/index.do', '개항기 한성의 도시생활·교통·인쇄 자료를 소장한 기관')],
  },
  {
    id: 'LOC_SHANGHAI_1920', eraId: 'ERA_20C_EARLY', regionId: 'REG_EAST_ASIA', label: '1920년대 상하이 항구와 인쇄 거리', presentDayContext: '오늘날 중국 상하이', yearStart: 1920, yearEnd: 1929,
    affinityTags: ['connection', 'creativity'], occupationIds: ['OCC_MERCHANT', 'OCC_PRINTER', 'OCC_PHOTOGRAPHER', 'OCC_JOURNALIST'],
    dailyLifeNotes: ['전차와 부두를 오가는 사람들 사이로 여러 언어의 간판이 이어졌습니다', '신문과 전단이 카페와 인쇄소에서 빠르게 돌았습니다', '이주 노동자와 상인들은 숙소와 식당 정보를 서로 나누었습니다'],
    visual: { fallbackAssetKey: 'library/v3/shanghai-1920.jpg', environment: '전차 선로, 부두 창고, 인쇄소 골목', clothing: '서양식 재킷과 중국식 작업복이 공존하는 거리 복장', avoid: ['현대 고층 빌딩', '현대 자동차', '현대식 간판'] }, reviewStatus: 'EDITORIAL_REVIEWED',
    provenance: [source('Shanghai: The Paris of the Orient', 'https://www.britannica.com/place/Shanghai-China', '20세기 초 국제 항구와 도시 생활'), source('The International Dunhuang Project', 'https://idp.bl.uk/', '동아시아 교역과 기록 자료')],
  },
  {
    id: 'LOC_SEOUL_1940', eraId: 'ERA_20C_EARLY', regionId: 'REG_EAST_ASIA', label: '1940년대 서울의 피난과 배급 생활', presentDayContext: '오늘날 대한민국 서울', yearStart: 1940, yearEnd: 1949,
    affinityTags: ['survival', 'connection'], occupationIds: ['OCC_NURSE', 'OCC_JOURNALIST', 'OCC_CIVIL_SERVANT', 'OCC_COMMUNITY_ORGANIZER'],
    dailyLifeNotes: ['가족들은 피난 보따리와 배급표를 생활의 중심에 두었습니다', '병원과 학교는 부족한 물자 속에서도 임시 기능을 이어 갔습니다', '라디오와 전갈은 헤어진 가족을 찾는 중요한 수단이었습니다'],
    visual: { fallbackAssetKey: 'library/v3/seoul-1940.jpg', environment: '낮은 한옥과 임시 시장, 피난 행렬', clothing: '수선한 작업복과 계절에 맞춘 겹옷', avoid: ['현대식 군복', '현대 아파트', '현대 광고판'] }, reviewStatus: 'EDITORIAL_REVIEWED',
    provenance: [source('Seoul Museum of History', 'https://museum.seoul.go.kr/eng/index.do', '근현대 서울의 생활사 자료'), source('Korean History Database', 'https://db.history.go.kr/', '20세기 한국 사회와 전쟁 자료')],
  },
  {
    id: 'LOC_BUSAN_1950', eraId: 'ERA_20C_LATE', regionId: 'REG_EAST_ASIA', label: '1950년대 부산의 피란민 시장', presentDayContext: '오늘날 대한민국 부산', yearStart: 1950, yearEnd: 1959,
    affinityTags: ['survival', 'adventure'], occupationIds: ['OCC_MERCHANT', 'OCC_NURSE', 'OCC_RADIO_TECHNICIAN', 'OCC_COMMUNITY_ORGANIZER'],
    dailyLifeNotes: ['언덕길 판잣집과 시장은 서로의 소식을 나누는 생활권이 되었습니다', '미군 물자와 지역 장터가 섞인 새로운 거래 방식이 생겼습니다', '피난민들은 고향의 주소와 이름을 종이에 적어 보관했습니다'],
    visual: { fallbackAssetKey: 'library/v3/busan-1950.jpg', environment: '항구 언덕, 판잣집, 국제시장 골목', clothing: '기운 작업복과 군용 외투를 고쳐 입은 사람들', avoid: ['현대 항만 크레인', '현대 차량', '현대식 상가'] }, reviewStatus: 'EDITORIAL_REVIEWED',
    provenance: [source('Busan Modern History Museum', 'https://www.busan.go.kr/museum/', '전후 부산의 피난과 시장 생활'), source('Korean History Database', 'https://db.history.go.kr/', '한국전쟁과 피난민 자료')],
  },
  {
    id: 'LOC_TOKYO_1960', eraId: 'ERA_20C_LATE', regionId: 'REG_EAST_ASIA', label: '1960년대 도쿄의 고도성장과 전파 상점', presentDayContext: '오늘날 일본 도쿄', yearStart: 1960, yearEnd: 1969,
    affinityTags: ['achievement', 'knowledge'], occupationIds: ['OCC_FACTORY_WORKER', 'OCC_RADIO_TECHNICIAN', 'OCC_PHOTOGRAPHER', 'OCC_CIVIL_SERVANT'],
    dailyLifeNotes: ['전철역 주변에 공장 노동자와 학생을 위한 작은 상점이 늘었습니다', '텔레비전과 라디오가 가족의 저녁 시간을 바꾸었습니다', '새로운 주택 단지와 오래된 골목이 빠르게 맞닿았습니다'],
    visual: { fallbackAssetKey: 'library/v3/tokyo-1960.jpg', environment: '전철역, 전파 상점, 새로 지은 주택 단지', clothing: '작업복과 단정한 출근복, 학생 교복', avoid: ['현대 전광판', '스마트폰', '현대 고층 빌딩'] }, reviewStatus: 'EDITORIAL_REVIEWED',
    provenance: [source('Tokyo Metropolitan Library Digital Archive', 'https://www.library.metro.tokyo.lg.jp/english/', '전후 도쿄 도시 생활 자료'), source('Japan Search', 'https://jpsearch.go.jp/', '일본 근현대 사진과 기록')],
  },
  {
    id: 'LOC_LAGOS_1980', eraId: 'ERA_20C_LATE', regionId: 'REG_SUBSAHARAN_AFRICA', label: '1980년대 라고스의 음악과 이주 네트워크', presentDayContext: '오늘날 나이지리아 라고스', yearStart: 1980, yearEnd: 1989,
    affinityTags: ['connection', 'freedom'], occupationIds: ['OCC_JOURNALIST', 'OCC_PHOTOGRAPHER', 'OCC_RADIO_TECHNICIAN', 'OCC_COMMUNITY_ORGANIZER'],
    dailyLifeNotes: ['버스 정류장과 시장은 도시 안팎의 이주 소식을 교환하는 장소였습니다', '카세트와 라디오는 음악과 지역 뉴스를 동시에 퍼뜨렸습니다', '공동체 모임은 전기와 물 문제를 함께 해결하는 창구가 되었습니다'],
    visual: { fallbackAssetKey: 'library/v3/lagos-1980.jpg', environment: '시장, 버스 정류장, 음악 스튜디오', clothing: '선명한 색상의 일상복과 작업복', avoid: ['현대식 대형 쇼핑몰', '스마트폰', '현대 교통 표지'] }, reviewStatus: 'EDITORIAL_REVIEWED',
    provenance: [source('Lagos State Records and Archives Bureau', 'https://lasrab.gov.ng/', '라고스 도시와 기록 자료'), source('British Library Sounds', 'https://sounds.bl.uk/', '나이지리아 음악과 구술 기록')],
  },
  {
    id: 'LOC_SAO_PAULO_1990', eraId: 'ERA_20C_LATE', regionId: 'REG_AMERICAS', label: '1990년대 상파울루의 컴퓨터 학원과 이주 생활', presentDayContext: '오늘날 브라질 상파울루', yearStart: 1990, yearEnd: 1999,
    affinityTags: ['knowledge', 'adventure'], occupationIds: ['OCC_PROGRAMMER', 'OCC_JOURNALIST', 'OCC_PHOTOGRAPHER', 'OCC_COMMUNITY_ORGANIZER'],
    dailyLifeNotes: ['컴퓨터 학원과 복사 가게가 새로운 일자리를 준비하는 장소가 되었습니다', '이주한 가족들은 전화번호와 주소록을 통해 서로를 연결했습니다', '버스 노선과 동네 라디오가 거대한 도시의 생활 정보를 이어 주었습니다'],
    visual: { fallbackAssetKey: 'library/v3/saopaulo-1990.jpg', environment: '컴퓨터 학원, 버스 터미널, 다층 주거지', clothing: '청바지와 셔츠, 직업별 작업복', avoid: ['스마트폰', '현대식 공유 차량', '2000년대 이후 로고'] }, reviewStatus: 'EDITORIAL_REVIEWED',
    provenance: [source('Museu da Imagem e do Som de São Paulo', 'https://mis-sp.org.br/', '상파울루 근현대 도시 기록'), source('Biblioteca Nacional Digital', 'https://bndigital.bn.gov.br/', '브라질 사진과 신문 자료')],
  },
] as const;

const expandedOccupationIds = [
  'OCC_UNEMPLOYED', 'OCC_BEGGAR', 'OCC_CLOWN', 'OCC_INDEPENDENCE_FIGHTER', 'OCC_SOLDIER', 'OCC_CLEANER', 'OCC_COOK', 'OCC_BAKER',
  'OCC_BLACKSMITH', 'OCC_POTTER', 'OCC_DYER', 'OCC_TAILOR', 'OCC_COURIER', 'OCC_DRIVER', 'OCC_RAILWAY_WORKER', 'OCC_MINER',
  'OCC_LOGGER', 'OCC_SHEPHERD', 'OCC_BEEKEEPER', 'OCC_MIDWIFE', 'OCC_HERBALIST', 'OCC_MUSICIAN', 'OCC_DANCER', 'OCC_ACTOR',
  'OCC_PRIEST', 'OCC_MONK', 'OCC_LAWYER', 'OCC_TRANSLATOR', 'OCC_LIBRARIAN', 'OCC_STUDENT', 'OCC_TELEGRAPH_OPERATOR',
  'OCC_HARBOR_WORKER', 'OCC_FISHERMAN', 'OCC_HOUSEKEEPER', 'OCC_GARDENER', 'OCC_WATER_CARRIER', 'OCC_SALT_WORKER', 'OCC_CARPENTER',
  'OCC_GLASSMAKER', 'OCC_WATCHMAKER', 'OCC_CARTOGRAPHER', 'OCC_SURVEYOR', 'OCC_ARCHITECT', 'OCC_BOTANIST', 'OCC_DOCTOR', 'OCC_PARAMEDIC',
  'OCC_FIREKEEPER', 'OCC_FIRE_FIGHTER', 'OCC_POLICE', 'OCC_JUDGE', 'OCC_TAX_COLLECTOR', 'OCC_BELL_RINGER', 'OCC_INNKEEPER',
] as const;

const connectedSettings = baseHistoricalSettings.map((setting) => setting.id === 'LOC_INDUSTRIAL_HANSEONG'
  ? { ...setting, occupationIds: [...setting.occupationIds, ...expandedOccupationIds] }
  : setting);

const generatedSettingLabels = [
  '강가의 시장과 작업장', '산길을 지키는 마을', '바닷길의 작은 항구', '성벽 아래의 거리', '철도 옆의 새 동네',
  '학교와 공방이 있는 골목', '농장과 창고가 이어진 평야', '광장과 극장이 있는 도시', '비가 많은 숲의 마을', '사막을 건너는 교역로',
];
const generatedSettings: HistoricalSetting[] = Array.from({ length: 90 }, (_, index) => {
  const sourceSetting = connectedSettings[index % connectedSettings.length]!;
  const variant = index + 1;
  return {
    ...sourceSetting,
    id: `${sourceSetting.id}_VARIANT_${String(variant).padStart(3, '0')}`,
    label: `${generatedSettingLabels[index % generatedSettingLabels.length]} ${variant}`,
    presentDayContext: `${sourceSetting.presentDayContext}의 생활 장면 변형 ${variant}`,
    occupationIds: [...sourceSetting.occupationIds].slice(index % 5).concat(sourceSetting.occupationIds.slice(0, index % 5)),
    dailyLifeNotes: [...sourceSetting.dailyLifeNotes, `${generatedSettingLabels[index % generatedSettingLabels.length]}에서 사람들은 서로의 일을 도왔습니다.`],
    visual: { ...sourceSetting.visual, fallbackAssetKey: `library/v3/generated-setting-${String(variant).padStart(3, '0')}.jpg` },
  };
});

export const historicalSettings: readonly HistoricalSetting[] = [...connectedSettings, ...generatedSettings];
