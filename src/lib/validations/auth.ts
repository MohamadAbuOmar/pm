import { z } from 'zod';

export const userRegistrationSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  roleId: z.string().min(1, 'Role must be selected'),
  permissions: z.array(z.string()).optional(),
});

export const roleSchema = z.object({
  name: z.string().min(1, 'Role name is required'),
  permissions: z.array(z.number()).min(1, 'At least one permission must be selected'),
});

export const roleAssignmentSchema = z.object({
  userId: z.number().positive('User must be selected'),
  roleId: z.number().positive('Role must be selected'),
});

export type UserRegistrationInput = z.infer<typeof userRegistrationSchema>;
export type RoleInput = z.infer<typeof roleSchema>;
export type RoleAssignmentInput = z.infer<typeof roleAssignmentSchema>;
