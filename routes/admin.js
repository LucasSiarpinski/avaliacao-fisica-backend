const express = require('express');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, adminOnly } = require('../middlewares/authMiddleware');

const router = express.Router();
const prisma = new PrismaClient();

// --- ROTA PARA CRIAR UM NOVO PROFESSOR ---
// Método: POST | Endpoint: /api/admin/professors
// Proteção: Requer token válido E que o usuário seja ADMIN.
router.post('/professors', authenticateToken, adminOnly, async (req, res) => {
  const { name, email, password, campusId, telefone, cpf, matricula, foto } = req.body;

  // Validação dos dados de entrada
  if (!name || !email || !password || !campusId) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios: nome, email, senha e campusId.' });
  }

  try {
    // Verifica se o email já está em uso
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Este email já está em uso.' });
    }

    // Criptografa a senha do novo professor
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria o novo usuário com o papel de PROFESSOR
    const newProfessor = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        campusId,
        role: 'PROFESSOR',
        status: 'ACTIVE',
        telefone: telefone || null,
        cpf: cpf || null,
        matricula: matricula || null,
        foto: foto || null
      },
    });

    const { password: _, ...professorWithoutPassword } = newProfessor;
    res.status(201).json(professorWithoutPassword);
    
  } catch (error) {
    // Trata o erro caso o campusId não exista, por exemplo
    console.error('Erro ao criar professor:', error);
    res.status(500).json({ error: 'Não foi possível criar o professor.' });
  }
});

// --- ROTA PARA LISTAR PROFESSORES ---
// Método: GET | Endpoint: /api/admin/professors
// Proteção: Requer token válido E que o usuário seja ADMIN.
router.get('/professors', authenticateToken, adminOnly, async (req, res) => {
  try {
    const professors = await prisma.user.findMany({
      where: { 
        role: { in: ['PROFESSOR', 'ADMIN'] },
        campusId: req.user.campusId 
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        telefone: true,
        cpf: true,
        matricula: true,
        ultimoAcesso: true,
        createdAt: true
      }
    });
    res.json(professors);
  } catch (error) {
    console.error('Erro ao listar professores:', error);
    res.status(500).json({ error: 'Erro ao listar professores.' });
  }
});

// --- ROTA PARA EDITAR UM PROFESSOR ---
// Método: PUT | Endpoint: /api/admin/professors/:id
router.put('/professors/:id', authenticateToken, adminOnly, async (req, res) => {
  const { id } = req.params;
  const { name, email, password, status, telefone, cpf, matricula, foto } = req.body;

  try {
    const existingProf = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    if (!existingProf || existingProf.campusId !== req.user.campusId) {
      return res.status(403).json({ error: 'Acesso negado. Administrador de outro campus.' });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (status) updateData.status = status;
    if (telefone !== undefined) updateData.telefone = telefone;
    if (cpf !== undefined) updateData.cpf = cpf;
    if (matricula !== undefined) updateData.matricula = matricula;
    if (foto !== undefined) updateData.foto = foto;
    
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedProfessor = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    const { password: _, ...profWithoutPassword } = updatedProfessor;
    res.json(profWithoutPassword);
  } catch (error) {
    console.error('Erro ao atualizar professor:', error);
    res.status(500).json({ error: 'Erro ao atualizar professor.' });
  }
});

module.exports = router;