import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log('Database connection OK');
  } catch (e) {
    console.error('Database connection failed', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
