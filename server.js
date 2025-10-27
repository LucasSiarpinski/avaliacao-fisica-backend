require('dotenv').config();
const express = require('express');
const cors = require('cors');

// --- 1. Importar as rotas de autenticação ---
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin'); 

const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ 
    message: "Servidor Backend de Avaliação Física rodando com sucesso!",
    status: "OK"
  });
});

// --- 2. Conectar as rotas ---
// Todas as rotas definidas em 'authRoutes' terão o prefixo '/api/auth'
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes); 

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});