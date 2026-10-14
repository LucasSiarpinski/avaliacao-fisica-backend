// routes/alunos.js

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();
const prisma = new PrismaClient();

// --- ROTA PARA CRIAR UM NOVO ALUNO (VERSÃO COMPLETA) ---
router.post('/', authenticateToken, async (req, res) => {
  // Agora pegamos TODOS os campos possíveis do body
  const { 
    nome, email, dataNasc, matricula, cpf, genero, telefone,
    altura, peso, objetivos, historicoMedico, medicamentosEmUso, habitos, observacoes,
    parq_q1, parq_q2, parq_q3, parq_q4, parq_q5, parq_q6, parq_q7
  } = req.body;
  
  const professorLogado = req.user;

  // A validação continua a mesma para os campos essenciais
  if (!nome || !email || !dataNasc || !matricula) {
    return res.status(400).json({ error: 'Nome, email, data de nascimento e matrícula são obrigatórios.' });
  }

  // Verifica se alguma anamnese ou PAR-Q foi preenchida
  const temAnamnese = Boolean(
    objetivos || historicoMedico || medicamentosEmUso || habitos || observacoes ||
    parq_q1 || parq_q2 || parq_q3 || parq_q4 || parq_q5 || parq_q6 || parq_q7
  );

  try {
    const novoAluno = await prisma.aluno.create({
      data: {
        nome,
        email,
        dataNasc: new Date(dataNasc),
        matricula,
        cpf: cpf || null,
        genero: genero || null,
        telefone: telefone || null,
        altura: altura ? parseFloat(altura) : null,
        peso: peso ? parseFloat(peso) : null,
        objetivos: objetivos || null,
        historicoMedico: historicoMedico || null,
        medicamentosEmUso: medicamentosEmUso || null,
        habitos: habitos || null,
        observacoes: observacoes || null,
        parq_q1: parq_q1 || null,
        parq_q2: parq_q2 || null,
        parq_q3: parq_q3 || null,
        parq_q4: parq_q4 || null,
        parq_q5: parq_q5 || null,
        parq_q6: parq_q6 || null,
        parq_q7: parq_q7 || null,
        anamneseStatus: temAnamnese ? 'COMPLETED' : 'PENDING',
        status: req.body.status === 'INATIVO' ? 'INATIVO' : 'ATIVO',
        professorId: professorLogado.id,
        campusId: professorLogado.campusId,
      },
    });
    res.status(201).json(novoAluno);
  } catch (error) {
    if (error.code === 'P2002') { // Erro de campo único (email ou matrícula)
      return res.status(400).json({ error: 'Este email ou matrícula já está em uso.' });
    }
    console.error('Erro ao criar aluno:', error);
    res.status(500).json({ error: 'Não foi possível criar o aluno.' });
  }
});

// --- ROTA PARA LISTAR OS ALUNOS DO PROFESSOR LOGADO ---
router.get('/', authenticateToken, async (req, res) => {
  const professorId = req.user.id;
  try {
    const alunos = await prisma.aluno.findMany({
      where: { professorId: professorId },
      orderBy: { nome: 'asc' },
    });
    res.json(alunos);
  } catch (error) {
    console.error('Erro ao listar alunos:', error);
    res.status(500).json({ error: 'Não foi possível buscar os alunos.' });
  }
});

// --- ROTA PARA BUSCAR UM ALUNO ESPECÍFICO PELO ID ---
router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const professorId = req.user.id;
  try {
    const aluno = await prisma.aluno.findUnique({
      where: { id: parseInt(id), professorId: professorId },
    });
    if (!aluno) {
      return res.status(404).json({ error: "Aluno não encontrado ou não pertence a este professor." });
    }
    res.json(aluno);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar aluno." });
  }
});

// --- ROTA PARA ATUALIZAR UM ALUNO ---
router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const professorId = req.user.id;
  const dataToUpdate = { ...req.body };

  // Remove campos de relacionamento ou imutáveis que causariam erro no Prisma
  delete dataToUpdate.id;
  delete dataToUpdate.professorId;
  delete dataToUpdate.campusId;
  delete dataToUpdate.createdAt;
  delete dataToUpdate.updatedAt;
  delete dataToUpdate.campus;
  delete dataToUpdate.professor;
  delete dataToUpdate.avaliacoes;
  delete dataToUpdate.documentos;
  delete dataToUpdate.anamneseSentAt;
  delete dataToUpdate.idade;

  // 1. Converte a data de nascimento, se ela foi enviada
  if (dataToUpdate.dataNasc && typeof dataToUpdate.dataNasc === 'string') {
    dataToUpdate.dataNasc = new Date(dataToUpdate.dataNasc);
  }

  // 2. Converte a ALTURA para Float, se ela foi enviada
  if (dataToUpdate.altura && typeof dataToUpdate.altura === 'string') {
    dataToUpdate.altura = parseFloat(dataToUpdate.altura);
  } else if (dataToUpdate.altura === '' || dataToUpdate.altura === null) {
    dataToUpdate.altura = null;
  }

  // 3. Converte o PESO para Float, se ele foi enviado
  if (dataToUpdate.peso && typeof dataToUpdate.peso === 'string') {
    dataToUpdate.peso = parseFloat(dataToUpdate.peso);
  } else if (dataToUpdate.peso === '' || dataToUpdate.peso === null) {
    dataToUpdate.peso = null;
  }

  // 4. Atualiza anamneseStatus para COMPLETED se houver anamnese ou PAR-Q preenchido
  const temAnamnese = Boolean(
    dataToUpdate.objetivos || dataToUpdate.historicoMedico || dataToUpdate.medicamentosEmUso || dataToUpdate.habitos || dataToUpdate.observacoes ||
    dataToUpdate.parq_q1 || dataToUpdate.parq_q2 || dataToUpdate.parq_q3 || dataToUpdate.parq_q4 || dataToUpdate.parq_q5 || dataToUpdate.parq_q6 || dataToUpdate.parq_q7
  );
  if (temAnamnese) {
    dataToUpdate.anamneseStatus = 'COMPLETED';
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
    res.json(alunoAtualizado);
  } catch (error) {
    console.error("Erro ao atualizar aluno:", error);
    res.status(500).json({ error: "Erro ao atualizar aluno." });
  }
});

// --- ROTA PARA EXCLUIR UM ALUNO ---
router.delete('/:id', authenticateToken, async (req, res) => {
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
    res.status(204).send();
  } catch (error) {
    console.error("Erro ao excluir aluno:", error);
    res.status(500).json({ error: "Erro ao excluir aluno." });
  }
});

// --- ROTA PARA ALTERAR O STATUS DE UM ALUNO ---
// Usamos PATCH porque é uma atualização parcial
router.patch('/:id/status', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // O frontend nos enviará o novo status: "ATIVO" ou "INATIVO"
  const professorId = req.user.id;

  // Validação: garante que o status enviado é válido
  if (status !== 'ATIVO' && status !== 'INATIVO') {
    return res.status(400).json({ error: 'Status inválido.' });
  }

  try {
    // Verifica se o aluno pertence ao professor logado
    const alunoExistente = await prisma.aluno.findFirst({
      where: { id: parseInt(id), professorId: professorId },
    });
    if (!alunoExistente) {
      return res.status(404).json({ error: "Permissão negada. Aluno não encontrado." });
    }

    // Atualiza APENAS o campo de status
    const alunoAtualizado = await prisma.aluno.update({
      where: { id: parseInt(id) },
      data: { status: status },
    });
    res.json(alunoAtualizado);
  } catch (error) {
    console.error("Erro ao atualizar status do aluno:", error);
    res.status(500).json({ error: "Erro ao atualizar status do aluno." });
  }
});

// --- ROTA PARA LISTAR TODAS AS AVALIAÇÕES DE UM ALUNO ---
router.get('/:id/avaliacoes', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const avaliacoes = await prisma.avaliacao.findMany({
      where: { alunoId: parseInt(id) },
      orderBy: { dataAvaliacao: 'desc' },
      include: {
        avaliador: {
          select: { name: true, email: true },
        },
      },
    });
    res.json(avaliacoes);
  } catch (error) {
    console.error('Erro ao buscar avaliações do aluno:', error);
    res.status(500).json({ error: 'Não foi possível buscar as avaliações deste aluno.' });
  }
});

module.exports = router;