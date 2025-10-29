-- CreateEnum
CREATE TYPE "AlunoStatus" AS ENUM ('ATIVO', 'INATIVO');

-- AlterTable
ALTER TABLE "Aluno" ADD COLUMN     "status" "AlunoStatus" NOT NULL DEFAULT 'ATIVO';
