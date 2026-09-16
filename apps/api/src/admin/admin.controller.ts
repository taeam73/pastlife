import { Body, Controller, Get, Headers, NotFoundException, UnauthorizedException, Param, Post, Put, Inject, Query } from '@nestjs/common';
import { axes, eras, questions, regions, tags } from '@pastlife/content';
import { z } from 'zod';
import { AdminService } from './admin.service.js';
@Controller('admin/content')
export class AdminController {
  constructor(@Inject(AdminService) private readonly service: AdminService) {}
  @Get('summary')
  summary(@Headers('x-admin-token') token?: string) { this.authorize(token); return { contentVersion: process.env.CONTENT_VERSION ?? '2.0.0', questions: questions.length, choices: questions.reduce((sum, q) => sum + q.choices.length, 0), tags: tags.length, axes: axes.length, eras: eras.length, regions: regions.length, generatedAt: new Date().toISOString() }; }
  @Get('questions')
  listQuestions(@Headers('x-admin-token') token?: string) { this.authorize(token); return { items: questions.map(({ id, stage, text, choices }) => ({ id, stage, text, choiceCount: choices.length })) }; }
  @Get('questions/:id')
  getQuestion(@Param('id') id: string, @Headers('x-admin-token') token?: string) { this.authorize(token); const question = questions.find((item) => item.id === id); if (!question) throw new NotFoundException({ code: 'QUESTION_NOT_FOUND', message: 'Question not found' }); return question; }
  @Put('questions/:id/draft') saveDraft(@Param('id') id: string, @Body() body: unknown, @Headers('x-admin-token') token?: string) { this.authorize(token); if (!this.service.hasQuestion(id)) throw new NotFoundException({ code: 'QUESTION_NOT_FOUND', message: 'Question not found' }); const parsed = z.object({ text: z.string().min(1).max(500).optional(), choices: z.record(z.string(), z.string().min(1).max(500)).optional() }).parse(body); return this.service.saveDraft({ id, ...parsed }); }
  @Get('drafts') drafts(@Headers('x-admin-token') token?: string) { this.authorize(token); return this.service.listDrafts(); }
  @Post('publish') publish(@Headers('x-admin-token') token?: string) { this.authorize(token); return this.service.publish(); }
  @Get('publish-history') publishHistory(@Headers('x-admin-token') token?: string) { this.authorize(token); return this.service.publishHistory(); }
  @Post('rollback') rollback(@Query('digest') digest: string, @Headers('x-admin-token') token?: string) { this.authorize(token); return this.service.rollback(digest); }
  @Get('audit-log') auditLog(@Headers('x-admin-token') token?: string) { this.authorize(token); return this.service.auditLog(); }
  private authorize(token?: string) { const expected = process.env.ADMIN_TOKEN; if (expected && token !== expected) throw new UnauthorizedException({ code: 'ADMIN_UNAUTHORIZED', message: 'Admin token required' }); }
}
