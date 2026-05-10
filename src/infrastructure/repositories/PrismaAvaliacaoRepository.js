const { PrismaClient } = require('@prisma/client');
const IAvaliacaoRepository = require('../../domain/repositories/IAvaliacaoRepository');
const Avaliacao = require('../../domain/entities/Avaliacao');

class PrismaAvaliacaoRepository extends IAvaliacaoRepository {
  constructor() {
    super();
    this.prisma = new PrismaClient();
  }

  async create(avaliacaoData) {
    const prismaAvaliacao = await this.prisma.avaliacao.create({
      data: avaliacaoData,
      include: {
        aluno: { select: { nome: true, matricula: true } },
        avaliador: { select: { name: true } },
      },
    });
    return new Avaliacao(prismaAvaliacao);
  }

  async findAll() {
    const prismaAvaliacoes = await this.prisma.avaliacao.findMany({
      orderBy: { dataAvaliacao: 'desc' },
      include: {
        aluno: { select: { nome: true, matricula: true } },
        avaliador: { select: { name: true } },
      },
    });
    return prismaAvaliacoes.map((a) => new Avaliacao(a));
  }

  async findById(id) {
    const prismaAvaliacao = await this.prisma.avaliacao.findUnique({
      where: { id: parseInt(id) },
      include: {
        aluno: { select: { nome: true, dataNasc: true } },
        avaliador: { select: { name: true, id: true } },
      },
    });
    return prismaAvaliacao ? new Avaliacao(prismaAvaliacao) : null;
  }

  async update(id, avaliacaoData) {
    const prismaAvaliacao = await this.prisma.avaliacao.update({
      where: { id: parseInt(id) },
      data: avaliacaoData,
      include: {
        aluno: { select: { nome: true, dataNasc: true } },
        avaliador: { select: { name: true, id: true } },
      },
    });
    return new Avaliacao(prismaAvaliacao);
  }

  async delete(id) {
    await this.prisma.avaliacao.delete({
      where: { id: parseInt(id) },
    });
  }
}

module.exports = PrismaAvaliacaoRepository;