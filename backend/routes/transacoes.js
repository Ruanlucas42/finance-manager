const express = require('express');
const router = express.Router();
const db = require('../db');

// CREATE - Criar transação
router.post('/', async (req, res) => {
    const { descricao, valor, data, categoria_id } = req.body;

    // Validações
    if (!descricao || !valor || !data || !categoria_id) {
        return res.status(400).json({ erro: 'Todos os campos são obrigatórios.' });
    }
    if (isNaN(valor) || Number(valor) <= 0) {
        return res.status(400).json({ erro: 'Valor deve ser um número positivo.' });
    }
    if (isNaN(Date.parse(data))) {
        return res.status(400).json({ erro: 'Data inválida.' });
    }

    try {
        // Verifica se categoria existe
        const [cat] = await db.execute('SELECT id FROM categorias WHERE id = ?', [categoria_id]);
        if (cat.length === 0) return res.status(400).json({ erro: 'Categoria não encontrada.' });

        const [result] = await db.execute(
            'INSERT INTO transacoes (descricao, valor, data, categoria_id) VALUES (?, ?, ?, ?)',
            [descricao.trim(), valor, data, categoria_id]
        );
        res.status(201).json({ id: result.insertId, descricao, valor, data, categoria_id });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao criar transação.', detalhe: err.message });
    }
});

// READ - Listar as transaçoes com o filtro de busca
router.get('/', async (req, res) => {
    const { categoria_id, tipo, busca, data_inicio, data_fim } = req.query;

    let query = `
        SELECT t.*, c.nome AS categoria_nome, c.tipo AS categoria_tipo
        FROM transacoes t
        JOIN categorias c ON t.categoria_id = c.id
        WHERE 1=1
    `;
    const params = [];

    if (categoria_id) {
        query += ' AND t.categoria_id = ?';
        params.push(categoria_id);
    }
    if (tipo) {
        query += ' AND c.tipo = ?';
        params.push(tipo);
    }
    if (busca) {
        query += ' AND t.descricao LIKE ?';
        params.push(`%${busca}%`);
    }
    if (data_inicio) {
        query += ' AND t.data >= ?';
        params.push(data_inicio);
    }
    if (data_fim) {
        query += ' AND t.data <= ?';
        params.push(data_fim);
    }

    query += ' ORDER BY t.data DESC, t.criado_em DESC';

    try {
        const [rows] = await db.execute(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao buscar transações.', detalhe: err.message });
    }
});

// READ 
router.get('/resumo/geral', async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT 
                c.tipo,
                SUM(t.valor) AS total
            FROM transacoes t
            JOIN categorias c ON t.categoria_id = c.id
            GROUP BY c.tipo
        `);

        const resumo = { receita: 0, despesa: 0, saldo: 0 };
        rows.forEach(r => { resumo[r.tipo] = parseFloat(r.total); });
        resumo.saldo = resumo.receita - resumo.despesa;

        res.json(resumo);
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao calcular resumo.' });
    }
});

module.exports = router;