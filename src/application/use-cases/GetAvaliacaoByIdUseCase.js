class GetAvaliacaoByIdUseCase {
  constructor(avaliacaoRepository) {
    this.avaliacaoRepository = avaliacaoRepository;
  }

  async execute(id) {
    const avaliacao = await this.avaliacaoRepository.findById(id);
    if (!avaliacao) {
      throw new Error('Avaliação não encontrada.');
    }
    return avaliacao;
  }
}

module.exports = GetAvaliacaoByIdUseCase;