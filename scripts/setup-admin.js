const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

async function setupAdmin() {
  try {
    const email = 'admin@example.com';
    // NOTE: This is the development password. In production:
    // 1. Use environment variables for sensitive data
    // 2. Change this password immediately after first login
    // 3. Follow security best practices for password management
    const password = process.env.ADMIN_PASSWORD || 'Admin123!';
    const saltRounds = 10;
    
    console.log('Setting up admin user and permissions...');
    
    // Create admin permissions
    const permissions = [
      'create_user',
      'manage_roles',
      'manage_permissions',
      'manage_donors',
      'manage_regions',
      'manage_calls'
    ];
    
    // Create or update permissions
    for (const permName of permissions) {
      await prisma.permission.upsert({
        where: { name: permName },
        create: { name: permName },
        update: {}
      });
    }
    
    // Create or update admin role with permissions
    const role = await prisma.role.upsert({
      where: { name: 'Admin' },
      create: {
        name: 'Admin',
        permissions: {
          create: permissions.map(name => ({
            permission: {
              connect: { name }
            }
          }))
        }
      },
      update: {
        permissions: {
          deleteMany: {},
          create: permissions.map(name => ({
            permission: {
              connect: { name }
            }
          }))
        }
      }
    });

    // Find existing admin user or create new one
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      // Update existing user's roles
      await prisma.userRole.deleteMany({
        where: { userId: existingUser.id }
      });
      
      await prisma.userRole.create({
        data: {
          user: { connect: { id: existingUser.id } },
          role: { connect: { id: role.id } }
        }
      });

      console.log('Admin user updated successfully:', { id: existingUser.id, email: existingUser.email });
    } else {
      // Create new admin user
      const hashedPassword = await hash(password, saltRounds);
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
        }
      });
      
      console.log('Admin user created successfully:', { id: user.id, email: user.email });
    }
  } catch (error) {
    console.error('Error setting up admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupAdmin();
