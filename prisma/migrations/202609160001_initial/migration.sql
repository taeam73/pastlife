-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('CREATED', 'QUESTION_IN_PROGRESS', 'QUESTION_COMPLETE', 'CALCULATING', 'NARRATIVE_GENERATING', 'RESULT_READY', 'BASIC_UNLOCKED', 'DEEP_UNLOCKED', 'GUIDE_UNLOCKED', 'IMAGE_GENERATING', 'IMAGE_READY', 'IMAGE_FAILED', 'COMPLETED', 'ARCHIVED', 'FAILED');

-- CreateEnum
CREATE TYPE "ResultStatus" AS ENUM ('NARRATIVE_GENERATING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "AdEventStatus" AS ENUM ('VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "UnlockType" AS ENUM ('BASIC', 'DEEP', 'GUIDE');

-- CreateTable
CREATE TABLE "content_versions" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "digest" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "stage" INTEGER NOT NULL,
    "translationKey" TEXT NOT NULL,
    "weightProfile" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "contentVersionId" TEXT NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "choices" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "translationKey" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL,

    CONSTRAINT "choices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "group" TEXT NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "choice_tag_scores" (
    "choiceId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,

    CONSTRAINT "choice_tag_scores_pkey" PRIMARY KEY ("choiceId","tagId")
);

-- CreateTable
CREATE TABLE "choice_axis_scores" (
    "choiceId" TEXT NOT NULL,
    "axisCode" TEXT NOT NULL,
    "score" INTEGER NOT NULL,

    CONSTRAINT "choice_axis_scores_pkey" PRIMARY KEY ("choiceId","axisCode")
);

-- CreateTable
CREATE TABLE "eras" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "yearStart" INTEGER NOT NULL,
    "yearEnd" INTEGER NOT NULL,
    "translationKey" TEXT NOT NULL,
    "affinityTags" JSONB NOT NULL,

    CONSTRAINT "eras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regions" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "translationKey" TEXT NOT NULL,
    "affinityTags" JSONB NOT NULL,

    CONSTRAINT "regions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historical_locations" (
    "id" TEXT NOT NULL,
    "eraId" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "historicalNameKey" TEXT NOT NULL,
    "presentContextKey" TEXT NOT NULL,
    "affinityTags" JSONB NOT NULL,

    CONSTRAINT "historical_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_classes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "translationKey" TEXT NOT NULL,
    "affinityTags" JSONB NOT NULL,

    CONSTRAINT "social_classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "occupations" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "translationKey" TEXT NOT NULL,
    "promptTags" JSONB NOT NULL,

    CONSTRAINT "occupations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "occupation_rules" (
    "id" TEXT NOT NULL,
    "occupationId" TEXT NOT NULL,
    "eraId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "minScores" JSONB NOT NULL,
    "exclusions" JSONB NOT NULL,

    CONSTRAINT "occupation_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personalities" (
    "id" TEXT NOT NULL,
    "translationKey" TEXT NOT NULL,
    "tagRules" JSONB NOT NULL,

    CONSTRAINT "personalities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "relationships" (
    "id" TEXT NOT NULL,
    "translationKey" TEXT NOT NULL,
    "tagRules" JSONB NOT NULL,
    "exclusions" JSONB NOT NULL,

    CONSTRAINT "relationships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "life_events" (
    "id" TEXT NOT NULL,
    "translationKey" TEXT NOT NULL,
    "eraRules" JSONB NOT NULL,
    "locationRules" JSONB NOT NULL,
    "tagRules" JSONB NOT NULL,

    CONSTRAINT "life_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "last_memories" (
    "id" TEXT NOT NULL,
    "placeKey" TEXT NOT NULL,
    "companionKey" TEXT NOT NULL,
    "emotionKey" TEXT NOT NULL,
    "regretKey" TEXT NOT NULL,
    "tagRules" JSONB NOT NULL,

    CONSTRAINT "last_memories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "translations" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "version" TEXT NOT NULL,

    CONSTRAINT "translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "anonymousId" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'ko',
    "seed" TEXT NOT NULL,
    "contentVersion" TEXT NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'CREATED',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_answers" (
    "sessionId" TEXT NOT NULL,
    "stage" INTEGER NOT NULL,
    "questionId" TEXT NOT NULL,
    "choiceId" TEXT NOT NULL,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_answers_pkey" PRIMARY KEY ("sessionId","stage")
);

-- CreateTable
CREATE TABLE "results" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "answerHash" TEXT NOT NULL,
    "contentVersion" TEXT NOT NULL,
    "recordNo" INTEGER NOT NULL,
    "coreJson" JSONB NOT NULL,
    "status" "ResultStatus" NOT NULL DEFAULT 'NARRATIVE_GENERATING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "result_texts" (
    "id" TEXT NOT NULL,
    "resultId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "blocksJson" JSONB NOT NULL,
    "generatorVersion" TEXT NOT NULL,

    CONSTRAINT "result_texts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "result_images" (
    "id" TEXT NOT NULL,
    "resultId" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "storageUrl" TEXT NOT NULL,
    "promptHash" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "result_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ad_events" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "slot" INTEGER NOT NULL,
    "providerEventId" TEXT NOT NULL,
    "status" "AdEventStatus" NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ad_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_unlocks" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "unlockType" "UnlockType" NOT NULL,
    "adEventId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_unlocks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "content_versions_version_key" ON "content_versions"("version");

-- CreateIndex
CREATE INDEX "questions_stage_contentVersionId_idx" ON "questions"("stage", "contentVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "choices_questionId_displayOrder_key" ON "choices"("questionId", "displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "tags_code_key" ON "tags"("code");

-- CreateIndex
CREATE UNIQUE INDEX "eras_code_key" ON "eras"("code");

-- CreateIndex
CREATE UNIQUE INDEX "regions_code_key" ON "regions"("code");

-- CreateIndex
CREATE INDEX "historical_locations_eraId_regionId_idx" ON "historical_locations"("eraId", "regionId");

-- CreateIndex
CREATE UNIQUE INDEX "historical_locations_id_eraId_regionId_key" ON "historical_locations"("id", "eraId", "regionId");

-- CreateIndex
CREATE UNIQUE INDEX "social_classes_code_key" ON "social_classes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "occupation_rules_occupationId_eraId_locationId_key" ON "occupation_rules"("occupationId", "eraId", "locationId");

-- CreateIndex
CREATE UNIQUE INDEX "translations_locale_key_version_key" ON "translations"("locale", "key", "version");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_anonymousId_key" ON "sessions"("anonymousId");

-- CreateIndex
CREATE INDEX "sessions_contentVersion_status_idx" ON "sessions"("contentVersion", "status");

-- CreateIndex
CREATE UNIQUE INDEX "results_sessionId_key" ON "results"("sessionId");

-- CreateIndex
CREATE INDEX "results_answerHash_contentVersion_idx" ON "results"("answerHash", "contentVersion");

-- CreateIndex
CREATE UNIQUE INDEX "result_texts_resultId_locale_key" ON "result_texts"("resultId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "result_images_resultId_sourceType_key" ON "result_images"("resultId", "sourceType");

-- CreateIndex
CREATE UNIQUE INDEX "ad_events_providerEventId_key" ON "ad_events"("providerEventId");

-- CreateIndex
CREATE INDEX "ad_events_sessionId_slot_idx" ON "ad_events"("sessionId", "slot");

-- CreateIndex
CREATE UNIQUE INDEX "session_unlocks_adEventId_key" ON "session_unlocks"("adEventId");

-- CreateIndex
CREATE UNIQUE INDEX "session_unlocks_sessionId_unlockType_key" ON "session_unlocks"("sessionId", "unlockType");

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_contentVersionId_fkey" FOREIGN KEY ("contentVersionId") REFERENCES "content_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "choices" ADD CONSTRAINT "choices_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "choice_tag_scores" ADD CONSTRAINT "choice_tag_scores_choiceId_fkey" FOREIGN KEY ("choiceId") REFERENCES "choices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "choice_tag_scores" ADD CONSTRAINT "choice_tag_scores_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "choice_axis_scores" ADD CONSTRAINT "choice_axis_scores_choiceId_fkey" FOREIGN KEY ("choiceId") REFERENCES "choices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historical_locations" ADD CONSTRAINT "historical_locations_eraId_fkey" FOREIGN KEY ("eraId") REFERENCES "eras"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historical_locations" ADD CONSTRAINT "historical_locations_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "regions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "occupation_rules" ADD CONSTRAINT "occupation_rules_occupationId_fkey" FOREIGN KEY ("occupationId") REFERENCES "occupations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_answers" ADD CONSTRAINT "session_answers_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "results" ADD CONSTRAINT "results_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "result_texts" ADD CONSTRAINT "result_texts_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "results"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "result_images" ADD CONSTRAINT "result_images_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "results"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ad_events" ADD CONSTRAINT "ad_events_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_unlocks" ADD CONSTRAINT "session_unlocks_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_unlocks" ADD CONSTRAINT "session_unlocks_adEventId_fkey" FOREIGN KEY ("adEventId") REFERENCES "ad_events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- User and archive persistence (added in the authentication/archive stage)
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'google',
    "providerSub" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "archive_entries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resultId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "archive_entries_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "archive_entries_userId_resultId_key" ON "archive_entries"("userId", "resultId");
CREATE INDEX "archive_entries_userId_createdAt_idx" ON "archive_entries"("userId", "createdAt");
ALTER TABLE "archive_entries" ADD CONSTRAINT "archive_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "archive_entries" ADD CONSTRAINT "archive_entries_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "results"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "target" TEXT,
    "requestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");
CREATE INDEX "audit_logs_action_createdAt_idx" ON "audit_logs"("action", "createdAt");
