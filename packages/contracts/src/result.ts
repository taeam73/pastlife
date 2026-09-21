import { z } from 'zod';
import { SessionStatusSchema } from './session';

export const ResultStatusResponseSchema = z.object({
  resultId: z.string(),
  sessionId: z.string(),
  status: SessionStatusSchema,
  viewMode: z.enum(['VIDEO', 'TEXT']),
  imageStatus: z.enum(['PENDING', 'GENERATING', 'READY', 'FALLBACK']).default('PENDING'),
});

export const AdCompletionRequestSchema = z.object({ providerEventId: z.string().min(1) });
export const UnlockResponseSchema = z.object({ sessionId: z.string(), unlockType: z.enum(['BASIC', 'DEEP', 'GUIDE']), unlocked: z.boolean() });

export const BasicBlockSchema = z.object({ id: z.string(), title: z.string(), body: z.string() });
export const ImageLayerSchema = z.object({ uri: z.string(), role: z.enum(['BACKGROUND', 'CHARACTER', 'EFFECT']), alt: z.string() });
export const ResultImageSchema = z.object({
  sourceType: z.enum(['AI', 'LIBRARY']), uri: z.string(), alt: z.string(), status: z.enum(['READY', 'FALLBACK']),
  layers: z.array(ImageLayerSchema).optional(), compositeUri: z.string().optional(),
});
export const StoryHighlightSchema = z.object({
  id: z.enum(['IDENTITY', 'DREAM_AND_DAILY', 'LIFE_FOUNDATION', 'INNER_WOUND', 'KEY_RELATIONSHIP', 'DECISIVE_EVENT', 'LIFE_LEGACY', 'PRESENT_ECHO']),
  title: z.string(),
  summary: z.string(),
  detail: z.string(),
});
export const BasicResultResponseSchema = z.object({
  resultId: z.string(),
  recordNo: z.number().int().min(1).max(99),
  headline: z.string(),
  character: z.object({
    name: z.string(), gender: z.enum(['여성', '남성']), fictional: z.literal(true), appearance: z.string(),
    temperament: z.string(), complex: z.string(), socialMask: z.string(), stressResponse: z.string(), familyStructure: z.string(), primaryCaregiver: z.string(),
    occupation: z.string(), hobby: z.string(), dream: z.string(), talent: z.string(), weakness: z.string(), favoritePlace: z.string(), belief: z.string(),
    formativeWound: z.string(), centralContradiction: z.string(), realization: z.string(),
  }),
  image: ResultImageSchema,
  lifeSummary: z.object({ ageAtDeath: z.number().int().positive(), lifespanLabel: z.string(), endingTitle: z.string() }),
  highlights: z.array(StoryHighlightSchema).length(8),
  blocks: z.array(BasicBlockSchema).length(6),
  disclaimer: z.string(),
});

export const ExtendedResultResponseSchema = z.object({
  resultId: z.string(),
  image: ResultImageSchema,
  blocks: z.array(BasicBlockSchema).length(4),
  disclaimer: z.string(),
});

export const ShareResultResponseSchema = z.object({
  resultId: z.string(),
  shareToken: z.string().min(8),
  shareUrl: z.string().url(),
  expiresAt: z.string().datetime(),
});

export const ShareAssetTypeSchema = z.enum(['VIDEO', 'IMAGE']);
export const CreateShareAssetRequestSchema = z.object({
  type: ShareAssetTypeSchema,
  locale: z.string().min(2).max(12).default('ko'),
});
export const ShareAssetResponseSchema = z.object({
  resultId: z.string(),
  shareId: z.string().min(8),
  type: ShareAssetTypeSchema,
  status: z.enum(['READY', 'TEMPLATE_READY']),
  uri: z.string(),
  sourceImageUri: z.string(),
  deepLink: z.string(),
  storeFallbackUrl: z.string().url(),
});
