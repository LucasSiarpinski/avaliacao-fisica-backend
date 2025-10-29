-- DropForeignKey
ALTER TABLE "public"."Avaliacao" DROP CONSTRAINT "Avaliacao_alunoId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Documento" DROP CONSTRAINT "Documento_alunoId_fkey";

-- AlterTable
ALTER TABLE "Aluno" ADD COLUMN     "altura" DOUBLE PRECISION,
ADD COLUMN     "habitos" TEXT,
ADD COLUMN     "historicoMedico" TEXT,
ADD COLUMN     "medicamentosEmUso" TEXT,
ADD COLUMN     "objetivos" TEXT,
ADD COLUMN     "peso" DOUBLE PRECISION;

-- AddForeignKey
ALTER TABLE "Avaliacao" ADD CONSTRAINT "Avaliacao_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;
