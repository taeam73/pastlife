import { z } from 'zod';

export const SessionStatusSchema = z.enum([
  'CREATED', 'QUESTION_IN_PROGRESS', 'QUESTION_COMPLETE', 'CALCULATING',
  'NARRATIVE_GENERATING', 'RESULT_READY', 'BASIC_UNLOCKED', 'DEEP_UNLOCKED', 'GUIDE_UNLOCKED',
  'IMAGE_GENERATING', 'IMAGE_READY', 'IMAGE_FAILED', 'COMPLETED', 'ARCHIVED', 'FAILED',
]);

export const ViewModeSchema = z.enum(['VIDEO', 'TEXT']);
export const CreateSessionRequestSchema = z.object({
  locale: z.string().min(2).max(12).default('ko'),
  deviceId: z.string().min(8).max(128).optional(),
  preferredViewMode: ViewModeSchema.optional(),
});
export const CreateSessionResponseSchema = z.object({
  sessionId: z.string(),
  seed: z.string(),
  contentVersion: z.string(),
  status: SessionStatusSchema,
  viewMode: ViewModeSchema,
});

export const UpdateViewModeRequestSchema = z.object({ viewMode: ViewModeSchema });
export const ViewModeResponseSchema = z.object({ sessionId: z.string(), viewMode: ViewModeSchema });

export const ChoiceSchema = z.object({ id: z.string(), text: z.string(), displayOrder: z.number().int() });
export const QuestionResponseSchema = z.object({
  id: z.string(),
  stage: z.number().int().min(1).max(6),
  text: z.string(),
  choices: z.array(ChoiceSchema).length(6),
});

export const SaveAnswerRequestSchema = z.object({ questionId: z.string(), choiceId: z.string() });
export const ProgressResponseSchema = z.object({
  sessionId: z.string(),
  answeredStages: z.array(z.number().int().min(1).max(6)),
  status: SessionStatusSchema,
});
export const CompleteResponseSchema = z.object({ resultId: z.string(), status: SessionStatusSchema });
