// Em /routes/campus.js

const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

// A rota base é '/', que se tornará '/api/campus' no server.js
router.get('/', async (req, res) => {
    try {
        const campus = await prisma.campus.findMany({ // Usa o model 'Campus' do Prisma
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