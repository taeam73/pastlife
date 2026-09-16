import { Module } from '@nestjs/common';
import { AdsController } from './ads.controller.js';
import { AdsService } from './ads.service.js';

@Module({ controllers: [AdsController], providers: [AdsService] })
export class AdsModule {}
