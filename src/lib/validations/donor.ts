import { z } from 'zod';

export const donorSchema = z.object({
  arabicName: z.string().optional(),
  englishName: z.string().optional(),
  regionId: z.number().optional(),
  categoryId: z.number().optional(),
  isPartner: z.number().optional(),
  fax: z.string().optional(),
  address: z.string().optional(),
  website: z.string().optional(),
  workField: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  notes: z.string().optional()
});

export const donorCategorySchema = z.object({
  arabicName: z.string().nullable(),
  englishName: z.string().nullable()
});

export type DonorInput = z.infer<typeof donorSchema>;
export type DonorCategoryInput = z.infer<typeof donorCategorySchema>;
