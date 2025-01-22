import { compare, hash } from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';
import { AUTH_CONFIG } from '@/config/auth.config';
import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

export interface TokenPayload {
  userId: number;
  email: string;
}

export async function hashPassword(password: string): Promise<string> {
  return hash(password, AUTH_CONFIG.bcryptSaltRounds);
}

export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword);
}

export function generateToken(user: User): string {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
  };
  
  return sign(payload, AUTH_CONFIG.jwtSecret, {
    expiresIn: AUTH_CONFIG.jwtExpiresIn,
  });
}

export function verifyToken(token: string): TokenPayload {
  try {
    return verify(token, AUTH_CONFIG.jwtSecret) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export async function getUserFromToken(token: string): Promise<User | null> {
  try {
    const payload = verifyToken(token);
    return await prisma.user.findUnique({
      where: { id: payload.userId },
    });
  } catch (error) {
    return null;
  }
}

export async function validateUser(email: string, password: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) return null;

  const isValidPassword = await comparePasswords(password, user.password);
  if (!isValidPassword) return null;

  return user;
}

export async function createUser(email: string, password: string): Promise<User> {
  const hashedPassword = await hashPassword(password);
  
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      roles: {
        create: {
          role: {
            connectOrCreate: {
              where: { name: AUTH_CONFIG.defaultRole },
              create: { name: AUTH_CONFIG.defaultRole }
            }
          }
        }
      }
    },
  });

  return user;
}

export async function getUserPermissions(userId: number): Promise<string[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      roles: {
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true
                }
              }
            }
          }
        }
      },
      permissions: {
        include: {
          permission: true
        }
      }
    }
  });

  if (!user) return [];

  // Get permissions from roles
  const rolePermissions = user.roles.flatMap(ur => 
    ur.role.permissions.map(rp => rp.permission.name)
  );

  // Get direct user permissions
  const directPermissions = user.permissions.map(up => up.permission.name);

  // Combine and remove duplicates
  return [...new Set([...rolePermissions, ...directPermissions])];
}
