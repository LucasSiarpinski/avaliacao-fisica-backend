const PrismaProfessorRepository = require('../../repositories/PrismaProfessorRepository');
const CreateProfessorUseCase = require('../../../application/use-cases/CreateProfessorUseCase');
const GetProfessoresUseCase = require('../../../application/use-cases/GetProfessoresUseCase');
const GetProfessorByIdUseCase = require('../../../application/use-cases/GetProfessorByIdUseCase');
const UpdateProfessorUseCase = require('../../../application/use-cases/UpdateProfessorUseCase');
const DeleteProfessorUseCase = require('../../../application/use-cases/DeleteProfessorUseCase');

function withoutPassword(user) {
  if (!user) return user;
  const plain = typeof user.toJSON === 'function' ? user.toJSON() : { ...user };
  delete plain.password;
  return plain;
}

class ProfessorController {
  constructor() {
    const professorRepository = new PrismaProfessorRepository();
    this.createProfessorUseCase = new CreateProfessorUseCase(professorRepository);
    this.getProfessoresUseCase = new GetProfessoresUseCase(professorRepository);
    this.getProfessorByIdUseCase = new GetProfessorByIdUseCase(professorRepository);
    this.updateProfessorUseCase = new UpdateProfessorUseCase(professorRepository);
    this.deleteProfessorUseCase = new DeleteProfessorUseCase(professorRepository);
  }

  create = async (req, res) => {
    const { name, email, password, role } = req.body;
    const campusId = req.user.campusId;

    try {
      const novoProfessor = await this.createProfessorUseCase.execute(
        { name, email, password, role },
        campusId
      );
      return res.status(201).json(withoutPassword(novoProfessor));
    } catch (error) {
      console.error('Erro ao criar professor:', error);
      return res.status(400).json({ message: error.message });
    }
  };

  getAll = async (req, res) => {
    try {
      const professores = await this.getProfessoresUseCase.execute(req.user.campusId);
      return res.status(200).json(professores.map(withoutPassword));
    } catch (error) {
      console.error('Erro ao buscar professores:', error);
      return res.status(500).json({ message: 'Erro ao buscar professores.', error: error.message });
    }
  };

  getById = async (req, res) => {
    const { id } = req.params;
    try {
      const professor = await this.getProfessorByIdUseCase.execute(id, req.user.campusId);
      return res.status(200).json(withoutPassword(professor));
    } catch (error) {
      console.error('Erro ao buscar professor:', error);
      return res.status(404).json({ message: error.message });
    }
  };

  update = async (req, res) => {
    const { id } = req.params;
    const { name, email, password, role, status } = req.body;

    const dataToUpdate = {
      name,
      email,
      role,
      status,
    };

    if (password) {
      dataToUpdate.password = password;
    }

    try {
      const professorAtualizado = await this.updateProfessorUseCase.execute(
        id,
        dataToUpdate,
        req.user.campusId
      );
      return res.status(200).json(withoutPassword(professorAtualizado));
    } catch (error) {
      console.error('Erro ao atualizar professor:', error);
      return res.status(400).json({ message: error.message });
    }
  };

  delete = async (req, res) => {
    const { id } = req.params;

    try {
      await this.deleteProfessorUseCase.execute(id, req.user.campusId);
      return res.status(204).send();
    } catch (error) {
      console.error('Erro ao excluir professor:', error);
      return res.status(400).json({ message: error.message });
    }
  };
}

module.exports = new ProfessorController();
