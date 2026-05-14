const { PrismaClient } = require('@prisma/client');
const IAlunoRepository = require('../../domain/repositories/IAlunoRepository');
const Aluno = require('../../domain/entities/Aluno');

class PrismaAlunoRepository extends IAlunoRepository {
  constructor() {
    super();
    this.prisma = new PrismaClient();
  }

  async create(alunoData) {
    try {
      const prismaAluno = await this.prisma.aluno.create({
        data: alunoData,
      });
      return new Aluno(prismaAluno);
    } catch (error) {
      throw error;
    }
  }

  async findAllByProfessor(professorId) {
    try {
      const prismaAlunos = await this.prisma.aluno.findMany({
        where: { professorId: professorId },
        orderBy: { nome: 'asc' },
      });
      return prismaAlunos.map(aluno => new Aluno(aluno));
    } catch (error) {
      throw error;
    }
  }

  async findById(id) {
    try {
      const prismaAluno = await this.prisma.aluno.findUnique({
        where: { id: parseInt(id, 10) },
      });
      return prismaAluno ? new Aluno(prismaAluno) : null;
    } catch (error) {
      throw error;
    }
  }

  async findByIdAndProfessor(id, professorId) {
    try {
      const prismaAluno = await this.prisma.aluno.findFirst({
        where: { id: parseInt(id), professorId: professorId },
      });
      return prismaAluno ? new Aluno(prismaAluno) : null;
    } catch (error) {
      throw error;
    }
  }

  async update(id, alunoData) {
    try {
      const prismaAluno = await this.prisma.aluno.update({
        where: { id: parseInt(id) },
        data: alunoData,
      });
      return new Aluno(prismaAluno);
    } catch (error) {
      throw error;
    }
  }

  async delete(id) {
    try {
      await this.prisma.aluno.delete({
        where: { id: parseInt(id) },
      });
    } catch (error) {
      throw error;
    }
  }

  async updateStatus(id, status) {
    try {
      const prismaAluno = await this.prisma.aluno.update({
        where: { id: parseInt(id) },
        data: { status },
      });
      return new Aluno(prismaAluno);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = PrismaAlunoRepository;