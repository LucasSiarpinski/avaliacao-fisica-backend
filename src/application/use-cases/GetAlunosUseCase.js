class GetAlunosUseCase {
  constructor(alunoRepository) {
    this.alunoRepository = alunoRepository;
  }

  async execute(professorId) {
    return await this.alunoRepository.findAllByProfessor(professorId);
  }
}

module.exports = GetAlunosUseCase;