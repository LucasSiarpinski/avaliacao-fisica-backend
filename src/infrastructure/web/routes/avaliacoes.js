const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { authenticateToken } = require('../middlewares/authMiddleware');
router.use(authenticateToken); 

// --- FUNÇÃO HELPER: Converte para número ou null ---
const toNumberOrNull = (value) => {
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
};

// --- ROTA GET / --- (Para a Grid)
router.get('/', async (req, res) => {
  try {
    const avaliacoes = await prisma.avaliacao.findMany({
      orderBy: { dataAvaliacao: 'desc' },
      include: {
        aluno: { 
          select: { 
            nome: true, 
            matricula: true 
          } 
        },
        avaliador: { 
          select: { 
            name: true 
          } 
        },
      },
    });
    res.json(avaliacoes);
  } catch (error) {
    console.error('Erro ao buscar avaliações:', error);
    res.status(500).json({ error: 'Não foi possível buscar as avaliações.' });
  }
});

// --- ROTA POST / --- (Para Criar)
router.post('/', async (req, res) => {
  console.log("===================================");
  console.log("CONTEÚDO DO REQ.USER:", req.user); // Para o bug do "Avaliador"
  console.log("===================================");

  const { alunoId } = req.body;
  const avaliadorId = req.user.id; 

  if (!alunoId) {
    return res.status(400).json({ error: 'O ID do aluno é obrigatório.' });
  }

  try {
    const aluno = await prisma.aluno.findUnique({
      where: { id: parseInt(alunoId) },
    });
    if (!aluno) {
      return res.status(404).json({ error: 'Aluno não encontrado.' });
    }

    // Cria a avaliação copiando os dados (schema simples)
    const novaAvaliacao = await prisma.avaliacao.create({
      data: {
        alunoId: aluno.id,
        avaliadorId: avaliadorId,
        objetivos: aluno.objetivos,
        historicoMedico: aluno.historicoMedico,
        medicamentosEmUso: aluno.medicamentosEmUso,
        habitos: aluno.habitos,
        observacoes: aluno.observacoes,
        parq_q1: aluno.parq_q1,
        parq_q2: aluno.parq_q2,
        parq_q3: aluno.parq_q3,
        parq_q4: aluno.parq_q4,
        parq_q5: aluno.parq_q5,
        parq_q6: aluno.parq_q6,
        parq_q7: aluno.parq_q7,
        
        peso: aluno.peso, 
        altura: aluno.altura 
      },
    });

    res.status(201).json(novaAvaliacao);

  } catch (error) {
    console.error('Erro ao criar avaliação:', error);
    res.status(500).json({ error: 'Não foi possível criar a avaliação.' });
  }
});

// --- ROTA GET /:id --- (Para Carregar o Formulário)
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const avaliacao = await prisma.avaliacao.findUnique({
      where: { id: parseInt(id) },
      include: {
        aluno: { 
          select: { 
            nome: true, 
            dataNasc: true 
          } 
        },
        // ADICIONE ISTO:
        avaliador: {
          select: {
            name: true, // Para mostrar o nome na tela
            id: true
          }
        }
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

// --- ROTA PUT /:id --- (Para Salvar o Formulário)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  
  const {
    objetivos, historicoMedico, medicamentosEmUso, habitos, observacoes,
    parq_q1, parq_q2, parq_q3, parq_q4, parq_q5, parq_q6, parq_q7,
    peso, altura,
    circCintura, circAbdomem, circQuadril, circBracoRelaxadoD, circBracoRelaxadoE,
    dcTriceps, dcSubescapular, dcPeitoral, dcAxilarMedia, dcSuprailiaca,
    dcAbdominal, dcCoxa
  } = req.body;

  try {
    // ESTE É O CÓDIGO CORRETO: Salva 'peso', 'altura', etc. direto na 'Avaliacao'
    const avaliacaoAtualizada = await prisma.avaliacao.update({
      where: { id: parseInt(id) },
      data: {
        objetivos, historicoMedico, medicamentosEmUso, habitos, observacoes,
        parq_q1, parq_q2, parq_q3, parq_q4, parq_q5, parq_q6, parq_q7,
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
      },
      include: { 
        aluno: { 
          select: { 
            nome: true, 
            dataNasc: true 
          } 
        },
      },
    });
    res.json(avaliacaoAtualizada);
  } catch (error) {
    console.error(`Erro ao atualizar avaliação ${id}:`, error);
    res.status(500).json({ error: 'Não foi possível salvar a avaliação.' });
  }
});

module.exports = router;