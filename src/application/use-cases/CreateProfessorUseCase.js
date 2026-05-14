const bcrypt = require('bcryptjs');

class CreateProfessorUseCase {
  constructor(professorRepository) {
    this.professorRepository = professorRepository;
  }

  async execute(professorData, campusIdDoAdmin) {
    if (!professorData.name || !professorData.email || !professorData.password) {
      throw new Error('Nome, email e senha são obrigatórios.');
    }
    if (campusIdDoAdmin == null) {
      throw new Error('Campus do administrador inválido.');
    }

    const campusId = parseInt(campusIdDoAdmin, 10);

    const existingProfessor = await this.professorRepository.findByEmail(professorData.email);
    if (existingProfessor) {
      throw new Error('Este email já está em uso.');
    }

    const hashedPassword = await bcrypt.hash(professorData.password, 10);

    const newProfessorData = {
      name: professorData.name,
      email: professorData.email,
      password: hashedPassword,
      role: professorData.role === 'ADMIN' ? 'ADMIN' : 'PROFESSOR',
      status: professorData.status || 'ACTIVE',
      campusId,
    };

    try {
      return await this.professorRepository.create(newProfessorData);
    } catch (error) {
      if (error.code === 'P2002') {
        throw new Error('Este email já está em uso.');
      }
      throw error;
    }
  }
}

module.exports = CreateProfessorUseCase;