const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticateToken);

router.get('/kpis', async (req, res) => {
  try {
    const { campusId } = req.user;
    
    // Datas base
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // 1. Alunos Ativos
    const ativos = await prisma.aluno.count({
      where: { campusId, status: 'ATIVO', deletedAt: null }
    });

    // 2. Novos no Mês
    const novosMes = await prisma.aluno.count({
      where: { campusId, deletedAt: null, createdAt: { gte: startOfMonth } }
    });

    // 3. Avaliações no Mês
    const avaliacoesMes = await prisma.avaliacao.count({
      where: { aluno: { campusId }, data: { gte: startOfMonth } }
    });

    // 6. Avaliações Hoje
    const avaliacoesHoje = await prisma.avaliacao.count({
      where: { aluno: { campusId }, data: { gte: startOfDay, lte: endOfDay } }
    });

    // Buscar alunos para calcular risco e anamneses pendentes
    const alunos = await prisma.aluno.findMany({
      where: { campusId, deletedAt: null },
      select: {
        id: true,
        anamneses: {
          orderBy: { dataPreenchimento: 'desc' },
          take: 1,
          select: {
            status: true,
            parq: true,
            dadosMedicos: true
          }
        }
      }
    });

    let riscoMedico = 0;
    let anamnesesPendentes = 0;

    alunos.forEach(aluno => {
      if (!aluno.anamneses || aluno.anamneses.length === 0) {
        anamnesesPendentes++;
      } else {
        const ultimaAnamnese = aluno.anamneses[0];
        if (ultimaAnamnese.status === 'PENDING') {
          anamnesesPendentes++;
        }

        let temRisco = false;
        
        // Checar Par-Q
        const parq = ultimaAnamnese.parq;
        if (parq && (parq.pergunta1 || parq.pergunta2 || parq.pergunta3 || parq.pergunta4 || parq.pergunta5 || parq.pergunta6 || parq.pergunta7)) {
          temRisco = true;
        }

        // Checar Dados Médicos
        const dadosMedicos = ultimaAnamnese.dadosMedicos;
        if (dadosMedicos && (dadosMedicos.hipertensao || dadosMedicos.diabetes || dadosMedicos.problemaCardiaco || dadosMedicos.restricoes)) {
          temRisco = true;
        }

        if (temRisco) riscoMedico++;
      }
    });

    res.json({
      ativos,
      novosMes,
      avaliacoesMes,
      riscoMedico,
      anamnesesPendentes,
      avaliacoesHoje
    });

  } catch (error) {
    console.error('Erro ao calcular KPIs:', error);
    res.status(500).json({ error: 'Erro interno ao calcular KPIs.' });
  }
});

module.exports = router;
