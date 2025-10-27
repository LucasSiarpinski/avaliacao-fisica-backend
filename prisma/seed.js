const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando o seeding...');

  // 1. Criar os Campi
  const chapeco = await prisma.campus.upsert({
    where: { name: 'Chapecó' },
    update: {},
    create: { name: 'Chapecó', city: 'Chapecó' },
  });

  const saoMiguel = await prisma.campus.upsert({
    where: { name: 'São Miguel do Oeste' },
    update: {},
    create: { name: 'São Miguel do Oeste', city: 'São Miguel do Oeste' },
  });

  console.log('Campi criados/atualizados.');

  // 2. Criar o usuário ADMIN
  const hashedPassword = await bcrypt.hash('admin123', 10); // Lembre-se de trocar essa senha!

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@universidade.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@universidade.com',
      password: hashedPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
      campusId: chapeco.id, // O admin pertence ao campus principal
    },
  });

  console.log(`Usuário ADMIN criado: ${adminUser.email}`);
  console.log('Seeding finalizado com sucesso.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });