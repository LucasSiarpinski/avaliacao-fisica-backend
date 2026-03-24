class GetProfessorByIdUseCase {
  constructor(professorRepository) {
    this.professorRepository = professorRepository;
  }

  async execute(id) {
    const professor = await this.professorRepository.findById(id);
    if (!professor) {
      throw new Error('Professor não encontrado.');
    }
    return professor;
  }
}

module.exports = GetProfessorByIdUseCase;