class GetProfessoresUseCase {
  constructor(professorRepository) {
    this.professorRepository = professorRepository;
  }

  async execute() {
    return await this.professorRepository.findAll();
  }
}

module.exports = GetProfessoresUseCase;