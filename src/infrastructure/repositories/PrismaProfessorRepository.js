const { PrismaClient } = require('@prisma/client');
const IProfessorRepository = require('../../domain/repositories/IProfessorRepository');
const Professor = require('../../domain/entities/Professor');

class PrismaProfessorRepository extends IProfessorRepository {
  constructor() {
    super();
    this.prisma = new PrismaClient();
  }

  async create(professorData) {
    try {
      const prismaProfessor = await this.prisma.user.create({
        data: professorData,
        include: {
          campus: true,
        },
      });
      return new Professor(prismaProfessor);
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    try {
      const prismaProfessores = await this.prisma.user.findMany({
        include: {
          campus: true,
        },
        orderBy: { name: 'asc' },
      });
      return prismaProfessores.map(prof => new Professor(prof));
    } catch (error) {
      throw error;
    }
  }

  async findAllByCampusId(campusId) {
    try {
      const prismaProfessores = await this.prisma.user.findMany({
        where: { campusId: parseInt(campusId, 10) },
        include: {
          campus: true,
        },
        orderBy: { name: 'asc' },
      });
      return prismaProfessores.map((prof) => new Professor(prof));
    } catch (error) {
      throw error;
    }
  }

  async findById(id) {
    try {
      const prismaProfessor = await this.prisma.user.findUnique({
        where: { id: parseInt(id) },
        include: {
          campus: true,
        },
      });
      return prismaProfessor ? new Professor(prismaProfessor) : null;
    } catch (error) {
      throw error;
    }
  }

  async findByIdAndCampusId(id, campusId) {
    try {
      const prismaProfessor = await this.prisma.user.findFirst({
        where: {
          id: parseInt(id, 10),
          campusId: parseInt(campusId, 10),
        },
        include: {
          campus: true,
        },
      });
      return prismaProfessor ? new Professor(prismaProfessor) : null;
    } catch (error) {
      throw error;
    }
  }

  async update(id, professorData) {
    try {
      const prismaProfessor = await this.prisma.user.update({
        where: { id: parseInt(id) },
        data: professorData,
        include: {
          campus: true,
        },
      });
      return new Professor(prismaProfessor);
    } catch (error) {
      throw error;
    }
  }

  async delete(id) {
    try {
      await this.prisma.user.delete({
        where: { id: parseInt(id) },
      });
    } catch (error) {
      throw error;
    }
  }

  async findByEmail(email) {
    try {
      const prismaProfessor = await this.prisma.user.findUnique({
        where: { email },
        include: {
          campus: true,
        },
      });
      return prismaProfessor ? new Professor(prismaProfessor) : null;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = PrismaProfessorRepository;