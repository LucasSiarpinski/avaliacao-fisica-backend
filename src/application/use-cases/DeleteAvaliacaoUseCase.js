class DeleteAvaliacaoUseCase {
  constructor(avaliacaoRepository) {
    this.avaliacaoRepository = avaliacaoRepository;
  }

  async execute(id, user) {
    const avaliacaoExistente = await this.avaliacaoRepository.findByIdForUser(id, user);
    if (!avaliacaoExistente) {
      throw new Error('Avaliação não encontrada.');
    }
    await this.avaliacaoRepository.delete(id);
  }
}

module.exports = DeleteAvaliacaoUseCase;