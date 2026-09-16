import { z } from 'zod';
export const GoogleExchangeRequestSchema = z.object({ idToken: z.string().min(3) });
export const AuthResponseSchema = z.object({ accessToken: z.string().min(20), user: z.object({ id: z.string(), email: z.string().email(), name: z.string() }) });
export const ArchiveItemSchema = z.object({ resultId: z.string(), recordNo: z.number().int().min(1).max(99), headline: z.string(), createdAt: z.string().datetime() });
export const ArchiveResponseSchema = z.object({ items: z.array(ArchiveItemSchema) });
export const ArchiveSaveResponseSchema = z.object({ resultId: z.string(), saved: z.boolean() });
