
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// É uma boa prática guardar o segredo do JWT em variáveis de ambiente (.env)
// Mas para desenvolvimento, podemos começar com ele aqui.
const JWT_SECRET = process.env.JWT_SECRET || 'meu-tcc-super-secreto-2025';

// --- ROTA DE LOGIN ---
// Método: POST | Endpoint: /api/auth/login
router.post('/login', async (req, res) => {
  // 1. Pegar email e senha do corpo da requisição
  const { email, password } = req.body;

  // 2. Validação básica de entrada
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }

  try {
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
      { expiresIn: '1d' } // Token expira em 1 dia
    );

    // 9. Remover a senha do objeto de usuário antes de enviar a resposta
    const { password: _, ...userWithoutPassword } = user;

    // 10. Enviar a resposta de sucesso com os dados do usuário e o token
    res.json({ user: userWithoutPassword, token });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Ocorreu um erro interno no servidor.' });
  }
});

module.exports = router;