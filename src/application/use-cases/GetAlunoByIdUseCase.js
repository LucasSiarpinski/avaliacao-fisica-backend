class GetAlunoByIdUseCase {
  constructor(alunoRepository) {
    this.alunoRepository = alunoRepository;
  }

  async execute(id, professorId) {
    const aluno = await this.alunoRepository.findByIdAndProfessor(id, professorId);
    if (!aluno) {
      throw new Error('Aluno não encontrado ou não pertence a este professor.');
    }
    return aluno;
  }
}

module.exports = GetAlunoByIdUseCase;