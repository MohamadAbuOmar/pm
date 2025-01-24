import { z } from 'zod';

export const callSchema = z.object({
  name: z.string().min(1, 'Call name is required'),
  focalPoint: z.string().nullable(),
  budget: z.string().nullable(),
  currency: z.string().min(1, 'Currency is required'),
  donorContribution: z.string().nullable(),
  uawcContribution: z.string().nullable(),
  startDate: z.string().nullable().transform(val => val ? new Date(val) : null),
  endDate: z.string().nullable().transform(val => val ? new Date(val) : null),
  donorsId: z.number().min(1, 'Donor must be selected')
});

export type CallInput = z.infer<typeof callSchema>;
