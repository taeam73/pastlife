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
export const BasicResultResponseSchema = z.object({
  resultId: z.string(),
  recordNo: z.number().int().min(1).max(99),
  headline: z.string(),
  image: z.object({ sourceType: z.enum(['AI', 'LIBRARY']), uri: z.string(), alt: z.string(), status: z.enum(['READY', 'FALLBACK']) }),
  blocks: z.array(BasicBlockSchema).length(7),
  disclaimer: z.string(),
});

export const ExtendedResultResponseSchema = z.object({
  resultId: z.string(),
  image: z.object({ sourceType: z.enum(['AI', 'LIBRARY']), uri: z.string(), alt: z.string(), status: z.enum(['READY', 'FALLBACK']) }),
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
