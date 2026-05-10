require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser'); // <-- NOVO: Importar o cookie-parser

const authRoutes = require('./src/infrastructure/web/routes/auth');
const adminRoutes = require('./src/infrastructure/web/routes/admin'); 
const alunoRoutes = require('./src/infrastructure/web/routes/alunos'); 
const professorRoutes = require('./src/infrastructure/web/routes/professores');
const campusRoutes = require('./src/infrastructure/web/routes/campus'); // Importa o arquivo
const avaliacoesRoutes = require('./src/infrastructure/web/routes/avaliacoes'); // Importa o arquivo

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
app.use('/api/professores', professorRoutes);
app.use('/api/campus', campusRoutes);
app.use('/api/avaliacoes', avaliacoesRoutes); // <-- NOVO: Adiciona a rota de avaliações

// O if impede que o servidor ligue a porta 3333 durante os testes (evitando travar o Jest)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  });
}

// Exporta o app para o Jest conseguir ler as rotas!
module.exports = app;