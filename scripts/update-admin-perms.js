const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateAdminPermissions() {
  try {
    // Find admin user
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@example.com' },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    if (!admin) {
      console.error('Admin user not found');
      return;
    }

    // Find or create manage_calls permission
    const manageCallsPermission = await prisma.permission.upsert({
      where: { name: 'manage_calls' },
      create: { name: 'manage_calls' },
      update: {}
    });

    // Get admin role
    const adminRole = admin.roles[0]?.role;
    if (!adminRole) {
      console.error('Admin role not found');
      return;
    }

    // Add manage_calls permission to admin role if not exists
    const rolePermission = await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: manageCallsPermission.id
        }
      },
      create: {
        role: { connect: { id: adminRole.id } },
        permission: { connect: { id: manageCallsPermission.id } }
      },
      update: {}
    });

    console.log('Successfully updated admin permissions');
  } catch (error) {
    console.error('Error updating admin permissions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdminPermissions();
