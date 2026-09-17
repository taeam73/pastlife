CREATE TABLE "analytics_events" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "sessionId" TEXT,
  "resultId" TEXT,
  "contentVersion" TEXT,
  "locale" TEXT,
  "platform" TEXT,
  "metadata" JSONB NOT NULL,
  "occurredAt" TIMESTAMP(3) NOT NULL,
  "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "analytics_events_name_occurredAt_idx" ON "analytics_events"("name", "occurredAt");
CREATE INDEX "analytics_events_sessionId_occurredAt_idx" ON "analytics_events"("sessionId", "occurredAt");
CREATE INDEX "analytics_events_resultId_occurredAt_idx" ON "analytics_events"("resultId", "occurredAt");
