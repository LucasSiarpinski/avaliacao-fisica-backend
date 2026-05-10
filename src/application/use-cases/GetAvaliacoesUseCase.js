class GetAvaliacoesUseCase {
  constructor(avaliacaoRepository) {
    this.avaliacaoRepository = avaliacaoRepository;
  }

  async execute() {
    return await this.avaliacaoRepository.findAll();
  }
}

module.exports = GetAvaliacoesUseCase;