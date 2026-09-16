import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AdsModule } from './ads/ads.module.js';
import { ProvidersModule } from './providers/providers.module.js';
import { ResultsModule } from './results/results.module.js';
import { SessionsModule } from './sessions/sessions.module.js';
import { AuthModule } from './auth/auth.module.js';
import { AdminModule } from './admin/admin.module.js';
import { rateLimitMiddleware } from './rate-limit.middleware.js';

@Module({
  imports: [ProvidersModule, SessionsModule, ResultsModule, AdsModule, AuthModule, AdminModule],
})
export class AppModule implements NestModule { configure(consumer: MiddlewareConsumer) { consumer.apply(rateLimitMiddleware).forRoutes('{*path}'); } }
