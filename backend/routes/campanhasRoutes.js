const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../authMiddleware');

router.use(authMiddleware);

router.get('/', async (req, res) => {
    try {
        const fornecedor = await db('tb_fornecedor').where({ id_usuario: req.user.userId }).first();
        
        if (!fornecedor) return res.status(404).json({ message: 'Fornecedor não encontrado' });

        const campanhas = await db('tb_fornecedor_campanha')
            .where({ id_fornecedor: fornecedor.id })
            .orderBy('dt_inc', 'desc');

        res.json(campanhas);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao listar campanhas' });
    }
});

router.post('/', async (req, res) => {
    const { descricao, valor_meta, duracao_dias } = req.body;

    try {
        const fornecedor = await db('tb_fornecedor').where({ id_usuario: req.user.userId }).first();
        if (!fornecedor) return res.status(404).json({ message: 'Fornecedor não encontrado' });

        const usuario = await db('tb_sistema_usuario').where({ id: req.user.userId }).first();

        await db('tb_fornecedor_campanha').insert({
            id_fornecedor: fornecedor.id,
            id_usuario: req.user.userId,
            id_conta: usuario.id_conta,
            descricao_campanha: descricao,
            valor_meta: parseFloat(valor_meta),
            tempo_duracao_campanha: parseInt(duracao_dias),
            dt_inc: new Date(),
            quantidade_meta: 0,
            quantidade_atingida: 0,
            valor_atingido: 0
        });

        res.status(201).json({ message: 'Campanha criada com sucesso!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao criar campanha' });
    }
});

module.exports = router;