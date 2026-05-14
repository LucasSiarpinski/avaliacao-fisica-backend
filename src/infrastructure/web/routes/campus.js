// Em /routes/campus.js

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middlewares/authMiddleware');

const prisma = new PrismaClient();
const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
    try {
        const campus = await prisma.campus.findMany({
            orderBy: {
                name: 'asc',
            },
        });
        res.status(200).json(campus);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar os campus.", error: error.message });
    }
});

module.exports = router;