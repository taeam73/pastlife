import { z } from 'zod';
import { SessionStatusSchema } from './session';

export const ResultStatusResponseSchema = z.object({
  resultId: z.string(),
  sessionId: z.string(),
  status: SessionStatusSchema,
  imageStatus: z.enum(['LIBRARY_READY', 'NOT_REQUESTED']).default('LIBRARY_READY'),
});

export const AdCompletionRequestSchema = z.object({ providerEventId: z.string().min(1) });
export const UnlockResponseSchema = z.object({ sessionId: z.string(), unlockType: z.enum(['BASIC', 'DEEP', 'GUIDE']), unlocked: z.boolean() });

export const BasicBlockSchema = z.object({ id: z.string(), title: z.string(), body: z.string() });
export const BasicResultResponseSchema = z.object({
  resultId: z.string(),
  recordNo: z.number().int().min(1).max(99),
  headline: z.string(),
  image: z.object({ sourceType: z.literal('LIBRARY'), uri: z.string(), alt: z.string() }),
  blocks: z.array(BasicBlockSchema).length(7),
  disclaimer: z.string(),
});

export const ExtendedResultResponseSchema = z.object({
  resultId: z.string(),
  blocks: z.array(BasicBlockSchema).length(4),
  disclaimer: z.string(),
});

export const ShareResultResponseSchema = z.object({
  resultId: z.string(),
  shareToken: z.string().min(8),
  shareUrl: z.string().url(),
  expiresAt: z.string().datetime(),
});
