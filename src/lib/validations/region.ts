import { z } from 'zod';

export const regionSchema = z.object({
  name: z.string().min(1, 'Region name is required')
});

export type RegionInput = z.infer<typeof regionSchema>;
