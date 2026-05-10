const bcrypt = require('bcryptjs');

class UpdateProfessorUseCase {
  constructor(professorRepository) {
    this.professorRepository = professorRepository;
  }

  async execute(id, professorData) {
    const professorExistente = await this.professorRepository.findById(id);
    if (!professorExistente) {
      throw new Error('Professor não encontrado.');
    }

    const dataToUpdate = { ...professorData };

    if (dataToUpdate.password) {
      dataToUpdate.password = await bcrypt.hash(dataToUpdate.password, 10);
    }

    return await this.professorRepository.update(id, dataToUpdate);
  }
}

module.exports = UpdateProfessorUseCase;