// routes/alunos.js

const express = require('express');
const { authenticateToken } = require('../middlewares/authMiddleware');
const AlunoController = require('../controllers/AlunoController');

const router = express.Router();

router.post('/', authenticateToken, AlunoController.create);
router.get('/', authenticateToken, AlunoController.getAll);
router.get('/:id', authenticateToken, AlunoController.getById);
router.put('/:id', authenticateToken, AlunoController.update);
router.delete('/:id', authenticateToken, AlunoController.delete);
router.patch('/:id/status', authenticateToken, AlunoController.updateStatus);

module.exports = router;