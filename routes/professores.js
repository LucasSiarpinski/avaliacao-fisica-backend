// Em routes/professores.js

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const router = express.Router();

// ROTA: (GET) /api/professores -> Buscar todos os professores
router.get('/', async (req, res) => {
    try {
        const professores = await prisma.user.findMany({
            include: {
                campus: true,
            },
            orderBy: {
                name: 'asc',
            },
        });
        res.status(200).json(professores);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar professores.", error: error.message });
    }
});

// ROTA: (GET) /api/professores/:id -> Buscar um professor por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const professor = await prisma.user.findUnique({
            where: { id: parseInt(id) },
        });
        if (!professor) {
            return res.status(404).json({ message: "Professor não encontrado." });
        }
        res.status(200).json(professor);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar professor.", error: error.message });
    }
});

// ROTA: (POST) /api/professores -> Criar um novo professor
router.post('/', async (req, res) => {
    // ✅ CORRIGIDO: Pegando os dados do corpo da requisição
    const { name, email, password, role, campusId } = req.body;

    // ✅ CORRIGIDO: Adicionando a condição para a verificação
    if (!password) {
        return res.status(400).json({ message: "A senha é obrigatória." });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newProfessor = await prisma.user.create({
            // ✅ CORRIGIDO: Passando todos os dados necessários
            data: {
                name,
                email,
                password: hashedPassword,
                role,
                campusId: parseInt(campusId),
            },
        });
        res.status(201).json(newProfessor);
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({ message: "Este email já está em uso." });
        }
        res.status(500).json({ message: "Erro ao criar professor.", error: error.message });
    }
});

// ROTA: (PUT) /api/professores/:id -> Atualizar um professor
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    // ✅ CORRIGIDO: Pegando os dados do corpo da requisição
    const { name, email, password, role, campusId } = req.body;

    // ✅ CORRIGIDO: Adicionando o bloco 'try' que estava faltando
    try {
        const updateData = {
            name,
            email,
            role,
            campusId: parseInt(campusId),
        };

        // Só atualiza a senha se uma nova foi enviada
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const updatedProfessor = await prisma.user.update({
            where: { id: parseInt(id) },
            data: updateData,
        });
        res.status(200).json(updatedProfessor);
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({ message: "Email já em uso por outro usuário." });
        }
        res.status(500).json({ message: "Erro ao atualizar professor.", error: error.message });
    }
});

// ROTA: (DELETE) /api/professores/:id -> Deletar um professor
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.user.delete({
            where: { id: parseInt(id) },
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: "Erro ao excluir professor.", error: error.message });
    }
});

module.exports = router;