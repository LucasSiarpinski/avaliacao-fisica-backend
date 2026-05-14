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
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
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
        campusId: req.user.campusId,
        role: 'PROFESSOR', // Definido explicitamente
        status: 'ACTIVE',
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

module.exports = router;