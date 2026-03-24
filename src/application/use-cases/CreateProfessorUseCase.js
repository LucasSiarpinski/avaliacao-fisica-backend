const bcrypt = require('bcryptjs');

class CreateProfessorUseCase {
  constructor(professorRepository) {
    this.professorRepository = professorRepository;
  }

  async execute(professorData) {
    // Validações básicas
    if (!professorData.name || !professorData.email || !professorData.password) {
      throw new Error('Nome, email e senha são obrigatórios.');
    }

    // Verificar se email já existe
    const existingProfessor = await this.professorRepository.findByEmail(professorData.email);
    if (existingProfessor) {
      throw new Error('Este email já está em uso.');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(professorData.password, 10);

    const newProfessorData = {
      ...professorData,
      password: hashedPassword,
      role: professorData.role || 'PROFESSOR',
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