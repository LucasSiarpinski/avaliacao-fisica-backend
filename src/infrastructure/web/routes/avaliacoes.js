const express = require('express');
const { authenticateToken } = require('../middlewares/authMiddleware');
const AvaliacaoController = require('../controllers/AvaliacaoController');

const router = express.Router();

router.use(authenticateToken);

router.get('/', AvaliacaoController.getAll);
router.post('/', AvaliacaoController.create);
router.get('/:id', AvaliacaoController.getById);
router.put('/:id', AvaliacaoController.update);
router.delete('/:id', AvaliacaoController.delete);

module.exports = router;