import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    // Create test donor category
    const category = await prisma.donorCategory.create({
      data: {
        arabicName: 'غير محدد',
        englishName: 'Unspecified'
      }
    });

    // Create test donor
    const donor = await prisma.donor.create({
      data: {
        arabicName: 'هيئة الهلال الأحمر لدولة الإمارات العربية المتحدة',
        englishName: 'Emirates Red Crescent',
        fax: '02-621272',
        address: 'أبوظبي ـ دولة الإمارات العربية المتحدة',
        website: 'http://www.rcuae.ae',
        gender: 'other',
        phone: '02-2401691',
        email: 'hilal@rcuae.ae',
        categoryId: category.id
      }
    });

    console.log('Seed data created successfully:', {
      category: { id: category.id },
      donor: { id: donor.id }
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
