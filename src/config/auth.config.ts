import { z } from 'zod';

// Define environment variable schema
const envSchema = z.object({
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().regex(/^\d+[hdwmy]$/, 'Must be in format: {number}h/d/w/m/y'),
  BCRYPT_SALT_ROUNDS: z.string().transform((val) => {
    const num = parseInt(val, 10);
    if (isNaN(num) || num < 10) {
      throw new Error('Must be a number >= 10');
    }
    return num;
  }),
  DEFAULT_ROLE: z.string().default('Employee'),
});

// Parse and validate environment variables
const env = envSchema.parse({
  JWT_SECRET: process.env.JWT_SECRET || (process.env.NODE_ENV === 'development' 
    ? 'development_jwt_secret_at_least_32_chars_long'
    : undefined),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  BCRYPT_SALT_ROUNDS: process.env.BCRYPT_SALT_ROUNDS || '10',
  DEFAULT_ROLE: process.env.DEFAULT_ROLE,
});

// Export validated configuration
export const AUTH_CONFIG = {
  jwtSecret: env.JWT_SECRET,
  jwtExpiresIn: env.JWT_EXPIRES_IN,
  bcryptSaltRounds: env.BCRYPT_SALT_ROUNDS,
  defaultRole: env.DEFAULT_ROLE,
} as const;
