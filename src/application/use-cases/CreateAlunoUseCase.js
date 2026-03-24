class CreateAlunoUseCase {
  constructor(alunoRepository) {
    this.alunoRepository = alunoRepository;
  }

  async execute(alunoData) {
    // Validações básicas
    if (!alunoData.nome || !alunoData.email || !alunoData.dataNasc || !alunoData.matricula) {
      throw new Error('Nome, email, data de nascimento e matrícula são obrigatórios.');
    }

    // Verificar se email ou matrícula já existem (simulando unique constraint)
    // Nota: Em uma implementação real, o repositório deveria lidar com isso
    try {
      const newAluno = await this.alunoRepository.create(alunoData);
      return newAluno;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new Error('Este email ou matrícula já está em uso.');
      }
      throw error;
    }
  }
}

module.exports = CreateAlunoUseCase;