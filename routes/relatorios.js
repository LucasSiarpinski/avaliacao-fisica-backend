const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const nodemailer = require('nodemailer');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.use(authenticateToken);

// GET /api/relatorios/templates
// Retorna os modelos de mensagens (se não existir, faz um seed inicial por campus)
router.get('/templates', async (req, res) => {
  try {
    const campusId = req.user.campusId;
    let templates = await prisma.messageTemplate.findMany({ where: { campusId } });

    // Seed automático e inteligente para TCC
    if (templates.length === 0) {
      const defaultTemplates = [
        {
          title: 'Aviso Padrão',
          body: 'Olá [NOME_ALUNO],\n\nSua avaliação física realizada em [DATA_AVALIACAO] já está disponível no sistema.\n\nAcesse o seu laudo oficial validado pelo avaliador [NOME_AVALIADOR] através do link seguro abaixo:\n[LINK_DO_PDF]\n\nAbraços,\nEquipe de Saúde Universitária',
          campusId
        },
        {
          title: 'Avaliação Concluída (Curto)',
          body: 'Parabéns [NOME_ALUNO]! Sua avaliação de [DATA_AVALIACAO] foi finalizada.\n\nAcesse seus resultados aqui: [LINK_DO_PDF]',
          campusId
        },
        {
          title: 'Reavaliação Necessária',
          body: 'Olá [NOME_ALUNO],\n\nVerificamos os resultados da sua última avaliação de [DATA_AVALIACAO] e precisamos agendar um retorno brevemente.\n\nConfira seu último laudo clínico: [LINK_DO_PDF]\n\nAtenciosamente,\n[NOME_AVALIADOR]',
          campusId
        }
      ];
      await prisma.messageTemplate.createMany({ data: defaultTemplates });
      templates = await prisma.messageTemplate.findMany({ where: { campusId } });
    }

    res.status(200).json(templates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar templates.' });
  }
});

// Helper para substituição de variáveis pelo Backend
const processMessageVariables = (text, aluno, avaliacao, avaliador) => {
  if (!text) return '';
  const dataFormatada = new Date(avaliacao.data).toLocaleDateString('pt-BR');
  const linkPdf = `http://localhost:3000/avaliacoes/${avaliacao.id}/relatorio`; // Link simulado

  return text
    .replace(/\[NOME_ALUNO\]/g, aluno.nome || '')
    .replace(/\[DATA_AVALIACAO\]/g, dataFormatada)
    .replace(/\[NOME_AVALIADOR\]/g, avaliador.name || '')
    .replace(/\[LINK_DO_PDF\]/g, linkPdf);
};

// POST /api/relatorios/send-email
router.post('/send-email', async (req, res) => {
  const { emailDestino, rawMessage, avaliacaoId } = req.body;

  try {
    // 1. Busca Segura (Isolamento de Campus e Dados)
    const avaliacao = await prisma.avaliacao.findUnique({
      where: { id: parseInt(avaliacaoId) },
      include: { aluno: true }
    });

    if (!avaliacao || avaliacao.aluno.campusId !== req.user.campusId) {
      return res.status(403).json({ error: 'Acesso negado ou avaliação inexistente.' });
    }

    const avaliador = req.user; // Quem dispara é o usuário logado

    // 2. Substituição Automática de Variáveis
    const finalMessage = processMessageVariables(rawMessage, avaliacao.aluno, avaliacao, avaliador);

    let previewUrl = null;

    try {
      let transporter;

      if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT) || 587,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
      } else {
        // Ethereal Dinâmico para apresentação de TCC
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
      }

      const info = await transporter.sendMail({
        from: `"Sistema de Avaliação Institucional" <${process.env.SMTP_USER || 'no-reply@unoesc.br'}>`,
        to: emailDestino,
        subject: "Seu Laudo de Avaliação Física Universitária",
        text: finalMessage,
      });

      previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log("URL de Preview do E-mail:", previewUrl);
      }
    } catch (smtpErr) {
      console.error("Erro no envio SMTP:", smtpErr);
      return res.status(500).json({ error: 'Erro ao conectar com servidor de e-mail.' });
    }

    res.status(200).json({
      success: true,
      message: 'Relatório disparado com sucesso!',
      mensagemProcessada: finalMessage,
      previewUrl: previewUrl || null
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Falha ao processar e enviar relatório' });
  }
});

// POST /api/relatorios/process-text (Para preview do WhatsApp no Frontend)
router.post('/process-text', async (req, res) => {
  const { rawMessage, avaliacaoId } = req.body;

  try {
    const avaliacao = await prisma.avaliacao.findUnique({
      where: { id: parseInt(avaliacaoId) },
      include: { aluno: true }
    });
    if (!avaliacao || avaliacao.aluno.campusId !== req.user.campusId) return res.status(403).json({ error: 'Denied' });

    const finalMessage = processMessageVariables(rawMessage, avaliacao.aluno, avaliacao, req.user);
    res.json({ finalMessage });
  } catch (err) {
    res.status(500).json({ error: 'Error' });
  }
});

module.exports = router;
