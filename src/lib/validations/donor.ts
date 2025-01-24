import { z } from 'zod';

export const donorSchema = z.object({
  arabicName: z.string().min(1, 'Arabic name is required'),
  englishName: z.string().min(1, 'English name is required'),
  regionId: z.union([z.number(), z.literal('')]).optional(),
  categoryId: z.union([z.number(), z.literal('')]).optional(),
  isPartner: z.number().min(0).max(1),
  fax: z.string().optional(),
  address: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  workField: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional().nullable(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  notes: z.string().optional()
});

export const donorCategorySchema = z.object({
  arabicName: z.string().nullable(),
  englishName: z.string().nullable()
});

export type DonorInput = z.infer<typeof donorSchema>;
export type DonorCategoryInput = z.infer<typeof donorCategorySchema>;
