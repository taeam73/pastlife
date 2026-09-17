import { z } from 'zod';

export const AnalyticsEventNameSchema = z.enum([
  'session_started',
  'question_shown',
  'answer_selected',
  'questions_completed',
  'ad_started',
  'ad_completed',
  'ad_failed',
  'basic_result_viewed',
  'view_mode_changed',
  'deep_cta_clicked',
  'deep_unlocked',
  'guide_cta_clicked',
  'guide_unlocked',
  'image_ready',
  'image_fallback_used',
  'share_format_selected',
  'share_asset_ready',
  'share_completed',
  'new_past_life_clicked',
  'google_login_started',
  'google_login_completed',
  'archive_saved',
  'deep_link_opened',
  'store_redirected',
]);

export const AnalyticsMetadataSchema = z.object({
  sessionId: z.string().uuid().optional(),
  resultId: z.string().uuid().optional(),
  questionId: z.string().max(64).optional(),
  choiceId: z.string().max(64).optional(),
  contentVersion: z.string().max(32).optional(),
  sessionStatus: z.string().max(40).optional(),
  locale: z.string().min(2).max(12).optional(),
  platform: z.enum(['android', 'ios', 'web', 'unknown']).optional(),
  viewMode: z.enum(['VIDEO', 'TEXT']).optional(),
  shareFormat: z.enum(['VIDEO', 'IMAGE']).optional(),
  adPlacement: z.number().int().min(1).max(3).optional(),
  stage: z.number().int().min(1).max(6).optional(),
  imageStatus: z.enum(['READY', 'FALLBACK']).optional(),
}).strict();

export const CreateAnalyticsEventRequestSchema = z.object({
  name: AnalyticsEventNameSchema,
  occurredAt: z.string().datetime().optional(),
  metadata: AnalyticsMetadataSchema.default({}),
}).strict();

export const AnalyticsEventResponseSchema = z.object({
  eventId: z.string().uuid(),
  accepted: z.literal(true),
});

export type AnalyticsEventName = z.infer<typeof AnalyticsEventNameSchema>;
export type AnalyticsMetadata = z.infer<typeof AnalyticsMetadataSchema>;
