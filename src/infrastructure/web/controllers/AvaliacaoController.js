const PrismaAvaliacaoRepository = require('../../repositories/PrismaAvaliacaoRepository');
const PrismaAlunoRepository = require('../../repositories/PrismaAlunoRepository');
const CreateAvaliacaoUseCase = require('../../../application/use-cases/CreateAvaliacaoUseCase');
const GetAvaliacoesUseCase = require('../../../application/use-cases/GetAvaliacoesUseCase');
const GetAvaliacaoByIdUseCase = require('../../../application/use-cases/GetAvaliacaoByIdUseCase');
const UpdateAvaliacaoUseCase = require('../../../application/use-cases/UpdateAvaliacaoUseCase');
const DeleteAvaliacaoUseCase = require('../../../application/use-cases/DeleteAvaliacaoUseCase');

class AvaliacaoController {
  constructor() {
    const avaliacaoRepository = new PrismaAvaliacaoRepository();
    const alunoRepository = new PrismaAlunoRepository();

    this.createAvaliacaoUseCase = new CreateAvaliacaoUseCase(avaliacaoRepository, alunoRepository);
    this.getAvaliacoesUseCase = new GetAvaliacoesUseCase(avaliacaoRepository);
    this.getAvaliacaoByIdUseCase = new GetAvaliacaoByIdUseCase(avaliacaoRepository);
    this.updateAvaliacaoUseCase = new UpdateAvaliacaoUseCase(avaliacaoRepository);
    this.deleteAvaliacaoUseCase = new DeleteAvaliacaoUseCase(avaliacaoRepository);
  }

  getAll = async (req, res) => {
    try {
      const avaliacoes = await this.getAvaliacoesUseCase.execute();
      return res.json(avaliacoes);
    } catch (error) {
      console.error('Erro ao listar avaliações:', error);
      return res.status(500).json({ error: 'Não foi possível listar as avaliações.' });
    }
  }

  getById = async (req, res) => {
    const { id } = req.params;
    try {
      const avaliacao = await this.getAvaliacaoByIdUseCase.execute(id);
      return res.json(avaliacao);
    } catch (error) {
      console.error('Erro ao buscar avaliação por ID:', error);
      return res.status(404).json({ error: error.message });
    }
  }

  create = async (req, res) => {
    const avaliadorId = req.user.id;
    const { alunoId, ...rest } = req.body;

    try {
      const novaAvaliacao = await this.createAvaliacaoUseCase.execute({
        alunoId: parseInt(alunoId),
        avaliadorId,
        ...rest,
      });
      return res.status(201).json(novaAvaliacao);
    } catch (error) {
      console.error('Erro ao criar avaliação:', error);
      return res.status(400).json({ error: error.message });
    }
  }

  update = async (req, res) => {
    const { id } = req.params;
    const dataToUpdate = req.body;

    try {
      const avaliacaoAtualizada = await this.updateAvaliacaoUseCase.execute(id, dataToUpdate);
      return res.json(avaliacaoAtualizada);
    } catch (error) {
      console.error('Erro ao atualizar avaliação:', error);
      return res.status(400).json({ error: error.message });
    }
  }

  delete = async (req, res) => {
    const { id } = req.params;

    try {
      await this.deleteAvaliacaoUseCase.execute(id);
      return res.status(204).send();
    } catch (error) {
      console.error('Erro ao excluir avaliação:', error);
      return res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new AvaliacaoController();