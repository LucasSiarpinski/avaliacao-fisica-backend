const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const anamneses = await prisma.anamnese.findMany({
    orderBy: { id: 'desc' },
    take: 1,
    include: { dadosMedicos: true, habitos: true, parq: true }
  });
  console.log(JSON.stringify(anamneses, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
