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
} from '@pastlife/content';

const prisma = new PrismaClient();
const version = process.env.CONTENT_VERSION ?? '2.0.0';
const digest = createHash('sha256').update(JSON.stringify(questions)).digest('hex');

const tagGroup = (tag: string) => {
  if (['freedom', 'stability', 'achievement', 'honor', 'knowledge', 'spirituality'].includes(tag)) return 'LIFE_DIRECTION';
  if (['adventure', 'survival', 'courage', 'independence', 'creativity'].includes(tag)) return 'ACTION';
  if (['connection', 'devotion', 'empathy', 'protection'].includes(tag)) return 'RELATIONSHIP';
  return 'INNER';
};

async function main() {
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

  for (const era of eras) await prisma.era.upsert({ where: { id: era.id }, update: {}, create: { id: era.id, code: era.code, yearStart: era.yearStart, yearEnd: era.yearEnd, translationKey: `era.${era.id}`, affinityTags: era.affinityTags } });
  for (const region of regions) await prisma.region.upsert({ where: { id: region.id }, update: {}, create: { id: region.id, code: region.code, translationKey: `region.${region.id}`, affinityTags: region.affinityTags } });
  for (const location of historicalLocations) await prisma.historicalLocation.upsert({ where: { id: location.id }, update: {}, create: { id: location.id, eraId: location.eraId, regionId: location.regionId, historicalNameKey: `location.${location.id}.name`, presentContextKey: `location.${location.id}.present`, affinityTags: location.affinityTags } });
  for (const socialClass of socialClasses) await prisma.socialClass.upsert({ where: { id: socialClass.id }, update: {}, create: { id: socialClass.id, code: socialClass.id, translationKey: `class.${socialClass.id}`, affinityTags: socialClass.affinityTags } });
  for (const occupation of occupations) {
    await prisma.occupation.upsert({ where: { id: occupation.id }, update: {}, create: { id: occupation.id, classId: occupation.classId, translationKey: `occupation.${occupation.id}`, promptTags: occupation.affinityTags } });
    await prisma.occupationRule.upsert({ where: { occupationId_eraId_locationId: { occupationId: occupation.id, eraId: occupation.allowedEraIds[0]!, locationId: occupation.allowedLocationIds[0]! } }, update: {}, create: { occupationId: occupation.id, eraId: occupation.allowedEraIds[0]!, locationId: occupation.allowedLocationIds[0]!, minScores: {}, exclusions: [] } });
  }
  for (const item of personalities) await prisma.personality.upsert({ where: { id: item.id }, update: {}, create: { id: item.id, translationKey: `personality.${item.id}`, tagRules: item.affinityTags } });
  for (const item of relationships) await prisma.relationship.upsert({ where: { id: item.id }, update: {}, create: { id: item.id, translationKey: `relationship.${item.id}`, tagRules: item.affinityTags, exclusions: [] } });
  for (const item of lifeEvents) await prisma.lifeEvent.upsert({ where: { id: item.id }, update: {}, create: { id: item.id, translationKey: `event.${item.id}`, eraRules: [], locationRules: [], tagRules: item.affinityTags } });
  for (const item of lastMemories) await prisma.lastMemory.upsert({ where: { id: item.id }, update: {}, create: { id: item.id, placeKey: `memory.${item.id}.place`, companionKey: `memory.${item.id}.companion`, emotionKey: `memory.${item.id}.emotion`, regretKey: `memory.${item.id}.regret`, tagRules: item.affinityTags } });

  console.info(`Seeded ${questions.length} questions, ${questions.flatMap(({ choices }) => choices).length} choices, ${tags.length} tags, and ${axes.length} axes for content ${version}`);
}

main().finally(() => prisma.$disconnect());
