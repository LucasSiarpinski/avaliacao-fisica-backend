class IAlunoRepository {
  async create(alunoData) {
    throw new Error('Method not implemented');
  }

  async findAllByProfessor(professorId) {
    throw new Error('Method not implemented');
  }

  async findById(id) {
    throw new Error('Method not implemented');
  }

  async findByIdAndProfessor(id, professorId) {
    throw new Error('Method not implemented');
  }

  async update(id, alunoData) {
    throw new Error('Method not implemented');
  }

  async delete(id) {
    throw new Error('Method not implemented');
  }

  async updateStatus(id, status) {
    throw new Error('Method not implemented');
  }
}

module.exports = IAlunoRepository;