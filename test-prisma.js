const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const dataNasc = "2003-12-18T12:00:00.000Z";
    // Tenta atualizar o primeiro aluno que encontrar (simulando a req)
    const firstAluno = await prisma.aluno.findFirst();
    if (!firstAluno) {
      console.log("Nenhum aluno encontrado");
      return;
    }
    
    console.log("Atualizando aluno ID:", firstAluno.id);
    const updated = await prisma.aluno.update({
      where: { id: firstAluno.id },
      data: {
        dataNasc: new Date(dataNasc),
        cpf: firstAluno.cpf === '' ? null : firstAluno.cpf
      }
    });
    console.log("Sucesso!", updated.dataNasc);
  } catch (e) {
    console.error("ERRO PRISMA:", e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
