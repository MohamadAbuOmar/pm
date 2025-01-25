const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyAdminPermissions() {
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

    // Check for required permissions
    const requiredPermissions = [
      'create_user',
      'manage_roles',
      'manage_permissions',
      'manage_donors',
      'manage_regions',
      'manage_calls'
    ];

    const missingPermissions = requiredPermissions.filter(p => !permissions.includes(p));
    
    if (missingPermissions.length > 0) {
      console.log('Missing permissions:', missingPermissions);
      console.log('Running setup-admin.js to add missing permissions...');
      require('./setup-admin.js');
    } else {
      console.log('Admin user has all required permissions');
    }
  } catch (error) {
    console.error('Error verifying admin permissions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyAdminPermissions();
