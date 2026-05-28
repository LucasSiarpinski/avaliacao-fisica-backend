require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// --- 1. Importar as rotas de autenticação ---
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin'); 
const alunoRoutes = require('./routes/alunos'); 
const avaliacaoRoutes = require('./routes/avaliacoes');
const dashboardRoutes = require('./routes/dashboard');
const relatoriosRoutes = require('./routes/relatorios');

const app = express();
const PORT = process.env.PORT || 3333;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ 
    message: "Servidor Backend de Avaliação Física rodando com sucesso!",
    status: "OK"
  });
});

// --- 2. Conectar as rotas ---
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes); 
app.use('/api/alunos', alunoRoutes); 
app.use('/api/avaliacoes', avaliacaoRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/relatorios', relatoriosRoutes);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  });
}

module.exports = app;