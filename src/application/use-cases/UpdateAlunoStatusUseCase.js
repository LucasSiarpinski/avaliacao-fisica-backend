class UpdateAlunoStatusUseCase {
  constructor(alunoRepository) {
    this.alunoRepository = alunoRepository;
  }

  async execute(id, professorId, status) {
    if (status !== 'ATIVO' && status !== 'INATIVO') {
      throw new Error('Status inválido.');
    }

    // Verificar se o aluno existe e pertence ao professor
    const alunoExistente = await this.alunoRepository.findByIdAndProfessor(id, professorId);
    if (!alunoExistente) {
      throw new Error('Permissão negada. Aluno não encontrado.');
    }

    return await this.alunoRepository.updateStatus(id, status);
  }
}

module.exports = UpdateAlunoStatusUseCase;