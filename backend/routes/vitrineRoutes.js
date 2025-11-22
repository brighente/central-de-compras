const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../authMiddleware');


router.get('/', authMiddleware, async (req, res) => {
    try {
        const produtos = await db('tb_fornecedor_produto AS prod')
            .join('tb_fornecedor AS forn', 'prod.id_fornecedor', 'forn.id')
            .join('tb_categoria AS cat', 'prod.id_categoria', 'cat.id')
            .select(
                'prod.id',
                'prod.produto',
                'prod.valor_produto',
                'forn.nome_fantasia AS fornecedor_nome',
                'cat.nome_categoria'
            )
            .orderBy('forn.nome_fantasia'); // Ordena por fornecedor

        res.json(produtos);
    } catch (err) {
        console.error('Erro ao buscar vitrine: ', err);
        res.status(500).json({ message: 'Erro ao carregar produtos' });
    }
});

module.exports = router;