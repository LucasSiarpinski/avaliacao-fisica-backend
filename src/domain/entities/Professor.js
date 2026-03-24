class Professor {
  constructor({
    id,
    email,
    name,
    password,
    createdAt,
    role,
    status,
    campusId,
    campus,
  }) {
    this.id = id;
    this.email = email;
    this.name = name;
    this.password = password;
    this.createdAt = createdAt;
    this.role = role;
    this.status = status;
    this.campusId = campusId;
    this.campus = campus;
  }

  // Método para validar se o professor é válido
  isValid() {
    return this.name && this.email && this.role;
  }

  // Método para verificar se é professor
  isProfessor() {
    return this.role === 'PROFESSOR';
  }

  // Método para verificar se está ativo
  isActive() {
    return this.status === 'ACTIVE';
  }
}

module.exports = Professor;