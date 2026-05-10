class UpdateAvaliacaoUseCase {
  constructor(avaliacaoRepository) {
    this.avaliacaoRepository = avaliacaoRepository;
  }

  async execute(id, avaliacaoData) {
    const avaliacaoExistente = await this.avaliacaoRepository.findById(id);
    if (!avaliacaoExistente) {
      throw new Error('Avaliação não encontrada.');
    }
    return await this.avaliacaoRepository.update(id, avaliacaoData);
  }
}

module.exports = UpdateAvaliacaoUseCase;