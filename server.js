// avaliacao-fisica-backend/server.js

// Importa bibliotecas essenciais
const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Para carregar variáveis de ambiente (como a porta)

const app = express();
const PORT = process.env.PORT || 3333; // Usa a porta definida em .env ou 3333 por padrão

// Middlewares
app.use(cors());
app.use(express.json()); // Permite que o Express leia JSON no corpo das requisições

// Rota de Teste Simples (para verificar se está funcionando)
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Servidor Backend de Avaliação Física rodando com sucesso!',
    status: 'OK'
  });
});

// Inicializa o servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});