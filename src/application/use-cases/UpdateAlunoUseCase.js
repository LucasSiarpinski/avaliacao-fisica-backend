class UpdateAlunoUseCase {
  constructor(alunoRepository) {
    this.alunoRepository = alunoRepository;
  }

  async execute(id, professorId, dataToUpdate) {
    // Verificar se o aluno existe e pertence ao professor
    const alunoExistente = await this.alunoRepository.findByIdAndProfessor(id, professorId);
    if (!alunoExistente) {
      throw new Error('Permissão negada. Aluno não encontrado.');
    }

    // Processar campos especiais
    if (dataToUpdate.dataNasc && typeof dataToUpdate.dataNasc === 'string') {
      dataToUpdate.dataNasc = new Date(dataToUpdate.dataNasc);
    }

    if (dataToUpdate.altura && typeof dataToUpdate.altura === 'string') {
      dataToUpdate.altura = parseFloat(dataToUpdate.altura);
    } else if (dataToUpdate.altura === '') {
      dataToUpdate.altura = null;
    }

    if (dataToUpdate.peso && typeof dataToUpdate.peso === 'string') {
      dataToUpdate.peso = parseFloat(dataToUpdate.peso);
    } else if (dataToUpdate.peso === '') {
      dataToUpdate.peso = null;
    }

    return await this.alunoRepository.update(id, dataToUpdate);
  }
}

module.exports = UpdateAlunoUseCase;