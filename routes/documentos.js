// routes/documentos.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();
const prisma = new PrismaClient();

// Garante que o diretório de uploads exista
const uploadDir = path.join(__dirname, '..', 'uploads', 'documentos');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuração do Multer (armazenamento em disco)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Sanitiza o nome original
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e6);
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  },
});

// Filtro de formatos permitidos: PDF, Word (doc/docx), PNG, JPEG
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg'];
  const ext = path.extname(file.originalname).toLowerCase();

  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png',
    'image/jpeg',
    'image/pjpeg',
  ];

  if (allowedExtensions.includes(ext) || allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formato de arquivo não suportado. Permita apenas PDF, Word (.doc, .docx), PNG e JPEG.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // Limite de 25MB
  },
});

// --- ROTA PARA LISTAR DOCUMENTOS DE UM ALUNO ---
router.get('/alunos/:id/documentos', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const professorId = req.user.id;

  try {
    const aluno = await prisma.aluno.findFirst({
      where: { id: parseInt(id), professorId },
    });

    if (!aluno) {
      return res.status(404).json({ error: 'Aluno não encontrado ou sem permissão.' });
    }

    const documentos = await prisma.documento.findMany({
      where: { alunoId: parseInt(id) },
      orderBy: { uploadAt: 'desc' },
    });

    res.json(documentos);
  } catch (error) {
    console.error('Erro ao buscar documentos:', error);
    res.status(500).json({ error: 'Não foi possível buscar os documentos.' });
  }
});

// --- ROTA PARA UPLOAD DE DOCUMENTO PARA UM ALUNO ---
router.post('/alunos/:id/documentos', authenticateToken, (req, res) => {
  upload.single('arquivo')(req, res, async (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'O arquivo excede o limite máximo de 25MB.' });
      }
      return res.status(400).json({ error: err.message || 'Erro no upload do arquivo.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }

    const { id } = req.params;
    const professorId = req.user.id;

    try {
      const aluno = await prisma.aluno.findFirst({
        where: { id: parseInt(id), professorId },
      });

      if (!aluno) {
        // Remove arquivo que já foi salvo
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ error: 'Aluno não encontrado ou sem permissão.' });
      }

      // Salva caminho relativo para servir estaticamente
      const relativeUrl = `/uploads/documentos/${req.file.filename}`;

      const novoDocumento = await prisma.documento.create({
        data: {
          nome: req.file.originalname,
          tipo: req.file.mimetype || path.extname(req.file.originalname),
          url: relativeUrl,
          alunoId: parseInt(id),
        },
      });

      res.status(201).json(novoDocumento);
    } catch (error) {
      console.error('Erro ao salvar documento:', error);
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ error: 'Não foi possível salvar o documento no sistema.' });
    }
  });
});

// --- ROTA PARA EXCLUIR UM DOCUMENTO ---
router.delete('/documentos/:docId', authenticateToken, async (req, res) => {
  const { docId } = req.params;
  const professorId = req.user.id;

  try {
    const documento = await prisma.documento.findUnique({
      where: { id: parseInt(docId) },
      include: { aluno: true },
    });

    if (!documento || documento.aluno.professorId !== professorId) {
      return res.status(404).json({ error: 'Documento não encontrado ou sem permissão.' });
    }

    // Remove do disco se existir
    const filePath = path.join(__dirname, '..', documento.url.replace(/^\//, ''));
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.warn('Erro ao remover arquivo físico:', err);
      }
    }

    // Remove do banco
    await prisma.documento.delete({
      where: { id: parseInt(docId) },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir documento:', error);
    res.status(500).json({ error: 'Não foi possível excluir o documento.' });
  }
});

module.exports = router;
