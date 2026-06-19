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

// UPDATE - Atualizar Categoria
router.put('/:id', async (req, res) => {
    const { nome, tipo } = req.body;
    const { id } = req.params;

    if (!nome || !tipo) {
        return res.status(400).json({ erro: 'Nome e tipo são obrigatórios.' });
    }
    if (!['receita', 'despesa'].includes(tipo)) {
        return res.status(400).json({ erro: 'Tipo deve ser "receita" ou "despesa".' });
    }

    try {
        const [result] = await db.execute(
            'UPDATE categorias SET nome = ?, tipo = ? WHERE id = ?',
            [nome.trim(), tipo, id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ erro: 'Categoria não encontrada.' });
        res.json({ id, nome, tipo });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao atualizar categoria.', detalhe: err.message });
    }
});

// DELETE - Deletar Categoria
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Validação se existem transações vinculadas a essa categoria antes de deletar
        const [transacoes] = await db.execute('SELECT id FROM transacoes WHERE categoria_id = ?', [id]);
        if (transacoes.length > 0) {
            return res.status(400).json({ erro: 'Não é possível deletar uma categoria que possui transações vinculadas.' });
        }

        const [result] = await db.execute('DELETE FROM categorias WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ erro: 'Categoria não encontrada.' });
        res.json({ mensagem: 'Categoria deletada com sucesso.' });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao deletar categoria.', detalhe: err.message });
    }
});

module.exports = router;