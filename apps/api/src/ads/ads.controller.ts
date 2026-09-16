import { Body, Controller, Inject, Param, ParseIntPipe, Post } from '@nestjs/common';
import { AdCompletionRequestSchema } from '@pastlife/contracts';
import { AdsService } from './ads.service.js';

@Controller('sessions')
export class AdsController {
  constructor(@Inject(AdsService) private readonly ads: AdsService) {}

  @Post(':id/ads/:slot/complete')
  complete(@Param('id') id: string, @Param('slot', ParseIntPipe) slot: number, @Body() body: unknown) {
    const parsed = AdCompletionRequestSchema.parse(body);
    return this.ads.complete(id, slot, parsed.providerEventId);
  }
}
