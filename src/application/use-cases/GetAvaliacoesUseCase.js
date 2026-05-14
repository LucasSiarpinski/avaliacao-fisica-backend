class GetAvaliacoesUseCase {
  constructor(avaliacaoRepository) {
    this.avaliacaoRepository = avaliacaoRepository;
  }

  async execute(user) {
    return await this.avaliacaoRepository.findAllForUser(user);
  }
}

module.exports = GetAvaliacoesUseCase;