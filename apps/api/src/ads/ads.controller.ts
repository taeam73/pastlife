import { Body, Controller, Get, Inject, Param, ParseIntPipe, Post, Req } from '@nestjs/common';
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

  @Post(':id/ads/:slot/challenge')
  challenge(@Param('id') id: string, @Param('slot', ParseIntPipe) slot: number) { return this.ads.challenge(id, slot); }

  @Get(':id/ads/:slot/status')
  status(@Param('id') id: string, @Param('slot', ParseIntPipe) slot: number) { return this.ads.status(id, slot); }
}

@Controller('ads')
export class AdMobCallbackController {
  constructor(@Inject(AdsService) private readonly ads: AdsService) {}

  @Get('admob/ssv')
  callback(@Req() request: { originalUrl: string }) {
    return this.ads.admobCallback(request.originalUrl.split('?').slice(1).join('?'));
  }
}
