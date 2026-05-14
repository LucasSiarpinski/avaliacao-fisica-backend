class DeleteProfessorUseCase {
  constructor(professorRepository) {
    this.professorRepository = professorRepository;
  }

  async execute(id, campusId) {
    const professorExistente = await this.professorRepository.findByIdAndCampusId(id, campusId);
    if (!professorExistente) {
      throw new Error('Professor não encontrado.');
    }

    await this.professorRepository.delete(id);
  }
}

module.exports = DeleteProfessorUseCase;