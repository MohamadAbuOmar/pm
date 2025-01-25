const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixAdminPermissions() {
  try {
    // Required permissions
    const requiredPermissions = [
      'create_user',
      'manage_roles',
      'manage_permissions',
      'manage_donors',
      'manage_regions',
      'manage_calls'
    ];

    // Create permissions
    console.log('Creating permissions...');
    for (const name of requiredPermissions) {
      await prisma.permission.upsert({
        where: { name },
        create: { name },
        update: {}
      });
    }

    // Get or create Admin role
    console.log('Setting up Admin role...');
    const adminRole = await prisma.role.findUnique({
      where: { name: 'Admin' },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    });

    if (!adminRole) {
      console.log('Creating new Admin role...');
      await prisma.role.create({
        data: {
          name: 'Admin',
          permissions: {
            create: requiredPermissions.map(name => ({
              permission: {
                connect: { name }
              }
            }))
          }
        }
      });
    } else {
      console.log('Updating existing Admin role...');
      // Remove existing permissions
      await prisma.rolePermission.deleteMany({
        where: { roleId: adminRole.id }
      });

      // Add all required permissions
      await prisma.role.update({
        where: { id: adminRole.id },
        data: {
          permissions: {
            create: requiredPermissions.map(name => ({
              permission: {
                connect: { name }
              }
            }))
          }
        }
      });
    }

    // Get admin user
    const adminUser = await prisma.user.findUnique({
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

    if (!adminUser) {
      console.log('Admin user not found');
      return;
    }

    console.log('Current admin permissions:', adminUser.roles.flatMap(ur => 
      ur.role.permissions.map(rp => rp.permission.name)
    ));

    // Update admin user's role
    console.log('Updating admin user role...');
    await prisma.userRole.deleteMany({
      where: { userId: adminUser.id }
    });

    const updatedRole = await prisma.role.findUnique({
      where: { name: 'Admin' }
    });

    await prisma.userRole.create({
      data: {
        userId: adminUser.id,
        roleId: updatedRole.id
      }
    });

    // Verify final state
    const verifiedUser = await prisma.user.findUnique({
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

    console.log('Updated admin permissions:', verifiedUser.roles.flatMap(ur => 
      ur.role.permissions.map(rp => rp.permission.name)
    ));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdminPermissions();
