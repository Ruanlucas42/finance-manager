const express = require('express');
const router = express.Router();
const db = require('../db');

// CREATE - Criar categoria
router.post('/', async (req, res) => {
    const { nome, tipo } = req.body;

    // Validação
    if (!nome || !tipo) {
        return res.status(400).json({ erro: 'Nome e tipo são obrigatórios.' });
    }
    if (!['receita', 'despesa'].includes(tipo)) {
        return res.status(400).json({ erro: 'Tipo deve ser "receita" ou "despesa".' });
    }
    if (nome.trim().length < 2) {
        return res.status(400).json({ erro: 'Nome deve ter ao menos 2 caracteres.' });
    }

    try {
        const [result] = await db.execute(
            'INSERT INTO categorias (nome, tipo) VALUES (?, ?)',
            [nome.trim(), tipo]
        );
        res.status(201).json({ id: result.insertId, nome, tipo });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao criar categoria.', detalhe: err.message });
    }
});

// READ - Listar todas as categorias e filtro de tipo
router.get('/', async (req, res) => {
    const { tipo, busca } = req.query;

    let query = 'SELECT * FROM categorias WHERE 1=1';
    const params = [];

    if (tipo) {
        query += ' AND tipo = ?';
        params.push(tipo);
    }
    if (busca) {
        query += ' AND nome LIKE ?';
        params.push(`%${busca}%`);
    }

    query += ' ORDER BY criado_em DESC';

    try {
        const [rows] = await db.execute(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao buscar categorias.', detalhe: err.message });
    }
});

// READ - Buscar categoria por ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM categorias WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ erro: 'Categoria não encontrada.' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao buscar categoria.' });
    }
});

module.exports = router;