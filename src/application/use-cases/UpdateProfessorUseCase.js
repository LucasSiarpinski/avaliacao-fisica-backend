const bcrypt = require('bcryptjs');

class UpdateProfessorUseCase {
  constructor(professorRepository) {
    this.professorRepository = professorRepository;
  }

  async execute(id, professorData, campusId) {
    const professorExistente = await this.professorRepository.findByIdAndCampusId(id, campusId);
    if (!professorExistente) {
      throw new Error('Professor não encontrado.');
    }

    if (
      professorData.campusId != null &&
      parseInt(professorData.campusId, 10) !== parseInt(campusId, 10)
    ) {
      throw new Error('Não é permitido alterar o campus deste usuário.');
    }

    const dataToUpdate = { ...professorData };
    delete dataToUpdate.campusId;

    if (dataToUpdate.password) {
      dataToUpdate.password = await bcrypt.hash(dataToUpdate.password, 10);
    }

    return await this.professorRepository.update(id, dataToUpdate);
  }
}

module.exports = UpdateProfessorUseCase;