const PrismaProfessorRepository = require('../../repositories/PrismaProfessorRepository');
const CreateProfessorUseCase = require('../../../application/use-cases/CreateProfessorUseCase');
const GetProfessoresUseCase = require('../../../application/use-cases/GetProfessoresUseCase');
const GetProfessorByIdUseCase = require('../../../application/use-cases/GetProfessorByIdUseCase');
const UpdateProfessorUseCase = require('../../../application/use-cases/UpdateProfessorUseCase');
const DeleteProfessorUseCase = require('../../../application/use-cases/DeleteProfessorUseCase');

class ProfessorController {
  constructor() {
    const professorRepository = new PrismaProfessorRepository();
    this.createProfessorUseCase = new CreateProfessorUseCase(professorRepository);
    this.getProfessoresUseCase = new GetProfessoresUseCase(professorRepository);
    this.getProfessorByIdUseCase = new GetProfessorByIdUseCase(professorRepository);
    this.updateProfessorUseCase = new UpdateProfessorUseCase(professorRepository);
    this.deleteProfessorUseCase = new DeleteProfessorUseCase(professorRepository);
  }

  // --- CRIAR UM NOVO PROFESSOR ---
  create = async (req, res) => {
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
  getAll = async (req, res) => {
    try {
      const professores = await this.getProfessoresUseCase.execute();
      return res.status(200).json(professores);
    } catch (error) {
      console.error('Erro ao buscar professores:', error);
      return res.status(500).json({ message: 'Erro ao buscar professores.', error: error.message });
    }
  }

  // --- BUSCAR UM PROFESSOR ESPECÍFICO PELO ID ---
  getById = async (req, res) => {
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
  update = async (req, res) => {
    const { id } = req.params;
    const { name, email, password, role, campusId, status } = req.body;

    const dataToUpdate = {
      name,
      email,
      role,
      status,
      campusId: campusId ? parseInt(campusId) : undefined,
    };

    if (password) {
      dataToUpdate.password = password;
    }

    try {
      const professorAtualizado = await this.updateProfessorUseCase.execute(id, dataToUpdate);
      return res.status(200).json(professorAtualizado);
    } catch (error) {
      console.error('Erro ao atualizar professor:', error);
      return res.status(400).json({ message: error.message });
    }
  }

  // --- EXCLUIR UM PROFESSOR ---
  delete = async (req, res) => {
    const { id } = req.params;

    try {
      await this.deleteProfessorUseCase.execute(id);
      return res.status(204).send();
    } catch (error) {
      console.error('Erro ao excluir professor:', error);
      return res.status(400).json({ message: error.message });
    }
  }
}

module.exports = new ProfessorController();