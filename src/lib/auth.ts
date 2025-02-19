import { compare, hash } from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';
import { AUTH_CONFIG } from '@/config/auth.config';
import { Permission, User } from '@prisma/client';
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
      typeof (decoded as TokenPayload).userId !== 'number' ||
      typeof (decoded as TokenPayload).email !== 'string'
    ) {
      throw new Error('Invalid token payload');
    }
    
    return decoded as TokenPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    throw new Error('Invalid token');
  }
}

export async function getUserFromToken(token: string): Promise<User | null> {
  try {
    const payload = verifyToken(token);
    return await prisma.user.findUnique({
      where: { id: payload.userId },
    });
  } catch (err) {
    console.error('Error getting user from token:', err);
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
    console.log('Creating user:', { email, isAdmin });
    const hashedPassword = await hashPassword(password);
    
    // Create or connect to admin role if this is the first user
    const roleName = isAdmin ? 'Admin' : AUTH_CONFIG.defaultRole;
    console.log('Using role:', roleName);
    
    // Create permissions first if admin
    if (isAdmin) {
      console.log('Creating admin permissions...');
      const permissions = [
        'create_user',
        'manage_roles',
        'manage_permissions',
        'manage_regions',
        'manage_donors',
        'manage_calls'
      ];
      
      for (const permName of permissions) {
        await prisma.permission.upsert({
          where: { name: permName },
          create: { name: permName },
          update: {}
        });
      }
    }
    
    // First ensure the role exists with proper permissions
    const role = await prisma.role.upsert({
      where: { name: roleName },
      create: {
        name: roleName,
        permissions: isAdmin ? {
          create: [
            { permission: { connect: { name: 'create_user' } } },
            { permission: { connect: { name: 'manage_roles' } } },
            { permission: { connect: { name: 'manage_permissions' } } },
            { permission: { connect: { name: 'manage_regions' } } },
            { permission: { connect: { name: 'manage_donors' } } }
          ]
        } : undefined
      },
      update: isAdmin ? {
        permissions: {
          upsert: [
            {
              where: {
                roleId_permissionId: {
                  roleId: -1, // Will be replaced with actual roleId
                  permissionId: -1 // Will be replaced with actual permissionId
                }
              },
              create: { permission: { connect: { name: 'create_user' } } },
              update: {}
            },
            {
              where: {
                roleId_permissionId: {
                  roleId: -1,
                  permissionId: -1
                }
              },
              create: { permission: { connect: { name: 'manage_roles' } } },
              update: {}
            },
            {
              where: {
                roleId_permissionId: {
                  roleId: -1,
                  permissionId: -1
                }
              },
              create: { permission: { connect: { name: 'manage_permissions' } } },
              update: {}
            },
            {
              where: {
                roleId_permissionId: {
                  roleId: -1,
                  permissionId: -1
                }
              },
              create: { permission: { connect: { name: 'manage_regions' } } },
              update: {}
            },
            {
              where: {
                roleId_permissionId: {
                  roleId: -1,
                  permissionId: -1
                }
              },
              create: { permission: { connect: { name: 'manage_donors' } } },
              update: {}
            }
          ]
        }
      } : {}
    });

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        roles: {
          create: {
            role: {
              connect: {
                id: role.id
              }
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

    console.log('User created successfully:', { id: user.id, email: user.email });
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
