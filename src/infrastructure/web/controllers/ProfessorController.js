const PrismaProfessorRepository = require('../../repositories/PrismaProfessorRepository');
const CreateProfessorUseCase = require('../../../application/use-cases/CreateProfessorUseCase');
const GetProfessoresUseCase = require('../../../application/use-cases/GetProfessoresUseCase');
const GetProfessorByIdUseCase = require('../../../application/use-cases/GetProfessorByIdUseCase');

class ProfessorController {
  constructor() {
    const professorRepository = new PrismaProfessorRepository();
    this.createProfessorUseCase = new CreateProfessorUseCase(professorRepository);
    this.getProfessoresUseCase = new GetProfessoresUseCase(professorRepository);
    this.getProfessorByIdUseCase = new GetProfessorByIdUseCase(professorRepository);
  }

  // --- CRIAR UM NOVO PROFESSOR ---
  async create(req, res) {
    const { name, email, password, role, campusId } = req.body;

    try {
      const novoProfessor = await this.createProfessorUseCase.execute({
        name,
        email,
        password,
        role: role || 'PROFESSOR',
        campusId: parseInt(campusId),
      });
      return res.status(201).json(novoProfessor);
    } catch (error) {
      console.error('Erro ao criar professor:', error);
      return res.status(400).json({ message: error.message });
    }
  }

  // --- LISTAR TODOS OS PROFESSORES ---
  async getAll(req, res) {
    try {
      const professores = await this.getProfessoresUseCase.execute();
      return res.status(200).json(professores);
    } catch (error) {
      console.error('Erro ao buscar professores:', error);
      return res.status(500).json({ message: 'Erro ao buscar professores.', error: error.message });
    }
  }

  // --- BUSCAR UM PROFESSOR ESPECÍFICO PELO ID ---
  async getById(req, res) {
    const { id } = req.params;
    try {
      const professor = await this.getProfessorByIdUseCase.execute(id);
      return res.status(200).json(professor);
    } catch (error) {
      console.error('Erro ao buscar professor:', error);
      return res.status(404).json({ message: error.message });
    }
  }

  // --- ATUALIZAR UM PROFESSOR ---
  async update(req, res) {
    // Implementação básica - pode ser expandida depois
    return res.status(501).json({ message: 'Funcionalidade ainda não implementada.' });
  }

  // --- EXCLUIR UM PROFESSOR ---
  async delete(req, res) {
    // Implementação básica - pode ser expandida depois
    return res.status(501).json({ message: 'Funcionalidade ainda não implementada.' });
  }
}

module.exports = new ProfessorController();