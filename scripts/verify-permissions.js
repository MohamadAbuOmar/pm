const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyPermissions() {
  try {
    // Check if manage_calls permission exists
    const permission = await prisma.permission.findUnique({
      where: { name: 'manage_calls' }
    });
    
    console.log('manage_calls permission:', permission);

    // Check admin user permissions
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

    const permissions = admin.roles.flatMap(ur => 
      ur.role.permissions.map(rp => rp.permission.name)
    );

    console.log('Admin user permissions:', permissions);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyPermissions();
