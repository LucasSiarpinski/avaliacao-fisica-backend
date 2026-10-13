require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser'); // <-- NOVO: Importar o cookie-parser

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin'); 
const alunoRoutes = require('./routes/alunos'); 
const professorRoutes = require('./routes/professores');
const campusRoutes = require('./routes/campus'); // Importa o arquivo
const avaliacoesRoutes = require('./routes/avaliacoes'); // Importa o arquivo
const documentosRoutes = require('./routes/documentos'); // Importa rota de documentos
const dashboardRoutes = require('./routes/dashboard'); // Importa rotas do dashboard

const app = express();
const PORT = process.env.PORT || 3333;

const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://192.168.1.21:3000',
  'http://26.11.93.67:3000',
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS origin não permitido'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Private-Network', 'true');
  next();
});

app.use(express.json());
app.use(cookieParser()); // <-- NOVO: Usar o cookie-parser antes das rotas
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.json({ 
    message: "Servidor Backend de Avaliação Física rodando com sucesso!",
    status: "OK"
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes); 
app.use('/api/alunos', alunoRoutes); 
app.use('/alunos', alunoRoutes); // Fallback para compatibilidade
app.use('/api/professores', professorRoutes);
app.use('/api/campus', campusRoutes);
app.use('/api/avaliacoes', avaliacoesRoutes); // <-- NOVO: Adiciona a rota de avaliações
app.use('/avaliacoes', avaliacoesRoutes); // Fallback para compatibilidade
app.use('/api/dashboard', dashboardRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/api', documentosRoutes); // Rotas de documentos (upload, list, delete)
app.use('/', documentosRoutes); // Fallback para compatibilidade

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});