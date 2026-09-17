import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { ProvidersModule } from '../providers/providers.module.js';
import { ResultsModule } from '../results/results.module.js';
@Module({ imports: [ProvidersModule, ResultsModule], controllers: [AuthController], providers: [AuthService] })
export class AuthModule {}
