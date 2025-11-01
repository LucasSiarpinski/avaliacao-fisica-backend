/*
  Warnings:

  - You are about to drop the column `data` on the `Avaliacao` table. All the data in the column will be lost.
  - You are about to drop the column `tipo` on the `Avaliacao` table. All the data in the column will be lost.
  - Added the required column `avaliadorId` to the `Avaliacao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Avaliacao` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Avaliacao" DROP COLUMN "data",
DROP COLUMN "tipo",
ADD COLUMN     "altura" DOUBLE PRECISION,
ADD COLUMN     "avaliadorId" INTEGER NOT NULL,
ADD COLUMN     "circAbdomem" DOUBLE PRECISION,
ADD COLUMN     "circBracoRelaxadoD" DOUBLE PRECISION,
ADD COLUMN     "circBracoRelaxadoE" DOUBLE PRECISION,
ADD COLUMN     "circCintura" DOUBLE PRECISION,
ADD COLUMN     "circQuadril" DOUBLE PRECISION,
ADD COLUMN     "dataAvaliacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dcAbdominal" DOUBLE PRECISION,
ADD COLUMN     "dcAxilarMedia" DOUBLE PRECISION,
ADD COLUMN     "dcCoxa" DOUBLE PRECISION,
ADD COLUMN     "dcPeitoral" DOUBLE PRECISION,
ADD COLUMN     "dcSubescapular" DOUBLE PRECISION,
ADD COLUMN     "dcSuprailiaca" DOUBLE PRECISION,
ADD COLUMN     "dcTriceps" DOUBLE PRECISION,
ADD COLUMN     "habitos" TEXT,
ADD COLUMN     "historicoMedico" TEXT,
ADD COLUMN     "medicamentosEmUso" TEXT,
ADD COLUMN     "objetivos" TEXT,
ADD COLUMN     "observacoes" TEXT,
ADD COLUMN     "parq_q1" TEXT,
ADD COLUMN     "parq_q2" TEXT,
ADD COLUMN     "parq_q3" TEXT,
ADD COLUMN     "parq_q4" TEXT,
ADD COLUMN     "parq_q5" TEXT,
ADD COLUMN     "parq_q6" TEXT,
ADD COLUMN     "parq_q7" TEXT,
ADD COLUMN     "peso" DOUBLE PRECISION,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "resultados" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Avaliacao" ADD CONSTRAINT "Avaliacao_avaliadorId_fkey" FOREIGN KEY ("avaliadorId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
