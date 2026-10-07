import 'dotenv/config';  

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const universities = [
    'University of Lagos (UNILAG)',
    'University of Ibadan',
    'Obafemi Awolowo University (OAU)',
    'University of Nigeria, Nsukka (UNN)',
    'Ahmadu Bello University (ABU)',
    'Lagos State University (LASU)',
    'Covenant University',
    'Babcock University',
    'Pan-Atlantic University',
    'University of Port Harcourt',
    'University of Benin',
    'Federal University of Technology, Akure (FUTA)',
    'Federal University of Technology, Minna (FUTMINNA)',
    'Nnamdi Azikiwe University',
    'Federal University Lafia',
    'Redeemer\'s University',
    'Bells University of Technology',
    'Bowen University',
    'Caleb University',
    'Ekiti State University',
    'Federal University, Oye-Ekiti',
    'Federal University of Agriculture, Abeokuta (FUNAAB)',
    'Kwame Nkrumah University of Science and Technology',
    'University of Ghana',
    'Strathmore University',
  ];

  try {
    console.log('Seeding universities...');

    for (const name of universities) {
      await prisma.university.upsert({
        where: { name },
        update: {},
        create: { name },
      });
    }

    console.log(`✅ Successfully seeded ${universities.length} universities`);
  } catch (error) {
    console.error('❌ Error seeding universities:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();