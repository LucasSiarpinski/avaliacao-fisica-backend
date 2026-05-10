class DeleteProfessorUseCase {
  constructor(professorRepository) {
    this.professorRepository = professorRepository;
  }

  async execute(id) {
    const professorExistente = await this.professorRepository.findById(id);
    if (!professorExistente) {
      throw new Error('Professor não encontrado.');
    }

    await this.professorRepository.delete(id);
  }
}

module.exports = DeleteProfessorUseCase;