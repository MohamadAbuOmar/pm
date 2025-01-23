import { compare, hash } from 'bcryptjs';
import { sign, verify, VerifyOptions, Secret } from 'jsonwebtoken';
import { AUTH_CONFIG } from '@/config/auth.config';
import { Permission, Role, User } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { JwtPayload } from 'jsonwebtoken';

export interface TokenPayload extends JwtPayload {
  userId: number;
  email: string;
}

export async function hashPassword(password: string): Promise<string> {
  return hash(password, AUTH_CONFIG.bcryptSaltRounds);
}

export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword);
}

export function generateToken(user: Pick<User, 'id' | 'email'>): string {
  if (!user || typeof user.id !== 'number' || typeof user.email !== 'string') {
    throw new Error('Invalid user data for token generation');
  }

  const payload: Omit<TokenPayload, 'iat' | 'exp'> = {
    userId: user.id,
    email: user.email,
  };
  
  return sign(payload, AUTH_CONFIG.jwtSecret, {
    expiresIn: AUTH_CONFIG.jwtExpiresIn,
  });
}

export function verifyToken(token: string): TokenPayload {
  try {
    const decoded = verify(token, AUTH_CONFIG.jwtSecret) as unknown;
    
    if (
      !decoded ||
      typeof decoded === 'string' ||
      typeof (decoded as any).userId !== 'number' ||
      typeof (decoded as any).email !== 'string'
    ) {
      throw new Error('Invalid token payload');
    }
    
    return decoded as TokenPayload;
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

export async function createUser(email: string, password: string, isAdmin: boolean = false): Promise<User> {
  try {
    const hashedPassword = await hashPassword(password);
    
    // Create or connect to admin role if this is the first user
    const roleName = isAdmin ? 'Admin' : AUTH_CONFIG.defaultRole;
    
    // First ensure all required permissions exist
    const requiredPermissions = ['create_user', 'manage_roles', 'manage_permissions'];
    const permissions = await Promise.all(
      requiredPermissions.map(name =>
        prisma.permission.upsert({
          where: { name },
          create: { name },
          update: {}
        })
      )
    );

    // Create or connect to the role
    const role = await prisma.role.upsert({
      where: { name: roleName },
      create: {
        name: roleName,
        permissions: isAdmin ? {
          create: permissions.map(permission => ({
            permission: {
              connect: { id: permission.id }
            }
          }))
        } : undefined
      },
      update: {}
    });

    // Create the user and connect to role
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        roles: {
          create: {
            role: {
              connect: { id: role.id }
            }
          }
        }
      },
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
        }
      }
    });

    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
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
    ur.role.permissions.map((rp: { permission: Permission }) => rp.permission.name)
  );

  // Get direct user permissions
  const directPermissions = user.permissions.map((up: { permission: Permission }) => up.permission.name);

  // Combine and remove duplicates
  return [...new Set([...rolePermissions, ...directPermissions])];
}
