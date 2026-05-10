class Avaliacao {
  constructor({
    id,
    dataAvaliacao,
    alunoId,
    avaliadorId,
    objetivos,
    historicoMedico,
    medicamentosEmUso,
    habitos,
    observacoes,
    parq_q1,
    parq_q2,
    parq_q3,
    parq_q4,
    parq_q5,
    parq_q6,
    parq_q7,
    peso,
    altura,
    circCintura,
    circAbdomem,
    circQuadril,
    circBracoRelaxadoD,
    circBracoRelaxadoE,
    dcTriceps,
    dcSubescapular,
    dcPeitoral,
    dcAxilarMedia,
    dcSuprailiaca,
    dcAbdominal,
    dcCoxa,
    resultados,
    updatedAt,
  }) {
    this.id = id;
    this.dataAvaliacao = dataAvaliacao;
    this.alunoId = alunoId;
    this.avaliadorId = avaliadorId;
    this.objetivos = objetivos;
    this.historicoMedico = historicoMedico;
    this.medicamentosEmUso = medicamentosEmUso;
    this.habitos = habitos;
    this.observacoes = observacoes;
    this.parq_q1 = parq_q1;
    this.parq_q2 = parq_q2;
    this.parq_q3 = parq_q3;
    this.parq_q4 = parq_q4;
    this.parq_q5 = parq_q5;
    this.parq_q6 = parq_q6;
    this.parq_q7 = parq_q7;
    this.peso = peso;
    this.altura = altura;
    this.circCintura = circCintura;
    this.circAbdomem = circAbdomem;
    this.circQuadril = circQuadril;
    this.circBracoRelaxadoD = circBracoRelaxadoD;
    this.circBracoRelaxadoE = circBracoRelaxadoE;
    this.dcTriceps = dcTriceps;
    this.dcSubescapular = dcSubescapular;
    this.dcPeitoral = dcPeitoral;
    this.dcAxilarMedia = dcAxilarMedia;
    this.dcSuprailiaca = dcSuprailiaca;
    this.dcAbdominal = dcAbdominal;
    this.dcCoxa = dcCoxa;
    this.resultados = resultados;
    this.updatedAt = updatedAt;
  }

  isValid() {
    return this.alunoId && this.avaliadorId;
  }
}

module.exports = Avaliacao;