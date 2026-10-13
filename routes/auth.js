const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'meu-tcc-super-secreto-2025';

// --- ROTA DE LOGIN ---
// Método: POST | Endpoint: /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }
    
    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ error: 'Esta conta está inativa.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role
      }, 
      JWT_SECRET, 
      { expiresIn: '1d' }
    );

    const { password: _, ...userWithoutPassword } = user;

    // Envia o token no JSON para o frontend armazenar no localStorage
    res.json({ 
      user: userWithoutPassword,
      token: token
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Ocorreu um erro interno no servidor.' });
  }
});


// --- ROTA DE LOGOUT (NOVA) ---
// Método: POST | Endpoint: /api/auth/logout
router.post('/logout', (req, res) => {
  // No frontend, o token é armazenado no localStorage e será removido lá.
  // O backend não precisa fazer nada especial, pois não há cookie.
  res.status(200).json({ message: 'Logout realizado com sucesso.' });
});


module.exports = router;