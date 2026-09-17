import { Body, Controller, Get, HttpCode, Inject, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common';
import { CreateSessionRequestSchema, SaveAnswerRequestSchema, UpdateViewModeRequestSchema } from '@pastlife/contracts';
import { SessionsService } from './sessions.service.js';

@Controller('sessions')
export class SessionsController {
  constructor(@Inject(SessionsService) private readonly sessions: SessionsService) {}

  @Post()
  create(@Body() body: unknown) {
    const parsed = CreateSessionRequestSchema.parse(body ?? {});
    return this.sessions.create(parsed.locale, parsed.deviceId, parsed.preferredViewMode);
  }

  @Patch(':id/view-mode')
  viewMode(@Param('id') id: string, @Body() body: unknown) {
    const parsed = UpdateViewModeRequestSchema.parse(body);
    return this.sessions.setViewMode(id, parsed.viewMode);
  }

  @Get(':id/questions/:stage')
  question(@Param('id') id: string, @Param('stage', ParseIntPipe) stage: number) {
    return this.sessions.question(id, stage);
  }

  @Put(':id/answers/:stage')
  answer(@Param('id') id: string, @Param('stage', ParseIntPipe) stage: number, @Body() body: unknown) {
    const parsed = SaveAnswerRequestSchema.parse(body);
    return this.sessions.saveAnswer(id, stage, parsed.questionId, parsed.choiceId);
  }

  @Post(':id/complete')
  @HttpCode(202)
  complete(@Param('id') id: string) {
    return this.sessions.complete(id);
  }
}
