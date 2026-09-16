import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { requestIdMiddleware } from './request-id.middleware.js';

async function bootstrap() {
  const envPath = fileURLToPath(new URL('../../../.env', import.meta.url));
  if (existsSync(envPath)) process.loadEnvFile(envPath);

  const { AppModule } = await import('./app.module.js');
  const app = await NestFactory.create(AppModule);
  const repository = process.env.DATABASE_URL && process.env.USE_IN_MEMORY_DB !== 'true' ? 'Prisma' : 'memory';
  Logger.log(`Assessment repository: ${repository}`, 'Bootstrap');
  app.setGlobalPrefix('api/v1');
  app.enableCors();
  app.use(requestIdMiddleware);
  await app.listen(Number(process.env.PORT ?? 4000));
}

void bootstrap();
