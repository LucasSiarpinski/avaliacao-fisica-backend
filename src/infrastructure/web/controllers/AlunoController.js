const PrismaAlunoRepository = require('../../repositories/PrismaAlunoRepository');
const CreateAlunoUseCase = require('../../../application/use-cases/CreateAlunoUseCase');
const GetAlunosUseCase = require('../../../application/use-cases/GetAlunosUseCase');
const GetAlunoByIdUseCase = require('../../../application/use-cases/GetAlunoByIdUseCase');
const UpdateAlunoUseCase = require('../../../application/use-cases/UpdateAlunoUseCase');
const DeleteAlunoUseCase = require('../../../application/use-cases/DeleteAlunoUseCase');
const UpdateAlunoStatusUseCase = require('../../../application/use-cases/UpdateAlunoStatusUseCase');

class AlunoController {
  constructor() {
    const alunoRepository = new PrismaAlunoRepository();
    this.createAlunoUseCase = new CreateAlunoUseCase(alunoRepository);
    this.getAlunosUseCase = new GetAlunosUseCase(alunoRepository);
    this.getAlunoByIdUseCase = new GetAlunoByIdUseCase(alunoRepository);
    this.updateAlunoUseCase = new UpdateAlunoUseCase(alunoRepository);
    this.deleteAlunoUseCase = new DeleteAlunoUseCase(alunoRepository);
    this.updateAlunoStatusUseCase = new UpdateAlunoStatusUseCase(alunoRepository);
  }

  // --- CRIAR UM NOVO ALUNO ---
  async create(req, res) {
    const {
      nome, email, dataNasc, matricula, cpf, genero, telefone,
      altura, peso, objetivos, historicoMedico, medicamentosEmUso, habitos, observacoes,
      parq_q1, parq_q2, parq_q3, parq_q4, parq_q5, parq_q6, parq_q7
    } = req.body;

    const professorLogado = req.user;

    try {
      const novoAluno = await this.createAlunoUseCase.execute({
        nome, email, dataNasc: new Date(dataNasc), matricula, cpf, genero, telefone,
        altura: altura ? parseFloat(altura) : null,
        peso: peso ? parseFloat(peso) : null,
        objetivos, historicoMedico, medicamentosEmUso, habitos, observacoes,
        parq_q1, parq_q2, parq_q3, parq_q4, parq_q5, parq_q6, parq_q7,
        professorId: professorLogado.id,
        campusId: professorLogado.campusId,
      });
      return res.status(201).json(novoAluno);
    } catch (error) {
      console.error('Erro ao criar aluno:', error);
      return res.status(400).json({ error: error.message });
    }
  }

  // --- LISTAR OS ALUNOS DO PROFESSOR LOGADO ---
  async getAll(req, res) {
    const professorId = req.user.id;
    try {
      const alunos = await this.getAlunosUseCase.execute(professorId);
      return res.json(alunos);
    } catch (error) {
      console.error('Erro ao listar alunos:', error);
      return res.status(500).json({ error: 'Não foi possível buscar os alunos.' });
    }
  }

  // --- BUSCAR UM ALUNO ESPECÍFICO PELO ID ---
  async getById(req, res) {
    const { id } = req.params;
    const professorId = req.user.id;
    try {
      const aluno = await this.getAlunoByIdUseCase.execute(id, professorId);
      return res.json(aluno);
    } catch (error) {
      console.error('Erro ao buscar aluno por ID:', error);
      return res.status(404).json({ error: error.message });
    }
  }

  // --- ATUALIZAR UM ALUNO ---
  async update(req, res) {
    const { id } = req.params;
    const professorId = req.user.id;
    const dataToUpdate = req.body;

    try {
      const alunoAtualizado = await this.updateAlunoUseCase.execute(id, professorId, dataToUpdate);
      return res.json(alunoAtualizado);
    } catch (error) {
      console.error("Erro ao atualizar aluno:", error);
      return res.status(400).json({ error: error.message });
    }
  }

  // --- EXCLUIR UM ALUNO ---
  async delete(req, res) {
    const { id } = req.params;
    const professorId = req.user.id;
    try {
      await this.deleteAlunoUseCase.execute(id, professorId);
      return res.status(204).send();
    } catch (error) {
      console.error("Erro ao excluir aluno:", error);
      return res.status(400).json({ error: error.message });
    }
  }

  // --- ALTERAR O STATUS DE UM ALUNO ---
  async updateStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;
    const professorId = req.user.id;

    try {
      const alunoAtualizado = await this.updateAlunoStatusUseCase.execute(id, professorId, status);
      return res.json(alunoAtualizado);
    } catch (error) {
      console.error("Erro ao alterar status do aluno:", error);
      return res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new AlunoController();
