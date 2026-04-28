const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const parts = await prisma.part.findMany({
    take: 5,
    orderBy: { created_at: 'desc' }
  });
  console.log(JSON.stringify(parts, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
