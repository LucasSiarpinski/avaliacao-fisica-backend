class GetProfessoresUseCase {
  constructor(professorRepository) {
    this.professorRepository = professorRepository;
  }

  async execute(campusId) {
    if (campusId == null) {
      throw new Error('Campus é obrigatório para listar professores.');
    }
    return await this.professorRepository.findAllByCampusId(campusId);
  }
}

module.exports = GetProfessoresUseCase;