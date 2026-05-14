class UpdateAvaliacaoUseCase {
  constructor(avaliacaoRepository) {
    this.avaliacaoRepository = avaliacaoRepository;
  }

  async execute(id, avaliacaoData, user) {
    const avaliacaoExistente = await this.avaliacaoRepository.findByIdForUser(id, user);
    if (!avaliacaoExistente) {
      throw new Error('Avaliação não encontrada.');
    }
    return await this.avaliacaoRepository.update(id, avaliacaoData);
  }
}

module.exports = UpdateAvaliacaoUseCase;