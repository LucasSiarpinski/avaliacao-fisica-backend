const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middlewares/authMiddleware');
const prisma = new PrismaClient();

router.use(authenticateToken);

// POST /api/avaliacoes - Criar nova avaliação
router.post('/', async (req, res) => {
  try {
    const { alunoId, tipo, resultados } = req.body;

    if (!alunoId) {
      return res.status(400).json({ error: 'alunoId é obrigatório' });
    }

    const existingAluno = await prisma.aluno.findUnique({ where: { id: parseInt(alunoId) } });
    if (!existingAluno || existingAluno.campusId !== req.user.campusId) {
      return res.status(403).json({ error: 'Acesso negado ao aluno.' });
    }

    const avaliacao = await prisma.avaliacao.create({
      data: {
        alunoId: parseInt(alunoId),
        tipo: tipo || 'COMPLETA',
        resultados: resultados || {}
      }
    });

    res.status(201).json(avaliacao);
  } catch (error) {
    console.error('Erro ao salvar avaliação:', error);
    res.status(500).json({ error: 'Erro interno ao salvar avaliação.' });
  }
});

// GET /api/avaliacoes/aluno/:id - Listar avaliações de um aluno
router.get('/aluno/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingAluno = await prisma.aluno.findUnique({ where: { id: parseInt(id) } });
    if (!existingAluno || existingAluno.campusId !== req.user.campusId) {
      return res.status(403).json({ error: 'Acesso negado ao aluno.' });
    }

    const avaliacoes = await prisma.avaliacao.findMany({
      where: { 
        alunoId: parseInt(id),
        deletedAt: null
      },
      orderBy: { data: 'desc' }
    });
    
    res.json(avaliacoes);
  } catch (error) {
    console.error('Erro ao buscar avaliações do aluno:', error);
    res.status(500).json({ error: 'Erro ao buscar avaliações.' });
  }
});

// GET /api/avaliacoes - Listar TODAS as avaliações (com filtros)
router.get('/', async (req, res) => {
  try {
    const { aluno, data, campus } = req.query;
    
    // Construção de filtros baseada nos parâmetros
    const whereClause = { deletedAt: null, aluno: { campusId: req.user.campusId } };
    if (aluno) {
      whereClause.aluno.nome = { contains: aluno, mode: 'insensitive' };
    }
    if (campus) {
      whereClause.aluno = {
        ...whereClause.aluno,
        campus: { name: { contains: campus, mode: 'insensitive' } }
      };
    }
    if (data) {
      // Simplificado: filtra por uma data exata ou parcial, adaptado se necessário
      // Aqui vamos retornar tudo se não houver lógica complexa de data implementada
      const startDate = new Date(data);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(data);
      endDate.setHours(23, 59, 59, 999);
      whereClause.data = {
        gte: startDate,
        lte: endDate
      };
    }

    const avaliacoes = await prisma.avaliacao.findMany({
      where: whereClause,
      include: {
        aluno: {
          select: { nome: true, email: true, telefone: true, campus: { select: { name: true } } }
        }
      },
      orderBy: { data: 'desc' }
    });
    
    res.json(avaliacoes);
  } catch (error) {
    console.error('Erro ao buscar todas as avaliações:', error);
    res.status(500).json({ error: 'Erro ao buscar avaliações.' });
  }
});

// GET /api/avaliacoes/:id - Buscar detalhes de uma avaliação específica
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const avaliacao = await prisma.avaliacao.findUnique({
      where: { id: parseInt(id) },
      include: {
        aluno: {
          select: {
            nome: true,
            email: true,
            dataNasc: true,
            genero: true,
            cpf: true,
            telefone: true,
            endereco: true,
            matricula: true,
            observacoes: true,
            campusId: true,
            campus: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    if (!avaliacao || avaliacao.deletedAt) {
      return res.status(404).json({ error: 'Avaliação não encontrada' });
    }
    
    if (avaliacao.aluno.campusId !== req.user.campusId) {
      return res.status(403).json({ error: 'Acesso negado.' });
    }

    res.json(avaliacao);
  } catch (error) {
    console.error('Erro ao buscar avaliação:', error);
    res.status(500).json({ error: 'Erro interno ao buscar avaliação.' });
  }
});

// DELETE /api/avaliacoes/:id - Exclusão lógica (Soft Delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const avaliacao = await prisma.avaliacao.findUnique({ where: { id: parseInt(id) }, include: { aluno: true } });
    if (!avaliacao || avaliacao.aluno.campusId !== req.user.campusId) {
      return res.status(403).json({ error: 'Acesso negado.' });
    }

    // Altera o tipo para DELETADA, ocultando a avaliação do sistema sem removê-la do BD
    await prisma.avaliacao.update({
      where: { id: parseInt(id) },
      data: { deletedAt: new Date() }
    });

    res.json({ message: 'Avaliação excluída com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir avaliação:', error);
    res.status(500).json({ error: 'Erro ao excluir avaliação.' });
  }
});

module.exports = router;
