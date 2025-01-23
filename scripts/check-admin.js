const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAdmin() {
  try {
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

    console.log('Admin user:', admin ? {
      id: admin.id,
      email: admin.email,
      roles: admin.roles.map(r => ({
        role: r.role.name,
        permissions: r.role.permissions.map(p => p.permission.name)
      }))
    } : 'Not found');
  } catch (error) {
    console.error('Error checking admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();
