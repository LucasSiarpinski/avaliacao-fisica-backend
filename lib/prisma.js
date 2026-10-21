const { PrismaClient } = require('@prisma/client');

// PrismaClient singleton para gerenciar conexões com o PostgreSQL
const globalForPrisma = global;

const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
