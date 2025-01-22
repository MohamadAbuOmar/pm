import { PrismaClient, User, Role, Permission, UserRole, RolePermission } from '@prisma/client';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  const bcrypt = require('bcryptjs');
  return bcrypt.hash(password, 10);
}

async function createUser(email: string, password: string, isAdmin: boolean = false): Promise<User> {
  const hashedPassword = await hashPassword(password);
  
  // Create or connect to admin role if this is the first user
  const roleName = isAdmin ? 'Admin' : 'Employee';
  
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      roles: {
        create: {
          role: {
            connectOrCreate: {
              where: { name: roleName },
              create: {
                name: roleName,
                permissions: isAdmin ? {
                  create: [
                    { permission: { create: { name: 'create_user' } } },
                    { permission: { create: { name: 'manage_roles' } } },
                    { permission: { create: { name: 'manage_permissions' } } }
                  ]
                } : undefined
              }
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

  return user;
}

type UserWithRoles = User & {
  roles: (UserRole & {
    role: Role & {
      permissions: (RolePermission & {
        permission: Permission;
      })[];
    };
  })[];
};

async function main() {
  console.log('Starting database seeding...');
  
  try {
    const userCount = await prisma.user.count();
    console.log('Current user count:', userCount);
    
    if (userCount === 0) {
      console.log('Creating admin user...');
      const adminUser = await createUser('admin@example.com', 'Mohammad44p', true);

      const adminUserWithRoles = adminUser as UserWithRoles;
      console.log('Admin user created successfully:', {
        id: adminUserWithRoles.id,
        email: adminUserWithRoles.email,
        roles: adminUserWithRoles.roles.map(r => r.role.name),
        permissions: adminUserWithRoles.roles.flatMap(r => 
          r.role.permissions.map(p => p.permission.name)
        )
      });
    } else {
      console.log('Admin user already exists, skipping creation.');
    }
  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
