import { Inject, Injectable } from '@nestjs/common';
import type { ResultCore } from '@pastlife/scoring';
import type { NarrativeProvider } from './narrative.provider.js';
import type { NarrativeBlock } from '../repositories/assessment.repository.js';
import { TemplateNarrativeProvider } from './template-narrative.provider.js';

@Injectable()
export class AiNarrativeProvider implements NarrativeProvider {
  constructor(@Inject(TemplateNarrativeProvider) private readonly fallback: TemplateNarrativeProvider) {}
  async createBasic(core: ResultCore): Promise<NarrativeBlock[]> {
    const endpoint = process.env.AI_TEXT_API_URL;
    if (!endpoint) return this.fallback.createBasic(core);
    try {
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(process.env.AI_TEXT_API_KEY ? { Authorization: `Bearer ${process.env.AI_TEXT_API_KEY}` } : {}) }, body: JSON.stringify({ core, locale: 'ko', version: process.env.CONTENT_VERSION ?? '2.5.0' }) });
      if (!response.ok) return this.fallback.createBasic(core);
      const body = (await response.json()) as { blocks?: NarrativeBlock[] };
      if (!body.blocks || body.blocks.length !== 7) return this.fallback.createBasic(core);
      return body.blocks;
    } catch { return this.fallback.createBasic(core); }
  }
}
