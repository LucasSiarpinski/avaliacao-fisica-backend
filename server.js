require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser'); // <-- NOVO: Importar o cookie-parser

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin'); 
const alunoRoutes = require('./routes/alunos'); 

const app = express();
const PORT = process.env.PORT || 3333;

const allowedOrigins = [
  'http://localhost:3000',
  'http://192.168.1.21:3000' // Adicionamos o seu IP local aqui
];

app.use(cors({
  origin: allowedOrigins, // Usamos a lista aqui
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser()); // <-- NOVO: Usar o cookie-parser antes das rotas

app.get('/', (req, res) => {
  res.json({ 
    message: "Servidor Backend de Avaliação Física rodando com sucesso!",
    status: "OK"
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes); 
app.use('/api/alunos', alunoRoutes); 

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});