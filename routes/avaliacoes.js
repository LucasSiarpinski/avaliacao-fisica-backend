const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// --- AUTENTICAÇÃO ---
// Importa o middleware de autenticação
const { authenticateToken } = require('../middlewares/authMiddleware');
// Aplica o middleware a TODAS as rotas neste arquivo.
router.use(authenticateToken); 

// --- ROTA GET / ---
// Lista todas as avaliações
router.get('/', async (req, res) => {
  try {
    const avaliacoes = await prisma.avaliacao.findMany({
      orderBy: {
        dataAvaliacao: 'desc',
      },
      include: {
        aluno: {
          select: {
            nome: true, // Aluno usa 'nome'
            matricula: true,
          },
        },
        avaliador: {
          select: {
            name: true, // User (avaliador) usa 'name'
          },
        },
      },
    });
    res.json(avaliacoes);
  } catch (error) {
    console.error('Erro ao buscar avaliações:', error);
    res.status(500).json({ error: 'Não foi possível buscar as avaliações.' });
  }
});

// --- ROTA POST / ---
// Cria uma nova avaliação (baseado na seleção do aluno)
router.post('/', async (req, res) => {
  const { alunoId } = req.body;
  const avaliadorId = req.user.id; // Pego do middleware 'authenticateToken'

  if (!alunoId) {
    return res.status(400).json({ error: 'O ID do aluno é obrigatório.' });
  }

  try {
    // 1. Buscar o aluno para copiar os dados
    const aluno = await prisma.aluno.findUnique({
      where: { id: parseInt(alunoId) },
    });

    if (!aluno) {
      return res.status(404).json({ error: 'Aluno não encontrado.' });
    }

    // 2. Criar a nova avaliação, copiando os dados (snapshot)
    const novaAvaliacao = await prisma.avaliacao.create({
      data: {
        alunoId: aluno.id,
        avaliadorId: avaliadorId,

        // --- Copiando dados da Anamnese ---
        objetivos: aluno.objetivos,
        historicoMedico: aluno.historicoMedico,
        medicamentosEmUso: aluno.medicamentosEmUso,
        habitos: aluno.habitos,
        observacoes: aluno.observacoes,

        // --- Copiando dados do PAR-Q ---
        parq_q1: aluno.parq_q1,
        parq_q2: aluno.parq_q2,
        parq_q3: aluno.parq_q3,
        parq_q4: aluno.parq_q4,
        parq_q5: aluno.parq_q5,
        parq_q6: aluno.parq_q6,
        parq_q7: aluno.parq_q7,
      },
    });

    // 3. Retornar a avaliação criada
    res.status(201).json(novaAvaliacao);

  } catch (error) {
    console.error('Erro ao criar avaliação:', error);
    res.status(500).json({ error: 'Não foi possível criar a avaliação.' });
  }
});


// --- ROTA GET /:id ---
// Busca UMA avaliação específica pelo seu ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const avaliacao = await prisma.avaliacao.findUnique({
      where: { id: parseInt(id) },
      include: {
        // Incluímos o nome do aluno para mostrar no título (ex: "Avaliando: Giovana")
        aluno: {
          select: { nome: true },
        },
      },
    });

    if (!avaliacao) {
      return res.status(404).json({ error: 'Avaliação não encontrada.' });
    }
    res.json(avaliacao);
  } catch (error) {
    console.error(`Erro ao buscar avaliação ${id}:`, error);
    res.status(500).json({ error: 'Não foi possível buscar a avaliação.' });
  }
});


// --- ROTA PUT /:id ---
// Salva/Atualiza os dados da avaliação
router.put('/:id', async (req, res) => {
  const { id } = req.params;

  // Pegamos todos os campos que podem ser editados do 'body'
  const {
    // Snapshot fields (Anamnese/PAR-Q)
    objetivos, historicoMedico, medicamentosEmUso, habitos, observacoes,
    parq_q1, parq_q2, parq_q3, parq_q4, parq_q5, parq_q6, parq_q7,
    
    // Assessment fields (Antropometria)
    peso, altura,
    
    // Perimetria
    circCintura, circAbdomem, circQuadril, circBracoRelaxadoD, circBracoRelaxadoE,
    
    // Dobras
    dcTriceps, dcSubescapular, dcPeitoral, dcAxilarMedia, dcSuprailiaca, dcAbdominal, dcCoxa
  } = req.body;

  // --- TRATAMENTO DE DADOS ---
  // Converte strings vazias ou inválidas para 'null'
  // e garante que números sejam salvos como Float
  const toNumberOrNull = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? null : num;
  };

  const safeData = {
    // Strings (Anamnese/PAR-Q)
    objetivos, historicoMedico, medicamentosEmUso, habitos, observacoes,
    parq_q1, parq_q2, parq_q3, parq_q4, parq_q5, parq_q6, parq_q7,
    
    // Floats (Dados da Avaliação)
    peso: toNumberOrNull(peso),
    altura: toNumberOrNull(altura),
    circCintura: toNumberOrNull(circCintura),
    circAbdomem: toNumberOrNull(circAbdomem),
    circQuadril: toNumberOrNull(circQuadril),
    circBracoRelaxadoD: toNumberOrNull(circBracoRelaxadoD),
    circBracoRelaxadoE: toNumberOrNull(circBracoRelaxadoE),
    dcTriceps: toNumberOrNull(dcTriceps),
    dcSubescapular: toNumberOrNull(dcSubescapular),
    dcPeitoral: toNumberOrNull(dcPeitoral),
    dcAxilarMedia: toNumberOrNull(dcAxilarMedia),
    dcSuprailiaca: toNumberOrNull(dcSuprailiaca),
    dcAbdominal: toNumberOrNull(dcAbdominal),
    dcCoxa: toNumberOrNull(dcCoxa)
  };

  try {
    const avaliacaoAtualizada = await prisma.avaliacao.update({
      where: { id: parseInt(id) },
      data: safeData,
    });
    res.json(avaliacaoAtualizada);
  } catch (error) {
    console.error(`Erro ao atualizar avaliação ${id}:`, error);
    res.status(500).json({ error: 'Não foi possível salvar a avaliação.' });
  }
});


module.exports = router;