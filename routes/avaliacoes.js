const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { enviarEmailComLaudoPdf } = require('../lib/laudoPdfService');

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

        // --- Copiando Antropometria inicial do Aluno (se cadastrada) ---
        peso: aluno.peso,
        altura: aluno.altura,

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
        aluno: {
          select: {
            id: true,
            nome: true,
            matricula: true,
            cpf: true,
            telefone: true,
            dataNasc: true,
            genero: true,
            email: true,
            avaliacoes: {
              orderBy: { dataAvaliacao: 'desc' },
              select: {
                id: true,
                dataAvaliacao: true,
                peso: true,
                altura: true,
                resultados: true,
              },
            },
          },
        },
        avaliador: {
          select: {
            id: true,
            name: true,
            email: true,
          },
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
    dcTriceps, dcSubescapular, dcPeitoral, dcAxilarMedia, dcSuprailiaca, dcAbdominal, dcCoxa,

    // Resultados calculados (JSON)
    resultados
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
    dcCoxa: toNumberOrNull(dcCoxa),

    // JSON com cálculos automáticos
    resultados: resultados || null,
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

// --- ROTA DELETE /:id ---
// Exclui uma avaliação física
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.avaliacao.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (error) {
    console.error(`Erro ao excluir avaliação ${id}:`, error);
    res.status(500).json({ error: 'Não foi possível excluir a avaliação.' });
  }
});

// --- ROTA POST /:id/enviar-email ---
// Gera o PDF oficial da avaliação e dispara o envio por e-mail via SMTP
router.post('/:id/enviar-email', async (req, res) => {
  const { id } = req.params;
  const { destinatario, assunto, mensagem, smtpConfig } = req.body;

  try {
    const avaliacao = await prisma.avaliacao.findUnique({
      where: { id: parseInt(id) },
      include: {
        aluno: {
          select: {
            id: true,
            nome: true,
            email: true,
            matricula: true,
            cpf: true,
            telefone: true,
            dataNasc: true,
            genero: true,
            avaliacoes: {
              orderBy: { dataAvaliacao: 'desc' },
              select: {
                id: true,
                dataAvaliacao: true,
                peso: true,
                altura: true,
                resultados: true,
              },
            },
          },
        },
        avaliador: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!avaliacao) {
      return res.status(404).json({ error: 'Avaliação não encontrada.' });
    }

    const emailDestino = (destinatario || avaliacao.aluno?.email || '').trim();
    if (!emailDestino || !emailDestino.includes('@')) {
      return res.status(400).json({ error: 'Informe um endereço de e-mail válido para o envio.' });
    }

    const infoEnvio = await enviarEmailComLaudoPdf({
      destinatario: emailDestino,
      assunto,
      mensagem,
      avaliacao,
      historicoAvaliacoes: avaliacao.aluno?.avaliacoes || [],
      smtpConfig,
    });

    const resultadosAtuais =
      avaliacao.resultados && typeof avaliacao.resultados === 'object'
        ? avaliacao.resultados
        : {};

    const registroEnvio = {
      enviadoPara: emailDestino,
      remetente: infoEnvio.remetente,
      anexoPdf: infoEnvio.filename,
      assunto: assunto || `Laudo Técnico de Avaliação Física — ${avaliacao.aluno?.nome || 'Aluno'}`,
      enviadoEm: new Date().toISOString(),
      enviadoPor: req.user?.name || avaliacao.avaliador?.name || 'Avaliador',
    };

    await prisma.avaliacao.update({
      where: { id: parseInt(id) },
      data: {
        resultados: {
          ...resultadosAtuais,
          ultimoEnvioEmail: registroEnvio,
        },
      },
    });

    res.status(200).json({
      message: `Laudo em PDF enviado com sucesso para ${emailDestino}!`,
      envio: registroEnvio,
    });
  } catch (error) {
    console.error(`Erro ao enviar relatório da avaliação ${id} por e-mail:`, error);
    if (error.code === 'SMTP_NOT_CONFIGURED') {
      return res.status(400).json({
        error: error.message.replace('SMTP_NOT_CONFIGURED: ', ''),
        code: 'SMTP_NOT_CONFIGURED',
      });
    }
    res.status(500).json({
      error: `Falha no envio SMTP: ${error.message || 'Verifique o e-mail remetente e a Senha de App configurados.'}`,
    });
  }
});

module.exports = router;