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

    // --- MUDANÇA PRINCIPAL AQUI ---
    // 1. Em vez de enviar o token no JSON, vamos enviá-lo como um cookie HttpOnly.
    //    Isso é mais seguro e permite que o middleware do Next.js o leia no servidor.
    res.cookie('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development', // Em produção, usar true
      maxAge: 24 * 60 * 60 * 1000, // 1 dia, igual à expiração do token
      path: '/',
      sameSite: 'lax',
    });
    // -----------------------------

    const { password: _, ...userWithoutPassword } = user;

    // 2. A resposta agora envia APENAS os dados do usuário. O token já foi no cookie.
    res.json({ user: userWithoutPassword });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Ocorreu um erro interno no servidor.' });
  }
});


// --- ROTA DE LOGOUT (NOVA) ---
// Método: POST | Endpoint: /api/auth/logout
router.post('/logout', (req, res) => {
  // A forma de fazer logout no backend é simplesmente limpar o cookie.
  // Dizemos ao navegador para substituir o cookie 'auth-token' por um vazio
  // que expira imediatamente.
  res.cookie('auth-token', '', {
    httpOnly: true,
    expires: new Date(0), // Expira no passado
    path: '/',
  });
  
  res.status(200).json({ message: 'Logout realizado com sucesso.' });
});


module.exports = router;