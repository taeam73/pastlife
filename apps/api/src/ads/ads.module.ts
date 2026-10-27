import { Module } from '@nestjs/common';
import { AdMobCallbackController, AdsController } from './ads.controller.js';
import { AdsService } from './ads.service.js';

@Module({ controllers: [AdsController, AdMobCallbackController], providers: [AdsService] })
export class AdsModule {}
