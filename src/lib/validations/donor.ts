import { z } from 'zod';

export const donorSchema = z.object({
  arabicName: z.string().nullable(),
  englishName: z.string().nullable(),
  regionId: z.number().nullable(),
  categoryId: z.number().nullable(),
  isPartner: z.number().nullable(),
  fax: z.string().nullable(),
  address: z.string().nullable(),
  website: z.string().nullable(),
  workField: z.string().nullable(),
  gender: z.enum(['male', 'female', 'other']).nullable(),
  phone: z.string().nullable(),
  email: z.string().email().nullable(),
  notes: z.string().nullable()
});

export const donorCategorySchema = z.object({
  arabicName: z.string().nullable(),
  englishName: z.string().nullable()
});

export type DonorInput = z.infer<typeof donorSchema>;
export type DonorCategoryInput = z.infer<typeof donorCategorySchema>;
