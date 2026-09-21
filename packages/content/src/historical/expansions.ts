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
  workEpisodes: readonly HistoricalEpisode[];
  lifeEvents: readonly HistoricalEpisode[];
};

function assetSlug(fallbackAssetKey: string) {
  return fallbackAssetKey.split('/').at(-1)!.replace(/\.(jpg|jpeg|png|webp)$/i, '');
}

export const historicalSettingExpansions: readonly HistoricalSettingExpansion[] = historicalSettings.map((setting) => {
  const slug = assetSlug(setting.visual.fallbackAssetKey);
  const generatedExtension = 'png';
  const workEpisodes = setting.occupationIds.map((occupationId, index) => {
    const occupation = historicalOccupations.find(({ id }) => id === occupationId);
    if (!occupation) throw new Error(`Unknown occupation ${occupationId} in ${setting.id}`);
    const action = occupation.dailyActions[index % occupation.dailyActions.length]!;
    const object = occupation.signatureObjects[index % occupation.signatureObjects.length]!;
    const localDetail = setting.dailyLifeNotes[index % setting.dailyLifeNotes.length]!;
    return {
      id: `${setting.id}_WORK_${String(index + 1).padStart(2, '0')}`,
      title: `${occupation.label}에게 찾아온 뜻밖의 하루`,
      setup: `${setting.label}에서 ${action} 그날, 평소와 다른 문제가 생겼습니다. ${localDetail}`,
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
    imageAssetKeys: [
      `library/v4/${slug}-daily.webp`,
      `library/v4/${slug}-work.${generatedExtension}`,
      `library/v4/${slug}-turning.${generatedExtension}`,
    ],
    workEpisodes,
    lifeEvents,
  };
});

export function findHistoricalSettingExpansion(settingId: string) {
  return historicalSettingExpansions.find((item) => item.settingId === settingId);
}
