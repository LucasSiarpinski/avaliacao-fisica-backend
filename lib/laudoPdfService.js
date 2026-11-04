const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');

function maskCPF(cpf) {
  if (!cpf) return 'Não informado';
  const digits = String(cpf).replace(/\D/g, '');
  if (digits.length !== 11) return cpf;
  return `${digits.slice(0, 3)}.***.***-${digits.slice(9, 11)}`;
}

function maskPhone(phone) {
  if (!phone) return 'Não informado';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

function calcularIdadeValida(dataNasc) {
  if (!dataNasc) return null;
  const hoje = new Date();
  const nasc = new Date(dataNasc);
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) {
    idade--;
  }
  if (isNaN(idade) || idade < 5 || idade > 120) return null;
  return idade;
}

/**
 * Gera um Buffer contendo o PDF oficial da Avaliação Física (9 seções validadas)
 */
function gerarPdfLaudoBuffer(avaliacao, historicoAvaliacoes = []) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const aluno = avaliacao.aluno || {};
      const avaliador = avaliacao.avaliador || {};
      const res = avaliacao.resultados || {};
      const imc = res.imc || null;
      const rcq = res.rcq || null;
      const comp = res.composicao || {};
      const tf = res.testesFisicos || {};

      const idade = calcularIdadeValida(aluno.dataNasc);
      const generoLabel = String(aluno.genero || 'M').toUpperCase().startsWith('F')
        ? 'Feminino'
        : 'Masculino';

      const dataColeta = avaliacao.dataAvaliacao
        ? new Date(avaliacao.dataAvaliacao).toLocaleDateString('pt-BR')
        : new Date().toLocaleDateString('pt-BR');
      const dataEmissao = new Date().toLocaleDateString('pt-BR');

      const drawSectionTitle = (title) => {
        doc.moveDown(0.5);
        doc
          .font('Helvetica-Bold')
          .fontSize(10)
          .fillColor('#1b5e20')
          .text(title.toUpperCase());
        doc
          .moveTo(40, doc.y + 2)
          .lineTo(555, doc.y + 2)
          .strokeColor('#2e7d32')
          .lineWidth(1)
          .stroke();
        doc.moveDown(0.4);
        doc.fillColor('#1e293b').font('Helvetica').fontSize(9);
      };

      // --- CABEÇALHO DO RELATÓRIO ---
      doc
        .font('Helvetica-Bold')
        .fontSize(13)
        .fillColor('#1b5e20')
        .text('UNOESC — UNIVERSIDADE DO OESTE DE SANTA CATARINA', { align: 'left' });
      doc
        .font('Helvetica')
        .fontSize(8.5)
        .fillColor('#475569')
        .text('UNOESC Portal — Sistema de Avaliação Física e Cineantropometria');
      doc
        .font('Helvetica-Bold')
        .fontSize(9)
        .fillColor('#2e7d32')
        .text(
          `Laudo Técnico Nº #${avaliacao.id}   |   Data da coleta: ${dataColeta}   |   Data de emissão: ${dataEmissao}`
        );

      doc.moveDown(0.4);
      doc
        .font('Helvetica-Bold')
        .fontSize(11.5)
        .fillColor('#0f172a')
        .text('LAUDO TÉCNICO DE AVALIAÇÃO FÍSICA', { align: 'center' });
      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor('#475569')
        .text('Avaliação Física e Composição Corporal', { align: 'center' });
      doc.moveDown(0.3);

      // --- 1. DADOS DE IDENTIFICAÇÃO DO AVALIADO ---
      drawSectionTitle('1. Dados de Identificação do Avaliado');
      doc
        .font('Helvetica-Bold')
        .text('Nome: ', { continued: true })
        .font('Helvetica')
        .text(`${aluno.nome || '---'}    `, { continued: true })
        .font('Helvetica-Bold')
        .text('Matrícula: ', { continued: true })
        .font('Helvetica')
        .text(`${aluno.matricula || '---'}`);
      doc
        .font('Helvetica-Bold')
        .text('Idade: ', { continued: true })
        .font('Helvetica')
        .text(`${idade ? `${idade} anos` : 'Não informada'}    `, { continued: true })
        .font('Helvetica-Bold')
        .text('Gênero: ', { continued: true })
        .font('Helvetica')
        .text(`${generoLabel}    `, { continued: true })
        .font('Helvetica-Bold')
        .text('CPF: ', { continued: true })
        .font('Helvetica')
        .text(`${maskCPF(aluno.cpf)}    `, { continued: true })
        .font('Helvetica-Bold')
        .text('Telefone: ', { continued: true })
        .font('Helvetica')
        .text(`${maskPhone(aluno.telefone)}`);
      doc
        .font('Helvetica-Bold')
        .text('Avaliador Responsável: ', { continued: true })
        .font('Helvetica')
        .text(`${avaliador.name || 'Professor Avaliador'}`);

      // --- 2. TRIAGEM PREVENTIVA — QUESTIONÁRIO PAR-Q ---
      drawSectionTitle('2. Triagem Preventiva — Questionário PAR-Q');
      const parqKeys = ['parq_q1', 'parq_q2', 'parq_q3', 'parq_q4', 'parq_q5', 'parq_q6', 'parq_q7'];
      const respondidas = parqKeys.filter(
        (k) => avaliacao[k] === 'SIM' || avaliacao[k] === 'NAO'
      ).length;
      const afirmativas = parqKeys.filter((k) => avaliacao[k] === 'SIM').length;
      const statusParq =
        respondidas === 7
          ? 'Questionário respondido'
          : respondidas > 0
            ? 'Respondido parcialmente'
            : 'Não respondido';
      const resultadoParq =
        afirmativas > 0
          ? 'Alerta identificado na triagem preventiva'
          : respondidas === 7
            ? 'Sem indicação de alerta na triagem preventiva'
            : 'Triagem preventiva pendente';

      doc
        .font('Helvetica-Bold')
        .text('Status: ', { continued: true })
        .font('Helvetica')
        .text(`${statusParq}   |   `, { continued: true })
        .font('Helvetica-Bold')
        .text('Questões respondidas: ', { continued: true })
        .font('Helvetica')
        .text(`${respondidas} de 7   |   `, { continued: true })
        .font('Helvetica-Bold')
        .text('Respostas afirmativas: ', { continued: true })
        .font('Helvetica')
        .text(afirmativas > 0 ? `${afirmativas} ("Sim")` : 'Nenhuma');
      doc
        .font('Helvetica-Bold')
        .text('Resultado: ', { continued: true })
        .font('Helvetica')
        .text(resultadoParq);

      if (afirmativas > 0) {
        doc
          .font('Helvetica-Bold')
          .fillColor('#b91c1c')
          .text(
            'Atenção: foi identificada resposta afirmativa no PAR-Q. Recomenda-se avaliação de profissional de saúde antes da realização de atividades físicas intensas.'
          )
          .fillColor('#1e293b')
          .font('Helvetica');
      }

      // --- 3. ANAMNESE E HISTÓRICO DE SAÚDE ---
      drawSectionTitle('3. Anamnese e Histórico de Saúde');
      doc
        .font('Helvetica-Bold')
        .text('Histórico de doenças / médico: ', { continued: true })
        .font('Helvetica')
        .text(avaliacao.historicoMedico || 'Não informado');
      doc
        .font('Helvetica-Bold')
        .text('Uso de medicamentos: ', { continued: true })
        .font('Helvetica')
        .text(avaliacao.medicamentosEmUso || 'Não informado');
      doc
        .font('Helvetica-Bold')
        .text('Objetivos / Lesões ou limitações: ', { continued: true })
        .font('Helvetica')
        .text(avaliacao.objetivos || 'Não informado');
      doc
        .font('Helvetica-Bold')
        .text('Prática de exercícios e hábitos relevantes: ', { continued: true })
        .font('Helvetica')
        .text(avaliacao.habitos || 'Não informado');

      // --- 4. RESUMO DA COMPOSIÇÃO CORPORAL ---
      drawSectionTitle('4. Resumo da Composição Corporal');
      doc
        .font('Helvetica-Bold')
        .text('Estatura: ', { continued: true })
        .font('Helvetica')
        .text(`${avaliacao.altura ? `${avaliacao.altura} cm` : '--'}   |   `, { continued: true })
        .font('Helvetica-Bold')
        .text('Massa corporal: ', { continued: true })
        .font('Helvetica')
        .text(`${avaliacao.peso ? `${avaliacao.peso} kg` : '--'}   |   `, { continued: true })
        .font('Helvetica-Bold')
        .text('IMC: ', { continued: true })
        .font('Helvetica')
        .text(`${imc ? `${imc.valor} kg/m² (${imc.classificacao})` : '--'}`);
      doc
        .font('Helvetica-Bold')
        .text('Relação cintura-quadril (RCQ): ', { continued: true })
        .font('Helvetica')
        .text(`${rcq ? `${rcq.valor} (${rcq.risco})` : '--'}   |   `, { continued: true })
        .font('Helvetica-Bold')
        .text('Percentual de gordura: ', { continued: true })
        .font('Helvetica')
        .text(
          `${comp.percGordura ? `${comp.percGordura}% (${comp.classificacaoGordura || ''})` : '--'}`
        );
      doc
        .font('Helvetica-Bold')
        .text('Massa livre de gordura: ', { continued: true })
        .font('Helvetica')
        .text(`${comp.massaMagra ? `${comp.massaMagra} kg` : '--'}   |   `, { continued: true })
        .font('Helvetica-Bold')
        .text('Massa gorda: ', { continued: true })
        .font('Helvetica')
        .text(`${comp.massaGorda ? `${comp.massaGorda} kg` : '--'}   |   `, { continued: true })
        .font('Helvetica-Bold')
        .text('Densidade corporal: ', { continued: true })
        .font('Helvetica')
        .text(`${comp.densidadeCorporal ? `${comp.densidadeCorporal} g/cm³` : '--'}`);
      doc
        .font('Helvetica-Bold')
        .text('Protocolo: ', { continued: true })
        .font('Helvetica')
        .text('Jackson & Pollock — 7 dobras cutâneas   |   ', { continued: true })
        .font('Helvetica-Bold')
        .text('Equação utilizada: ', { continued: true })
        .font('Helvetica')
        .text('Siri (1961)');

      // --- 5. PERIMETRIA E CIRCUNFERÊNCIAS CORPORAIS (cm) ---
      drawSectionTitle('5. Perimetria e Circunferências Corporais (cm)');
      doc.text(
        `Cintura: ${avaliacao.circCintura ? `${avaliacao.circCintura} cm` : '--'}   |   Abdômen: ${avaliacao.circAbdomem ? `${avaliacao.circAbdomem} cm` : '--'}   |   Quadril: ${avaliacao.circQuadril ? `${avaliacao.circQuadril} cm` : '--'}`
      );
      doc.text(
        `Braço relaxado direito: ${avaliacao.circBracoRelaxadoD ? `${avaliacao.circBracoRelaxadoD} cm` : '--'}   |   Braço relaxado esquerdo: ${avaliacao.circBracoRelaxadoE ? `${avaliacao.circBracoRelaxadoE} cm` : '--'}`
      );

      // --- 6. DOBRAS CUTÂNEAS (mm) — PROTOCOLO DE JACKSON & POLLOCK ---
      drawSectionTitle('6. Dobras Cutâneas (mm) — Protocolo de Jackson & Pollock');
      doc
        .font('Helvetica-Oblique')
        .fontSize(8.5)
        .text('Jackson & Pollock — protocolo de 7 dobras cutâneas')
        .font('Helvetica')
        .fontSize(9);
      doc.text(
        `Tríceps: ${avaliacao.dcTriceps ?? '--'} mm  |  Subescapular: ${avaliacao.dcSubescapular ?? '--'} mm  |  Peitoral torácica: ${avaliacao.dcPeitoral ?? '--'} mm  |  Axilar média: ${avaliacao.dcAxilarMedia ?? '--'} mm`
      );
      doc.text(
        `Supra-ilíaca: ${avaliacao.dcSuprailiaca ?? '--'} mm  |  Abdominal: ${avaliacao.dcAbdominal ?? '--'} mm  |  Coxa medial: ${avaliacao.dcCoxa ?? '--'} mm  |  Somatório das 7 dobras: ${comp.somaDobras ? `${comp.somaDobras} mm` : '--'}`
      );

      // --- 7. TESTES FÍSICOS NEUROMOTORES ---
      drawSectionTitle('7. Testes Físicos Neuromotores');
      doc.text(
        `• Resistência abdominal — 1 minuto: ${tf.abdominal ? `${tf.abdominal.repeticoes} repetições  |  Classificação: ${tf.abdominal.classificacao}  |  Pontuação: ${tf.abdominal.pontuacao} pontos` : 'Não avaliado'}`
      );
      doc.text(
        `• Força de preensão manual — dinamometria: ${tf.preensao ? `D: ${tf.preensao.direita ?? '--'} kgf / E: ${tf.preensao.esquerda ?? '--'} kgf  |  Classificação: ${tf.preensao.classificacao}  |  Pontuação: ${tf.preensao.pontuacao} pontos` : 'Não avaliado'}`
      );

      // --- 8. HISTÓRICO E EVOLUÇÃO DAS AVALIAÇÕES ---
      drawSectionTitle('8. Histórico e Evolução das Avaliações');
      const avaliacoesConcluidas = (historicoAvaliacoes || []).filter(
        (a) => a.peso && a.altura
      );
      if (avaliacoesConcluidas.length <= 1) {
        doc.text(
          'Este é o primeiro registro do avaliado. Ainda não existem avaliações anteriores para comparação.'
        );
      } else {
        avaliacoesConcluidas.slice(0, 5).forEach((item) => {
          const dt = new Date(item.dataAvaliacao).toLocaleDateString('pt-BR');
          const imcVal = item.resultados?.imc?.valor ?? '--';
          const fatVal = item.resultados?.composicao?.percGordura
            ? `${item.resultados.composicao.percGordura}%`
            : '--';
          const leanVal = item.resultados?.composicao?.massaMagra
            ? `${item.resultados.composicao.massaMagra} kg`
            : '--';
          doc.text(
            `Data: ${dt}   |   Massa corporal: ${item.peso} kg   |   IMC: ${imcVal}   |   Gordura corporal: ${fatVal}   |   Massa livre de gordura: ${leanVal}`
          );
        });
      }

      // --- 9. PARECER TÉCNICO E ORIENTAÇÕES DO AVALIADOR ---
      drawSectionTitle('9. Parecer Técnico e Orientações do Avaliador');
      const textoPadrao =
        'Os dados foram coletados conforme os protocolos disponíveis no sistema. Recomenda-se o acompanhamento periódico da composição corporal e a realização de nova avaliação conforme o planejamento da academia.';
      doc.text(avaliacao.observacoes || textoPadrao);
      if (afirmativas > 0) {
        doc
          .moveDown(0.2)
          .font('Helvetica-Oblique')
          .text(
            'Nota preventiva (PAR-Q): Foi registrada resposta afirmativa na triagem preventiva. Orienta-se avaliação clínica antes de exercícios de alta intensidade.'
          )
          .font('Helvetica');
      }

      // --- ASSINATURAS ---
      doc.moveDown(1.4);
      doc
        .font('Helvetica-Bold')
        .text(`Avaliador responsável: ${avaliador.name || 'Profissional Avaliador'}`, {
          continued: true,
        })
        .text('          Assinatura do avaliado: ___________________________');
      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor('#64748b')
        .text(
          `Profissional de Educação Física / Avaliador   |   Código de validação: UNOESC-LAUDO-${avaliacao.id}`
        );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Envia o e-mail com o PDF do Laudo anexado via SMTP (configurado por requisição ou via .env)
 */
async function enviarEmailComLaudoPdf({
  destinatario,
  assunto,
  mensagem,
  avaliacao,
  historicoAvaliacoes,
  smtpConfig,
}) {
  const pdfBuffer = await gerarPdfLaudoBuffer(avaliacao, historicoAvaliacoes);

  const host = (smtpConfig?.host || process.env.SMTP_HOST || 'smtp.gmail.com').trim();
  const port = parseInt(smtpConfig?.port || process.env.SMTP_PORT || '587', 10);
  const user = (
    smtpConfig?.user ||
    process.env.SMTP_USER ||
    'lucasmiottosiarpinski@gmail.com'
  ).trim();
  const pass = (
    smtpConfig?.pass ||
    process.env.SMTP_PASS ||
    'mzwokcnwzlamygbf'
  ).replace(/\s+/g, '');

  if (!user || !pass) {
    const err = new Error(
      'SMTP_NOT_CONFIGURED: E-mail remetente (SMTP) ainda não configurado. Clique em "Configurar E-mail Remetente (SMTP)" no modal ou acesse Configurações.'
    );
    err.code = 'SMTP_NOT_CONFIGURED';
    throw err;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  const nomeAluno = (avaliacao.aluno?.nome || 'Aluno').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `Laudo_Avaliacao_Fisica_${nomeAluno}_#${avaliacao.id}.pdf`;

  const info = await transporter.sendMail({
    from: `"UNOESC Avaliação Física" <${user}>`,
    to: destinatario,
    subject: assunto || `Laudo Técnico de Avaliação Física — ${avaliacao.aluno?.nome || 'Aluno'}`,
    text:
      mensagem ||
      `Olá, ${avaliacao.aluno?.nome || 'Aluno'}!\n\nSegue em anexo o seu Laudo Técnico de Avaliação Física e Composição Corporal em formato PDF.\n\nAtenciosamente,\n${avaliacao.avaliador?.name || 'Laboratório de Avaliação Física — UNOESC'}`,
    attachments: [
      {
        filename,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  });

  return {
    messageId: info.messageId,
    filename,
    remetente: user,
  };
}

module.exports = {
  gerarPdfLaudoBuffer,
  enviarEmailComLaudoPdf,
};

