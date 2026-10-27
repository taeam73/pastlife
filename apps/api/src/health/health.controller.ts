import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  get() {
    return {
      status: 'ok' as const,
      contentVersion: process.env.CONTENT_VERSION ?? '3.0.0',
    };
  }
}
