import { z } from 'zod';

const emptyStringToUndefined = (value) => (value === '' ? undefined : value);

export const postPayloadSchema = z.object({
  title: z.string().trim().min(3).max(120),
  summary: z.string().trim().min(10).max(280),
  content: z.string().trim().min(20),
  author: z.string().trim().min(2).max(60),
  category: z.string().trim().min(2).max(60),
  tags: z.array(z.string().trim().min(1).max(30)).max(8).default([]),
  contentFormat: z.enum(['markdown']).default('markdown'),
  status: z.enum(['draft', 'published']).default('draft'),
  coverImage: z.preprocess(emptyStringToUndefined, z.string().trim().url().optional()).optional(),
});

export function validatePostPayload(payload) {
  return postPayloadSchema.parse({
    ...payload,
    tags: Array.isArray(payload?.tags) ? payload.tags : [],
  });
}
