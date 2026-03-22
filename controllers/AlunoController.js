const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class AlunoController {
  // --- CRIAR UM NOVO ALUNO ---
  async create(req, res) {
    const { 
      nome, email, dataNasc, matricula, cpf, genero, telefone,
      altura, peso, objetivos, historicoMedico, medicamentosEmUso, habitos, observacoes 
    } = req.body;
    
    const professorLogado = req.user;

    if (!nome || !email || !dataNasc || !matricula) {
      return res.status(400).json({ error: 'Nome, email, data de nascimento e matrícula são obrigatórios.' });
    }

    try {
      const novoAluno = await prisma.aluno.create({
        data: {
          nome, email, dataNasc: new Date(dataNasc), matricula, cpf, genero, telefone,
          altura: altura ? parseFloat(altura) : null,
          peso: peso ? parseFloat(peso) : null,
          objetivos, historicoMedico, medicamentosEmUso, habitos, observacoes,
          professorId: professorLogado.id,
          campusId: professorLogado.campusId,
        },
      });
      return res.status(201).json(novoAluno);
    } catch (error) {
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'Este email ou matrícula já está em uso.' });
      }
      console.error('Erro ao criar aluno:', error);
      return res.status(500).json({ error: 'Não foi possível criar o aluno.' });
    }
  }

  // --- LISTAR OS ALUNOS DO PROFESSOR LOGADO ---
  async getAll(req, res) {
    const professorId = req.user.id;
    try {
      const alunos = await prisma.aluno.findMany({
        where: { professorId: professorId },
        orderBy: { nome: 'asc' },
      });
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
      const aluno = await prisma.aluno.findUnique({
        where: { id: parseInt(id), professorId: professorId },
      });
      if (!aluno) {
        return res.status(404).json({ error: "Aluno não encontrado ou não pertence a este professor." });
      }
      return res.json(aluno);
    } catch (error) {
      console.error('Erro ao buscar aluno por ID:', error);
      return res.status(500).json({ error: "Erro ao buscar aluno." });
    }
  }

  // --- ATUALIZAR UM ALUNO ---
  async update(req, res) {
    const { id } = req.params;
    const professorId = req.user.id;
    const dataToUpdate = req.body;

    if (dataToUpdate.dataNasc && typeof dataToUpdate.dataNasc === 'string') {
      dataToUpdate.dataNasc = new Date(dataToUpdate.dataNasc);
    }

    if (dataToUpdate.altura && typeof dataToUpdate.altura === 'string') {
      dataToUpdate.altura = parseFloat(dataToUpdate.altura);
    } else if (dataToUpdate.altura === '') {
      dataToUpdate.altura = null;
    }

    if (dataToUpdate.peso && typeof dataToUpdate.peso === 'string') {
      dataToUpdate.peso = parseFloat(dataToUpdate.peso);
    } else if (dataToUpdate.peso === '') {
      dataToUpdate.peso = null;
    }

    try {
      const alunoExistente = await prisma.aluno.findFirst({
        where: { id: parseInt(id), professorId: professorId },
      });
      
      if (!alunoExistente) {
        return res.status(404).json({ error: "Permissão negada. Aluno não encontrado." });
      }

      const alunoAtualizado = await prisma.aluno.update({
        where: { id: parseInt(id) },
        data: dataToUpdate,
      });
      return res.json(alunoAtualizado);
    } catch (error) {
      console.error("Erro ao atualizar aluno:", error);
      return res.status(500).json({ error: "Erro ao atualizar aluno." });
    }
  }

  // --- EXCLUIR UM ALUNO ---
  async delete(req, res) {
    const { id } = req.params;
    const professorId = req.user.id;
    try {
      const alunoExistente = await prisma.aluno.findFirst({
        where: { id: parseInt(id), professorId: professorId },
      });
      if (!alunoExistente) {
        return res.status(404).json({ error: "Permissão negada. Aluno não encontrado." });
      }
      await prisma.aluno.delete({
        where: { id: parseInt(id) },
      });
      return res.status(204).send();
    } catch (error) {
      console.error("Erro ao excluir aluno:", error);
      return res.status(500).json({ error: "Erro ao excluir aluno." });
    }
  }

  // --- ALTERAR O STATUS DE UM ALUNO ---
  async updateStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;
    const professorId = req.user.id;

    if (status !== 'ATIVO' && status !== 'INATIVO') {
      return res.status(400).json({ error: 'Status inválido.' });
    }

    try {
      const alunoExistente = await prisma.aluno.findFirst({
        where: { id: parseInt(id), professorId: professorId },
      });
      if (!alunoExistente) {
        return res.status(404).json({ error: "Permissão negada. Aluno não encontrado." });
      }

      const alunoAtualizado = await prisma.aluno.update({
        where: { id: parseInt(id) },
        data: { status: status },
      });
      return res.json(alunoAtualizado);
    } catch (error) {
      console.error("Erro ao atualizar status do aluno:", error);
      return res.status(500).json({ error: "Erro ao atualizar status do aluno." });
    }
  }
}

module.exports = new AlunoController();