const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();
const prisma = new PrismaClient();

// Aplicar o middleware para todas as rotas deste arquivo
router.use(authenticateToken);

// GET /api/alunos - Lista alunos (oculta os excluídos logicamente)
router.get('/', async (req, res) => {
  try {
    const alunos = await prisma.aluno.findMany({
      where: {
        campusId: req.user.campusId,
        deletedAt: null // Não retorna os excluídos via soft-delete
      },
      include: {
        anamneses: {
          orderBy: { dataPreenchimento: 'desc' },
          take: 1,
          select: { status: true }
        }
      },
      orderBy: { id: 'desc' }
    });
    res.json(alunos);
  } catch (error) {
    console.error('Erro ao buscar alunos:', error);
    res.status(500).json({ error: 'Ocorreu um erro ao buscar os alunos.' });
  }
});

// GET /api/alunos/:id - Buscar um aluno específico e suas anamneses
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const aluno = await prisma.aluno.findUnique({
      where: { id: parseInt(id) },
      include: {
        anamneses: {
          orderBy: { dataPreenchimento: 'desc' },
          take: 1,
          include: {
            dadosMedicos: true,
            habitos: true,
            parq: true
          }
        }
      }
    });
    
    if (!aluno || aluno.deletedAt) return res.status(404).json({ error: 'Aluno não encontrado' });
    if (aluno.campusId !== req.user.campusId) return res.status(403).json({ error: 'Acesso negado a este aluno.' });
    
    res.json(aluno);
  } catch (error) {
    console.error('Erro ao buscar aluno:', error);
    res.status(500).json({ error: 'Erro interno ao buscar aluno.' });
  }
});

// POST /api/alunos - Criar novo aluno
router.post('/', async (req, res) => {
  try {
    const { nome, email, dataNasc, matricula, cpf, telefone, genero, observacoes, endereco, profissao, objetivo, status } = req.body;
    
    const novoAluno = await prisma.aluno.create({
      data: {
        nome,
        email,
        dataNasc: new Date(dataNasc),
        matricula,
        cpf,
        telefone,
        genero,
        observacoes,
        endereco,
        profissao,
        objetivo,
        status,
        professorId: req.user.id,
        campusId: req.user.campusId,
      }
    });

    res.status(201).json(novoAluno);
  } catch (error) {
    console.error('Erro ao criar aluno:', error);
    res.status(500).json({ error: 'Erro ao salvar aluno. Email ou Matrícula podem já existir.' });
  }
});

// PUT /api/alunos/:id - Atualizar dados do aluno (Passos Iniciais do Wizard)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, dataNasc, matricula, cpf, telefone, genero, observacoes, endereco, profissao, objetivo, status } = req.body;
    
    const existingAluno = await prisma.aluno.findUnique({ where: { id: parseInt(id) } });
    if (!existingAluno || existingAluno.campusId !== req.user.campusId) {
      return res.status(403).json({ error: 'Acesso negado ao aluno.' });
    }

    const aluno = await prisma.aluno.update({
      where: { id: parseInt(id) },
      data: {
        nome,
        email,
        dataNasc: dataNasc ? new Date(dataNasc) : undefined,
        matricula,
        cpf,
        telefone,
        genero,
        observacoes,
        endereco,
        profissao,
        objetivo,
        status
      }
    });

    res.json(aluno);
  } catch (error) {
    console.error('Erro ao atualizar aluno:', error);
    require('fs').appendFileSync('error_put_aluno.log', new Date().toISOString() + ' - ' + (error.stack || error) + '\n\n');
    res.status(500).json({ error: 'Erro interno ao atualizar aluno.' });
  }
});

// POST /api/alunos/:id/anamnese - Criar nova Anamnese (Histórico 1:N)
router.post('/:id/anamnese', async (req, res) => {
  try {
    const { id } = req.params;
    const { dadosMedicos, habitos, parq, termoAceite } = req.body;
    
    const existingAluno = await prisma.aluno.findUnique({ where: { id: parseInt(id) } });
    if (!existingAluno || existingAluno.campusId !== req.user.campusId) {
      return res.status(403).json({ error: 'Acesso negado ao aluno.' });
    }

    // Opcional: Aqui poderíamos inativar as anteriores se tivéssemos um campo 'active'
    // Mas por simplicidade, a mais recente (orderBy desc) sempre será a ativa.

    const anamnese = await prisma.anamnese.create({
      data: {
        alunoId: parseInt(id),
        status: 'COMPLETED',
        termoAceite: termoAceite,
        dadosMedicos: { create: dadosMedicos },
        habitos: { create: habitos },
        parq: { create: parq }
      }
    });

    res.status(201).json(anamnese);
  } catch (error) {
    console.error('Erro ao salvar anamnese:', error);
    res.status(500).json({ error: 'Erro interno ao processar anamnese.' });
  }
});

// DELETE /api/alunos/:id - Excluir aluno (Soft Delete - Exigência LGPD)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingAluno = await prisma.aluno.findUnique({ where: { id: parseInt(id) } });
    if (!existingAluno || existingAluno.campusId !== req.user.campusId) {
      return res.status(403).json({ error: 'Acesso negado ao aluno.' });
    }

    // Soft Delete: Atualiza o campo deletedAt em vez de apagar do banco
    await prisma.aluno.update({
      where: { id: parseInt(id) },
      data: { deletedAt: new Date() }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir aluno:', error);
    res.status(500).json({ error: 'Ocorreu um erro ao excluir o aluno.' });
  }
});

module.exports = router;