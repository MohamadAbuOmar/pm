const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

async function setupAdmin() {
  try {
    const email = 'admin@example.com';
    const password = 'Admin123!';
    const saltRounds = 10;
    
    console.log('Creating admin user...');
    
    // Hash the password
    const hashedPassword = await hash(password, saltRounds);
    
    // Create admin permissions
    const permissions = ['create_user', 'manage_roles', 'manage_permissions', 'manage_donors'];
    
    for (const permName of permissions) {
      await prisma.permission.upsert({
        where: { name: permName },
        create: { name: permName },
        update: {}
      });
    }
    
    // Create admin role with permissions
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
      update: {}
    });
    
    // Create admin user
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
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupAdmin();
