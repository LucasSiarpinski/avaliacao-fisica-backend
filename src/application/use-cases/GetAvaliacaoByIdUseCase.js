class GetAvaliacaoByIdUseCase {
  constructor(avaliacaoRepository) {
    this.avaliacaoRepository = avaliacaoRepository;
  }

  async execute(id, user) {
    const avaliacao = await this.avaliacaoRepository.findByIdForUser(id, user);
    if (!avaliacao) {
      throw new Error('Avaliação não encontrada.');
    }
    return avaliacao;
  }
}

module.exports = GetAvaliacaoByIdUseCase;