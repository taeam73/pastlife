import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { CreateShareAssetRequestSchema } from '@pastlife/contracts';
import { ResultsService } from './results.service.js';

@Controller('results')
export class ResultsController {
  constructor(@Inject(ResultsService) private readonly results: ResultsService) {}

  @Get(':id/status')
  status(@Param('id') id: string) { return this.results.status(id); }

  @Get(':id/basic')
  basic(@Param('id') id: string) { return this.results.basic(id); }

  @Get(':id/deep')
  deep(@Param('id') id: string) { return this.results.deep(id); }

  @Get(':id/guide')
  guide(@Param('id') id: string) { return this.results.guide(id); }

  @Get(':id/share')
  share(@Param('id') id: string) { return this.results.share(id); }

  @Post(':id/share-assets')
  createShareAsset(@Param('id') id: string, @Body() body: unknown) {
    const parsed = CreateShareAssetRequestSchema.parse(body);
    return this.results.createShareAsset(id, parsed.type, parsed.locale);
  }
}
