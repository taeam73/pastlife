import { z } from 'zod';

export const errorCodes = [
  'VALIDATION_ERROR',
  'SESSION_EXPIRED',
  'INVALID_STATE',
  'UNLOCK_REQUIRED',
  'AD_NOT_VERIFIED',
  'RESULT_NOT_READY',
  'RATE_LIMITED',
  'GENERATION_FAILED',
] as const;

export const ApiErrorSchema = z.object({
  code: z.enum(errorCodes),
  message: z.string(),
  slot: z.number().int().min(1).max(3).optional(),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;
