class DeleteAlunoUseCase {
  constructor(alunoRepository) {
    this.alunoRepository = alunoRepository;
  }

  async execute(id, professorId) {
    // Verificar se o aluno existe e pertence ao professor
    const alunoExistente = await this.alunoRepository.findByIdAndProfessor(id, professorId);
    if (!alunoExistente) {
      throw new Error('Permissão negada. Aluno não encontrado.');
    }

    await this.alunoRepository.delete(id);
  }
}

module.exports = DeleteAlunoUseCase;