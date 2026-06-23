import { z } from 'zod';

export const taxonomyPayloadSchema = z.object({
  name: z.string().trim().min(2).max(40),
  description: z.string().trim().max(160).optional().default(''),
});
