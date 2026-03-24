// Em routes/professores.js

const express = require('express');
const ProfessorController = require('../controllers/ProfessorController');

const router = express.Router();

// ROTA: (GET) /api/professores -> Buscar todos os professores
router.get('/', ProfessorController.getAll);

// ROTA: (GET) /api/professores/:id -> Buscar um professor por ID
router.get('/:id', ProfessorController.getById);

// ROTA: (POST) /api/professores -> Criar um novo professor
router.post('/', ProfessorController.create);

// ROTA: (PUT) /api/professores/:id -> Atualizar um professor
router.put('/:id', ProfessorController.update);

// ROTA: (DELETE) /api/professores/:id -> Deletar um professor
router.delete('/:id', ProfessorController.delete);

module.exports = router;