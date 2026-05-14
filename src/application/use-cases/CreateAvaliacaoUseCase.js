class CreateAvaliacaoUseCase {
  constructor(avaliacaoRepository, alunoRepository) {
    this.avaliacaoRepository = avaliacaoRepository;
    this.alunoRepository = alunoRepository;
  }

  async execute(avaliacaoData, requester) {
    if (!avaliacaoData.alunoId || !avaliacaoData.avaliadorId) {
      throw new Error('Aluno e avaliador são obrigatórios.');
    }

    const aluno = await this.alunoRepository.findById(avaliacaoData.alunoId);
    if (!aluno) {
      throw new Error('Aluno não encontrado.');
    }

    if (requester.role === 'ADMIN') {
      if (aluno.campusId !== requester.campusId) {
        throw new Error('Aluno não pertence ao seu campus.');
      }
    } else if (aluno.professorId !== requester.id) {
      throw new Error('Você só pode avaliar alunos sob sua responsabilidade.');
    }

    ['objetivos','historicoMedico','medicamentosEmUso','habitos','observacoes',
    'parq_q1','parq_q2','parq_q3','parq_q4','parq_q5','parq_q6','parq_q7','peso','altura']
      .forEach((field) => {
        if (aluno[field] !== undefined && avaliacaoData[field] === undefined) {
          avaliacaoData[field] = aluno[field];
        }
      });

    return await this.avaliacaoRepository.create(avaliacaoData);
  }
}

module.exports = CreateAvaliacaoUseCase;