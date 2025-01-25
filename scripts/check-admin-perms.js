const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAdminPermissions() {
  try {
    // Find admin user with all related permissions
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@example.com' },
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

    if (!admin) {
      console.log('Admin user not found');
      return;
    }

    // Get all permissions from admin's roles
    const permissions = admin.roles.flatMap(ur => 
      ur.role.permissions.map(rp => rp.permission.name)
    );

    console.log('Current admin permissions:', permissions);

    // Check if manage_calls permission exists
    if (!permissions.includes('manage_calls')) {
      console.log('Running setup-admin.js to add missing permissions...');
      require('./setup-admin.js');
    } else {
      console.log('Admin user already has manage_calls permission');
    }
  } catch (error) {
    console.error('Error checking admin permissions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminPermissions();
