const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'meu-tcc-super-secreto-2025';

// Middleware para verificar a AUTENTICAÇÃO (se o token é válido)
async function authenticateToken(req, res, next) {
// Agora lemos o token diretamente do cookie que o backend enviou
  const token = req.cookies['auth-token']; // O nome 'auth-token' deve ser o mesmo que você definiu no res.cookie

  if (token == null) {
    // Se não há token, o acesso é não autorizado
    return res.sendStatus(401); 
  }

  try {
    // Verifica se o token é válido usando nosso segredo
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Busca o usuário no banco para garantir que ele ainda existe e está ativo
    const user = await prisma.user.findUnique({ where: { id: decoded.userId }});

    if (!user || user.status !== 'ACTIVE') {
      return res.status(401).json({ error: 'Usuário não encontrado ou inativo.' });
    }

    // Anexa os dados do usuário na requisição para que as rotas futuras possam usá-los
    req.user = user;
    next(); // Passa para o próximo middleware ou para a rota final
  } catch (err) {
    // Se o token for inválido (expirado, etc.), o acesso é proibido
    return res.status(403).json({ error: 'Token inválido ou expirado.' });
  }
}

// Middleware para verificar a AUTORIZAÇÃO (se o usuário é ADMIN)
function adminOnly(req, res, next) {
  // Este middleware roda DEPOIS do authenticateToken, então já temos o req.user
  if (req.user && req.user.role === 'ADMIN') {
    next(); // Se for admin, pode prosseguir
  } else {
    // Se não for admin, o acesso é proibido
    res.status(403).json({ error: 'Acesso negado. Rota exclusiva para administradores.' });
  }
}

module.exports = {
  authenticateToken,
  adminOnly,
};