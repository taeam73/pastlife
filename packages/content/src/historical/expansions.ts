import { historicalOccupations } from './occupations.js';
import { historicalSettings } from './settings.js';

export type HistoricalEpisode = {
  id: string;
  title: string;
  setup: string;
  choice: string;
  consequence: string;
  occupationIds: readonly string[];
};

export type HistoricalSettingExpansion = {
  settingId: string;
  imageAssetKeys: readonly [string, string, string];
  additionalImageAssetKeys?: readonly string[];
  workEpisodes: readonly HistoricalEpisode[];
  lifeEvents: readonly HistoricalEpisode[];
};

function assetSlug(fallbackAssetKey: string) {
  return fallbackAssetKey.split('/').at(-1)!.replace(/\.(jpg|jpeg|png|webp)$/i, '');
}

export const historicalSettingExpansions: readonly HistoricalSettingExpansion[] = historicalSettings.map((setting) => {
  const slug = assetSlug(setting.visual.fallbackAssetKey);
  const generatedExtension = 'png';
  const imageAssetKeys: HistoricalSettingExpansion['imageAssetKeys'] = setting.visual.fallbackAssetKey.startsWith('library/v5/')
    ? [setting.visual.fallbackAssetKey, setting.visual.fallbackAssetKey, setting.visual.fallbackAssetKey]
    : [
        `library/v4/${slug}-daily.webp`,
        `library/v4/${slug}-work.${generatedExtension}`,
        `library/v4/${slug}-turning.${generatedExtension}`,
      ];
  const workEpisodes = setting.occupationIds.map((occupationId, index) => {
    const occupation = historicalOccupations.find(({ id }) => id === occupationId);
    if (!occupation) throw new Error(`Unknown occupation ${occupationId} in ${setting.id}`);
    const action = occupation.dailyActions[index % occupation.dailyActions.length]!;
    const object = occupation.signatureObjects[index % occupation.signatureObjects.length]!;
    const localDetail = setting.dailyLifeNotes[index % setting.dailyLifeNotes.length]!;
    return {
      id: `${setting.id}_WORK_${String(index + 1).padStart(2, '0')}`,
      title: `${occupation.label}에게 찾아온 뜻밖의 하루`,
      setup: `${setting.label}에서 ${action}. 그날 평소와 다른 문제가 생겼습니다. ${localDetail}`,
      choice: `당신은 ${object}부터 챙기는 대신 함께 일하던 사람들의 안전과 생계를 먼저 확인했습니다.`,
      consequence: `그 선택은 ${occupation.label}의 일을 혼자만의 기술이 아니라 공동체가 이어 가는 방식으로 바꾸었습니다.`,
      occupationIds: [occupationId],
    };
  });
  const lifeEvents = setting.occupationIds.map((occupationId, index) => ({
    id: `${setting.id}_LIFE_${String(index + 1).padStart(2, '0')}`,
    title: [`계절이 바꾼 약속`, `시장의 빈자리`, `길 위에서 내린 결정`, `공동체가 다시 세운 규칙`][index % 4]!,
    setup: `${setting.label}의 일상이 흔들리던 때였습니다. ${setting.dailyLifeNotes[index % setting.dailyLifeNotes.length]}`,
    choice: `당신은 익숙한 질서를 그대로 따르기보다 가장 늦게 보호받는 사람의 사정을 먼저 기록하고 알렸습니다.`,
    consequence: `사람들은 사건이 지나간 뒤 그 선택을 새로운 약속과 작업 순서로 남겼습니다.`,
    occupationIds: [...setting.occupationIds],
  }));
  return {
    settingId: setting.id,
    imageAssetKeys,
    ...(setting.id === 'LOC_MESOPOTAMIA' ? { additionalImageAssetKeys: ['library/v4/mesopotamia-ur-study.png', 'library/v4/mesopotamia-ur-study2.png'] } : {}),
    ...(setting.id === 'LOC_GANGES' ? { additionalImageAssetKeys: ['library/v4/magadha-ganges-study.png', 'library/v4/magadha-ganges-study2.png'] } : {}),
    ...(setting.id === 'LOC_VENICE' ? { additionalImageAssetKeys: ['library/v4/renaissance-venice-study.png', 'library/v4/renaissance-venice-study2.png'] } : {}),
    ...(setting.id === 'LOC_HEIAN_KYO' ? { additionalImageAssetKeys: ['library/v4/heian-kyo-study.png', 'library/v4/heian-kyo-study2.png'] } : {}),
    ...(setting.id === 'LOC_MALI_TIMBUKTU' ? { additionalImageAssetKeys: ['library/v4/mali-timbuktu-study.png', 'library/v4/mali-timbuktu-study2.png'] } : {}),
    ...(setting.id === 'LOC_ABBASID' ? { additionalImageAssetKeys: ['library/v4/abbasid-baghdad-study.png', 'library/v4/abbasid-baghdad-study2.png'] } : {}),
    ...(setting.id === 'LOC_JOSEON_HANYANG' ? { additionalImageAssetKeys: ['library/v4/joseon-hanyang-study.png', 'library/v4/joseon-hanyang-study2.png'] } : {}),
    ...(setting.id === 'LOC_OTTOMAN_ISTANBUL' ? { additionalImageAssetKeys: ['library/v4/ottoman-istanbul-study.png', 'library/v4/ottoman-istanbul-study2.png'] } : {}),
    ...(setting.id === 'LOC_EDO' ? { additionalImageAssetKeys: ['library/v4/late-edo-study.png', 'library/v4/late-edo-study2.png'] } : {}),
    ...(setting.id === 'LOC_SWASHILI' ? { additionalImageAssetKeys: ['library/v4/swahili-kilwa-study.png', 'library/v4/swahili-kilwa-study2.png'] } : {}),
    ...(setting.id === 'LOC_ANDES' ? { additionalImageAssetKeys: ['library/v4/inca-andes-study.png', 'library/v4/inca-andes-study2.png'] } : {}),
    ...(setting.id === 'LOC_STEPPE' ? { additionalImageAssetKeys: ['library/v4/mongol-steppe-study.png', 'library/v4/mongol-steppe-study2.png'] } : {}),
    ...(setting.id === 'LOC_POLYNESIA' ? { additionalImageAssetKeys: ['library/v4/polynesian-voyagers-study.png', 'library/v4/polynesian-voyagers-study2.png'] } : {}),
    ...(setting.id === 'LOC_HAN_CHANGAN' ? { additionalImageAssetKeys: ['library/v4/han-changan-study.png', 'library/v4/han-changan-study2.png'] } : {}),
    ...(setting.id === 'LOC_AZTEC_TENOCHTITLAN' ? { additionalImageAssetKeys: ['library/v4/mexica-tenochtitlan-study.png', 'library/v4/mexica-tenochtitlan-study2.png'] } : {}),
    ...(setting.id === 'LOC_INDUSTRIAL_HANSEONG' ? { additionalImageAssetKeys: ['library/v4/industrial-hanseong-study.png', 'library/v4/industrial-hanseong-study2.png'] } : {}),
    ...(setting.id === 'LOC_SHANGHAI_1920' ? { additionalImageAssetKeys: ['library/v4/shanghai-1920-study.png', 'library/v4/shanghai-1920-study2.png'] } : {}),
    ...(setting.id === 'LOC_SEOUL_1940' ? { additionalImageAssetKeys: ['library/v4/seoul-1940-study.png', 'library/v4/seoul-1940-study2.png'] } : {}),
    ...(setting.id === 'LOC_BUSAN_1950' ? { additionalImageAssetKeys: ['library/v4/busan-1950-study.png', 'library/v4/busan-1950-study2.png'] } : {}),
    ...(setting.id === 'LOC_TOKYO_1960' ? { additionalImageAssetKeys: ['library/v4/tokyo-1960-study.png', 'library/v4/tokyo-1960-study2.png'] } : {}),
    ...(setting.id === 'LOC_LAGOS_1980' ? { additionalImageAssetKeys: ['library/v4/lagos-1980-study.png', 'library/v4/lagos-1980-study2.png'] } : {}),
    ...(setting.id === 'LOC_SAO_PAULO_1990' ? { additionalImageAssetKeys: ['library/v4/saopaulo-1990-study.png', 'library/v4/saopaulo-1990-study2.png'] } : {}),
    workEpisodes,
    lifeEvents,
  };
});

export function findHistoricalSettingExpansion(settingId: string) {
  return historicalSettingExpansions.find((item) => item.settingId === settingId);
}
