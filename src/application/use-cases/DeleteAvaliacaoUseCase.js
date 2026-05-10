class DeleteAvaliacaoUseCase {
  constructor(avaliacaoRepository) {
    this.avaliacaoRepository = avaliacaoRepository;
  }

  async execute(id) {
    const avaliacaoExistente = await this.avaliacaoRepository.findById(id);
    if (!avaliacaoExistente) {
      throw new Error('Avaliação não encontrada.');
    }
    await this.avaliacaoRepository.delete(id);
  }
}

module.exports = DeleteAvaliacaoUseCase;