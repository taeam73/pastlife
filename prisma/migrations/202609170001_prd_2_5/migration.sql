CREATE TYPE "ViewMode" AS ENUM ('VIDEO', 'TEXT');

ALTER TABLE "sessions"
  ADD COLUMN "viewMode" "ViewMode" NOT NULL DEFAULT 'VIDEO';

DROP INDEX IF EXISTS "sessions_anonymousId_key";
CREATE INDEX "sessions_anonymousId_createdAt_idx" ON "sessions"("anonymousId", "createdAt");

CREATE TABLE "session_questions" (
  "sessionId" TEXT NOT NULL,
  "stage" INTEGER NOT NULL,
  "questionId" TEXT NOT NULL,
  "questionVersion" INTEGER NOT NULL DEFAULT 1,
  "selectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "session_questions_pkey" PRIMARY KEY ("sessionId", "stage"),
  CONSTRAINT "session_questions_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "session_questions_questionId_selectedAt_idx" ON "session_questions"("questionId", "selectedAt");

ALTER TABLE "result_images"
  ADD COLUMN "altText" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "attemptCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "errorCode" TEXT;

DROP INDEX IF EXISTS "result_images_resultId_sourceType_key";
CREATE UNIQUE INDEX "result_images_resultId_key" ON "result_images"("resultId");
