const { PrismaClient } = require('@prisma/client');
const IAvaliacaoRepository = require('../../domain/repositories/IAvaliacaoRepository');
const Avaliacao = require('../../domain/entities/Avaliacao');

function scopeWhereForUser(user) {
  if (user.role === 'ADMIN') {
    return { aluno: { campusId: user.campusId } };
  }
  return { aluno: { professorId: user.id } };
}

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

  async findAllForUser(user) {
    const prismaAvaliacoes = await this.prisma.avaliacao.findMany({
      where: scopeWhereForUser(user),
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
      where: { id: parseInt(id, 10) },
      include: {
        aluno: { select: { nome: true, dataNasc: true, professorId: true, campusId: true } },
        avaliador: { select: { name: true, id: true } },
      },
    });
    return prismaAvaliacao ? new Avaliacao(prismaAvaliacao) : null;
  }

  async findByIdForUser(id, user) {
    const prismaAvaliacao = await this.prisma.avaliacao.findFirst({
      where: {
        id: parseInt(id, 10),
        ...scopeWhereForUser(user),
      },
      include: {
        aluno: { select: { nome: true, dataNasc: true, professorId: true, campusId: true } },
        avaliador: { select: { name: true, id: true } },
      },
    });
    return prismaAvaliacao ? new Avaliacao(prismaAvaliacao) : null;
  }

  async update(id, avaliacaoData) {
    const prismaAvaliacao = await this.prisma.avaliacao.update({
      where: { id: parseInt(id, 10) },
      data: avaliacaoData,
      include: {
        aluno: { select: { nome: true, dataNasc: true, professorId: true, campusId: true } },
        avaliador: { select: { name: true, id: true } },
      },
    });
    return new Avaliacao(prismaAvaliacao);
  }

  async delete(id) {
    await this.prisma.avaliacao.delete({
      where: { id: parseInt(id, 10) },
    });
  }
}

module.exports = PrismaAvaliacaoRepository;