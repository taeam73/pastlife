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
export const AdChallengeResponseSchema = z.object({ customData: z.string().min(1) });
export const AdStatusResponseSchema = z.object({ sessionId: z.string(), slot: z.number().int().min(1).max(3), unlocked: z.boolean() });

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
const ResultPresentationHeroV2Schema = z.object({
  title: z.string().min(1),
  tagline: z.string().min(1),
  lifeSummary: z.string().min(1),
  backgroundUri: z.string().min(1),
  characterUri: z.string().nullable(),
});
const ResultPresentationChaptersSchema = z.tuple([
    z.object({ id: z.literal('MEETING'), title: z.string().min(1), body: z.string().min(1), profilePages: z.array(z.object({ title: z.string().min(1), body: z.string().min(1) })).min(2).max(4).optional(), crop: z.object({ focusX: z.number().min(0).max(1), focusY: z.number().min(0).max(1), zoom: z.number().min(1) }) }),
    z.object({ id: z.literal('TRIAL'), title: z.string().min(1), body: z.string().min(1), crop: z.object({ focusX: z.number().min(0).max(1), focusY: z.number().min(0).max(1), zoom: z.number().min(1) }) }),
    z.object({ id: z.literal('CHOICE'), title: z.string().min(1), body: z.string().min(1), crop: z.object({ focusX: z.number().min(0).max(1), focusY: z.number().min(0).max(1), zoom: z.number().min(1) }) }),
    z.object({ id: z.literal('NOW'), title: z.string().min(1), body: z.string().min(1), crop: z.object({ focusX: z.number().min(0).max(1), focusY: z.number().min(0).max(1), zoom: z.number().min(1) }) }),
]);
export const ResultPresentationV2Schema = z.object({
  version: z.literal(2),
  hero: ResultPresentationHeroV2Schema,
  chapters: ResultPresentationChaptersSchema,
});
export const ResultPresentationV3Schema = z.object({
  version: z.literal(3),
  hero: ResultPresentationHeroV2Schema.extend({
    signatureQuote: z.string().min(1).max(80),
    cover: z.object({
      era: z.string().min(1),
      place: z.string().min(1),
      role: z.string().min(1),
      birthYear: z.string().min(1),
      deathYear: z.string().min(1),
      lifeLine: z.string().min(1),
    }).optional(),
  }),
  chapters: ResultPresentationChaptersSchema,
});
export const ResultPresentationSchema = z.discriminatedUnion('version', [ResultPresentationV2Schema, ResultPresentationV3Schema]);
export const BasicResultResponseSchema = z.object({
  resultId: z.string(),
  finalMomentRead: z.boolean().optional(),
  finalMomentAvailable: z.boolean().optional(),
  recordNo: z.number().int().min(1).max(99),
  headline: z.string(),
  character: z.object({
    name: z.string(), gender: z.string().min(1).nullable(), fictional: z.literal(true), appearance: z.string(),
    introduction: z.string(), occupationDescription: z.string(),
    temperament: z.string(), complex: z.string(), socialMask: z.string(), stressResponse: z.string(), familyStructure: z.string(), primaryCaregiver: z.string(),
    occupation: z.string(), hobby: z.string(), dream: z.string(), talent: z.string(), weakness: z.string(), favoritePlace: z.string(), belief: z.string(),
    formativeWound: z.string(), centralContradiction: z.string(), realization: z.string(),
  }),
  image: ResultImageSchema,
  presentation: ResultPresentationSchema.optional(),
  lifeSummary: z.object({ ageAtDeath: z.number().int().positive().nullable(), lifespanLabel: z.string(), endingTitle: z.string() }),
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

export const StoryFinalMomentResponseSchema = z.object({
  resultId: z.string(),
  storyId: z.string().min(1),
  protagonist: z.string().min(1),
  year: z.string().min(1),
  place: z.string().min(1),
  scene: z.string().min(1),
  afterword: z.string().min(1),
  illustration: z.object({ uri: z.string().min(1), alt: z.string().min(1) }),
});

export const FinalMomentReadResponseSchema = z.object({
  resultId: z.string(),
  finalMomentRead: z.literal(true),
  readAt: z.string().datetime(),
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
  layers: z.array(ImageLayerSchema).default([]),
  compositeSource: z.enum(['SERVER_COMPOSITE', 'LAYERED_PREVIEW', 'SINGLE_IMAGE']),
  deepLink: z.string(),
  storeFallbackUrl: z.string().url(),
});
