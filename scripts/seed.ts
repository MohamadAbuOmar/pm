import { prisma } from '../src/lib/prisma';
import { createUser } from '../src/lib/auth';
import { User, Role, Permission, UserRole, RolePermission } from '@prisma/client';

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
