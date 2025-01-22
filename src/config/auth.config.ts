export const AUTH_CONFIG = {
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiresIn: '7d', // 7 days
  bcryptSaltRounds: 10,
  defaultRole: 'Employee',
};
