class GetProfessorByIdUseCase {
  constructor(professorRepository) {
    this.professorRepository = professorRepository;
  }

  async execute(id, campusId) {
    const professor = await this.professorRepository.findByIdAndCampusId(id, campusId);
    if (!professor) {
      throw new Error('Professor não encontrado.');
    }
    return professor;
  }
}

module.exports = GetProfessorByIdUseCase;