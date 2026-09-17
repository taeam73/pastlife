import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import type { AnalyticsEventName, AnalyticsMetadata } from '@pastlife/contracts';
import { Prisma } from '@prisma/client';
import { resolveDatabaseRuntimeConfig } from '../config/database.js';
import { PrismaService } from '../prisma/prisma.service.js';

type AnalyticsRecord = {
  id: string;
  name: AnalyticsEventName;
  occurredAt: Date;
  metadata: AnalyticsMetadata;
};

@Injectable()
export class AnalyticsService {
  private readonly memoryEvents: AnalyticsRecord[] = [];

  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async record(name: AnalyticsEventName, metadata: AnalyticsMetadata, occurredAt?: string) {
    const record: AnalyticsRecord = {
      id: randomUUID(),
      name,
      metadata,
      occurredAt: occurredAt ? new Date(occurredAt) : new Date(),
    };
    if (resolveDatabaseRuntimeConfig().mode === 'prisma') {
      await this.prisma.analyticsEvent.create({
        data: {
          id: record.id,
          name,
          sessionId: metadata.sessionId ?? null,
          resultId: metadata.resultId ?? null,
          contentVersion: metadata.contentVersion ?? null,
          locale: metadata.locale ?? null,
          platform: metadata.platform ?? null,
          metadata: metadata as Prisma.InputJsonValue,
          occurredAt: record.occurredAt,
        },
      });
    } else {
      this.memoryEvents.push(record);
      if (this.memoryEvents.length > 10_000) this.memoryEvents.shift();
    }
    return { eventId: record.id, accepted: true as const };
  }

  countForTesting() {
    return this.memoryEvents.length;
  }
}
