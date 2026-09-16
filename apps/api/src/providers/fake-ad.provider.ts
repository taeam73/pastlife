import { Injectable } from '@nestjs/common';
import type { AdProvider, AdVerification } from './ad.provider.js';

@Injectable()
export class FakeAdProvider implements AdProvider {
  async load() {}
  async show() {}
  async verifyCompletion({ slot, providerEventId }: AdVerification) {
    return slot >= 1 && slot <= 3 && providerEventId.startsWith(`fake-ad-${slot}-`);
  }
}
