const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateAdminPermissions() {
  try {
    // Required permissions for admin
    const requiredPermissions = [
      'create_user',
      'manage_roles',
      'manage_permissions',
      'manage_donors',
      'manage_regions',
      'manage_calls'
    ];

    console.log('Creating/updating permissions...');
    
    // Create all required permissions
    const createdPermissions = await Promise.all(
      requiredPermissions.map(name =>
        prisma.permission.upsert({
          where: { name },
          create: { name },
          update: {}
        })
      )
    );

    console.log('Created/updated permissions:', createdPermissions.map(p => p.name));

    // Find or create Admin role
    const adminRole = await prisma.role.upsert({
      where: { name: 'Admin' },
      create: {
        name: 'Admin',
        permissions: {
          create: requiredPermissions.map(name => ({
            permission: {
              connect: { name }
            }
          }))
        }
      },
      update: {
        permissions: {
          deleteMany: {},
          create: requiredPermissions.map(name => ({
            permission: {
              connect: { name }
            }
          }))
        }
      },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    });

    console.log('Admin role permissions:', adminRole.permissions.map(p => p.permission.name));

    // Find admin user
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

    console.log('Found admin user:', { id: adminUser.id, email: adminUser.email });
    console.log('Current permissions:', adminUser.roles.flatMap(ur => 
      ur.role.permissions.map(rp => rp.permission.name)
    ));

    // Update admin user's roles
    await prisma.userRole.deleteMany({
      where: { userId: adminUser.id }
    });

    await prisma.userRole.create({
      data: {
        user: { connect: { id: adminUser.id } },
        role: { connect: { id: adminRole.id } }
      }
    });

    // Verify final state
    const updatedUser = await prisma.user.findUnique({
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

    console.log('Updated permissions:', updatedUser.roles.flatMap(ur => 
      ur.role.permissions.map(rp => rp.permission.name)
    ));

    console.log('Admin permissions update completed successfully');
  } catch (error) {
    console.error('Error updating admin permissions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdminPermissions();
