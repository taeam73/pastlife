import { createHash } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import {
  axes,
  eras,
  historicalLocations,
  lastMemories,
  lifeEvents,
  occupations,
  personalities,
  questions,
  regions,
  relationships,
  socialClasses,
  tags,
  validateHistoricalContent,
  historicalSettings,
  historicalOccupations,
} from '@pastlife/content';

const prisma = new PrismaClient();
const version = process.env.CONTENT_VERSION ?? '2.5.0';
const digest = createHash('sha256').update(JSON.stringify(questions)).digest('hex');

const tagGroup = (tag: string) => {
  if (['freedom', 'stability', 'achievement', 'honor', 'knowledge', 'spirituality'].includes(tag)) return 'LIFE_DIRECTION';
  if (['adventure', 'survival', 'courage', 'independence', 'creativity'].includes(tag)) return 'ACTION';
  if (['connection', 'devotion', 'empathy', 'protection'].includes(tag)) return 'RELATIONSHIP';
  return 'INNER';
};

async function main() {
  const contentIssues = validateHistoricalContent(historicalSettings, historicalOccupations);
  if (contentIssues.length > 0) throw new Error(`Historical content validation failed: ${JSON.stringify(contentIssues)}`);
  const existing = await prisma.contentVersion.findUnique({ where: { version } });
  if (existing?.status === 'PUBLISHED' && existing.digest !== digest) {
    throw new Error(`Published content ${version} differs from the canonical digest; create a new version`);
  }
  const contentVersion = await prisma.contentVersion.upsert({
    where: { version },
    update: { digest },
    create: { version, digest, status: 'PUBLISHED', publishedAt: new Date() },
  });

  for (const tag of tags) {
    await prisma.tag.upsert({ where: { code: tag }, update: { group: tagGroup(tag) }, create: { code: tag, group: tagGroup(tag) } });
  }
  const tagRows = await prisma.tag.findMany();
  const tagIds = new Map(tagRows.map((tag) => [tag.code, tag.id]));
  const upsertTranslation = (key: string, text: string) => prisma.translation.upsert({
    where: { locale_key_version: { locale: 'ko', key, version } }, update: { text }, create: { locale: 'ko', key, version, text },
  });

  for (const question of questions) {
    const questionKey = `question.${question.id}`;
    await prisma.translation.upsert({
      where: { locale_key_version: { locale: 'ko', key: questionKey, version } },
      update: { text: question.text },
      create: { locale: 'ko', key: questionKey, version, text: question.text },
    });
    await prisma.question.upsert({
      where: { id: question.id },
      update: { stage: question.stage, translationKey: questionKey, contentVersionId: contentVersion.id },
      create: { id: question.id, stage: question.stage, translationKey: questionKey, weightProfile: `stage-${question.stage}`, contentVersionId: contentVersion.id },
    });
    for (const choice of question.choices) {
      const choiceKey = `choice.${choice.id}`;
      await prisma.translation.upsert({
        where: { locale_key_version: { locale: 'ko', key: choiceKey, version } },
        update: { text: choice.text },
        create: { locale: 'ko', key: choiceKey, version, text: choice.text },
      });
      await prisma.choice.upsert({
        where: { id: choice.id },
        update: { questionId: question.id, translationKey: choiceKey, displayOrder: choice.displayOrder },
        create: { id: choice.id, questionId: question.id, translationKey: choiceKey, displayOrder: choice.displayOrder },
      });
      await prisma.choiceTagScore.deleteMany({ where: { choiceId: choice.id } });
      await prisma.choiceTagScore.createMany({ data: choice.tagScores.map(({ tag, score }) => ({ choiceId: choice.id, tagId: tagIds.get(tag)!, score })) });
      await prisma.choiceAxisScore.deleteMany({ where: { choiceId: choice.id } });
      if (choice.axisScores.length > 0) await prisma.choiceAxisScore.createMany({ data: choice.axisScores.map(({ axis, score }) => ({ choiceId: choice.id, axisCode: axis, score })) });
    }
  }

  for (const era of eras) { const key = `era.${era.id}`; await upsertTranslation(key, era.label); await prisma.era.upsert({ where: { id: era.id }, update: { yearStart: era.yearStart, yearEnd: era.yearEnd, affinityTags: era.affinityTags }, create: { id: era.id, code: era.code, yearStart: era.yearStart, yearEnd: era.yearEnd, translationKey: key, affinityTags: era.affinityTags } }); }
  for (const region of regions) { const key = `region.${region.id}`; await upsertTranslation(key, region.label); await prisma.region.upsert({ where: { id: region.id }, update: { affinityTags: region.affinityTags }, create: { id: region.id, code: region.code, translationKey: key, affinityTags: region.affinityTags } }); }
  for (const location of historicalLocations) { const nameKey = `location.${location.id}.name`; const presentKey = `location.${location.id}.present`; await upsertTranslation(nameKey, location.label); await upsertTranslation(presentKey, location.presentDayContext); await prisma.historicalLocation.upsert({ where: { id: location.id }, update: { eraId: location.eraId, regionId: location.regionId, affinityTags: location.affinityTags }, create: { id: location.id, eraId: location.eraId, regionId: location.regionId, historicalNameKey: nameKey, presentContextKey: presentKey, affinityTags: location.affinityTags } }); }
  for (const socialClass of socialClasses) { const key = `class.${socialClass.id}`; await upsertTranslation(key, socialClass.label); await prisma.socialClass.upsert({ where: { id: socialClass.id }, update: { affinityTags: socialClass.affinityTags }, create: { id: socialClass.id, code: socialClass.id, translationKey: key, affinityTags: socialClass.affinityTags } }); }
  for (const occupation of occupations) {
    const key = `occupation.${occupation.id}`; await upsertTranslation(key, occupation.label);
    await prisma.occupation.upsert({ where: { id: occupation.id }, update: { classId: occupation.classId, promptTags: occupation.affinityTags }, create: { id: occupation.id, classId: occupation.classId, translationKey: key, promptTags: occupation.affinityTags } });
    await prisma.occupationRule.deleteMany({ where: { occupationId: occupation.id } });
    const settings = historicalSettings.filter(({ occupationIds }) => occupationIds.includes(occupation.id));
    if (settings.length > 0) await prisma.occupationRule.createMany({ data: settings.map((setting) => ({ occupationId: occupation.id, eraId: setting.eraId, locationId: setting.id, minScores: {}, exclusions: [] })) });
  }
  for (const item of personalities) await prisma.personality.upsert({ where: { id: item.id }, update: {}, create: { id: item.id, translationKey: `personality.${item.id}`, tagRules: item.affinityTags } });
  for (const item of relationships) await prisma.relationship.upsert({ where: { id: item.id }, update: {}, create: { id: item.id, translationKey: `relationship.${item.id}`, tagRules: item.affinityTags, exclusions: [] } });
  for (const item of lifeEvents) await prisma.lifeEvent.upsert({ where: { id: item.id }, update: {}, create: { id: item.id, translationKey: `event.${item.id}`, eraRules: [], locationRules: [], tagRules: item.affinityTags } });
  for (const item of lastMemories) await prisma.lastMemory.upsert({ where: { id: item.id }, update: {}, create: { id: item.id, placeKey: `memory.${item.id}.place`, companionKey: `memory.${item.id}.companion`, emotionKey: `memory.${item.id}.emotion`, regretKey: `memory.${item.id}.regret`, tagRules: item.affinityTags } });

  console.info(`Seeded ${questions.length} questions, ${questions.flatMap(({ choices }) => choices).length} choices, ${tags.length} tags, and ${axes.length} axes for content ${version}`);
}

main().finally(() => prisma.$disconnect());
