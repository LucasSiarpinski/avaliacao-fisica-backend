const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET não está definido.");
  process.exit(1);
}

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // max 5 tentativas
  message: { error: 'Muitas tentativas de login. Tente novamente mais tarde.' }
});

const loginSchema = z.object({
  email: z.string().email('Email inválido.'),
  password: z.string().min(1, 'Senha é obrigatória.'),
});

// --- ROTA DE LOGIN ---
// Método: POST | Endpoint: /api/auth/login
router.post('/login', loginLimiter, async (req, res) => {
  try {
    // 1. Validação com Zod
    const { email, password } = loginSchema.parse(req.body);

    // 3. Buscar o usuário no banco de dados pelo email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // 4. Se o usuário não existe, retorne um erro genérico
    // (Não diga "usuário não encontrado" por segurança)
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }
    
    // 5. Verificar se a conta do usuário está ATIVA
    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ error: 'Esta conta está inativa.' });
    }

    // 6. Comparar a senha enviada com a senha criptografada no banco
    const isPasswordValid = await bcrypt.compare(password, user.password);

    // 7. Se a senha for inválida, retorne o mesmo erro genérico
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    // 8. Se tudo deu certo, gerar o Token JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role // Incluir o papel (role) é MUITO importante para o frontend!
      }, 
      JWT_SECRET, 
      { expiresIn: '1h' } // Token expira em 1 hora
    );

    // 9. Atualizar o último acesso no banco
    await prisma.user.update({
      where: { id: user.id },
      data: { ultimoAcesso: new Date() }
    });

    // 10. Remover a senha do objeto de usuário antes de enviar a resposta
    const { password: _, ...userWithoutPassword } = user;

    // 11. Enviar a resposta de sucesso com os dados do usuário e o token
    res.json({ user: userWithoutPassword, token });

  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Ocorreu um erro interno no servidor.' });
  }
});

module.exports = router;