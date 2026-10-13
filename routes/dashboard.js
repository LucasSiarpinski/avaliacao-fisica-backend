const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/dashboard
router.get('/', authenticateToken, async (req, res) => {
  try {
    const isProfessor = req.user.role === 'PROFESSOR';
    const userId = req.user.id;

    // Filtros de acordo com o papel do usuário (ADMIN vê tudo, PROFESSOR vê os seus)
    const alunoWhere = isProfessor ? { professorId: userId } : {};
    const avaliacaoWhere = isProfessor ? { aluno: { professorId: userId } } : {};

    // 1. Contagens de Alunos
    const [totalAlunos, alunosAtivos] = await Promise.all([
      prisma.aluno.count({ where: alunoWhere }),
      prisma.aluno.count({ where: { ...alunoWhere, status: 'ATIVO' } }),
    ]);

    // 2. Contagens de Avaliações
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const [avaliacoesHoje, totalAvaliacoes, avaliacoesConcluidas, anamnesesPendentes] = await Promise.all([
      prisma.avaliacao.count({
        where: {
          ...avaliacaoWhere,
          dataAvaliacao: {
            gte: startOfToday,
            lte: endOfToday,
          },
        },
      }),
      prisma.avaliacao.count({
        where: avaliacaoWhere,
      }),
      prisma.avaliacao.count({
        where: {
          ...avaliacaoWhere,
          peso: { not: null },
          altura: { not: null },
        },
      }),
      prisma.aluno.count({
        where: {
          ...alunoWhere,
          anamneseStatus: 'PENDING',
        },
      }),
    ]);

    const avaliacoesEmAndamento = totalAvaliacoes - avaliacoesConcluidas;

    // 3. Atividades Recentes
    const [recentAvaliacoes, recentAlunos] = await Promise.all([
      prisma.avaliacao.findMany({
        where: avaliacaoWhere,
        take: 5,
        orderBy: { dataAvaliacao: 'desc' },
        include: {
          aluno: {
            select: { id: true, nome: true, matricula: true },
          },
        },
      }),
      prisma.aluno.findMany({
        where: alunoWhere,
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          nome: true,
          status: true,
          createdAt: true,
          matricula: true,
        },
      }),
    ]);

    // Combina e formata
    const activityItems = [
      ...recentAvaliacoes.map((av) => {
        const isCompleted = Boolean(av.peso && av.altura);
        return {
          id: `av-${av.id}`,
          targetId: av.id,
          type: 'Avaliação',
          student: av.aluno?.nome || 'Aluno não informado',
          studentId: av.aluno?.id,
          date: av.dataAvaliacao,
          status: isCompleted ? 'completed' : 'pending',
          statusLabel: isCompleted ? 'Concluída' : 'Em Andamento',
          link: `/avaliacoes/${av.id}`,
        };
      }),
      ...recentAlunos.map((al) => ({
        id: `al-${al.id}`,
        targetId: al.id,
        type: 'Novo Aluno',
        student: al.nome,
        studentId: al.id,
        date: al.createdAt,
        status: al.status === 'ATIVO' ? 'active' : 'inactive',
        statusLabel: al.status === 'ATIVO' ? 'Ativo' : 'Inativo',
        link: `/alunos/${al.id}`,
      })),
    ];

    activityItems.sort((a, b) => new Date(b.date) - new Date(a.date));
    const recentActivity = activityItems.slice(0, 6);

    res.json({
      stats: {
        totalAlunos,
        alunosAtivos,
        avaliacoesHoje,
        totalAvaliacoes,
        avaliacoesConcluidas,
        avaliacoesEmAndamento,
        anamnesesPendentes,
      },
      recentActivity,
    });
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    res.status(500).json({ error: 'Não foi possível carregar os dados do dashboard.' });
  }
});

module.exports = router;
