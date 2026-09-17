import { BadRequestException, Body, Controller, Inject, Post } from '@nestjs/common';
import { CreateAnalyticsEventRequestSchema } from '@pastlife/contracts';
import { AnalyticsService } from './analytics.service.js';

@Controller('analytics')
export class AnalyticsController {
  constructor(@Inject(AnalyticsService) private readonly analytics: AnalyticsService) {}

  @Post('events')
  event(@Body() body: unknown) {
    const parsed = CreateAnalyticsEventRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({ code: 'VALIDATION_ERROR', message: 'Analytics event contains an unsupported name or metadata field' });
    }
    return this.analytics.record(parsed.data.name, parsed.data.metadata, parsed.data.occurredAt);
  }
}
