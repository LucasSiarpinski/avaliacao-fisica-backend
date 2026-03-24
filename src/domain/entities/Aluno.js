class Aluno {
  constructor({
    id,
    createdAt,
    updatedAt,
    status,
    nome,
    email,
    dataNasc,
    matricula,
    cpf,
    genero,
    telefone,
    altura,
    peso,
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
    anamneseStatus,
    anamneseSentAt,
    campusId,
    professorId,
  }) {
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.status = status;
    this.nome = nome;
    this.email = email;
    this.dataNasc = dataNasc;
    this.matricula = matricula;
    this.cpf = cpf;
    this.genero = genero;
    this.telefone = telefone;
    this.altura = altura;
    this.peso = peso;
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
    this.anamneseStatus = anamneseStatus;
    this.anamneseSentAt = anamneseSentAt;
    this.campusId = campusId;
    this.professorId = professorId;
  }

  // Método para validar se o aluno é válido
  isValid() {
    return this.nome && this.email && this.dataNasc && this.matricula;
  }

  // Método para calcular IMC se altura e peso estiverem presentes
  getIMC() {
    if (this.altura && this.peso) {
      return this.peso / (this.altura * this.altura);
    }
    return null;
  }
}

module.exports = Aluno;