const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../authMiddleware');

router.use(authMiddleware);

// LISTAR (GET)
// A rota no frontend é /api/campanhas/fornecedor, então usei '/fornecedor' aqui
router.get('/fornecedor', async (req, res) => {
    try {
        const fornecedor = await db('tb_fornecedor').where({ id_usuario: req.user.userId }).first();
        
        if (!fornecedor) return res.status(404).json({ message: 'Fornecedor não encontrado' });

        const campanhas = await db('tb_fornecedor_campanha')
            .where({ id_fornecedor: fornecedor.id })
            .orderBy('dt_inc', 'desc');

        // Formata para o frontend entender (gatilho unificado)
        const formatadas = campanhas.map(c => ({
            id: c.id,
            descricao: c.descricao_campanha,
            tipo_regra: c.tipo_regra || 'VALOR',
            gatilho: c.tipo_regra === 'QUANTIDADE' ? c.quantidade_meta : c.valor_meta,
            desconto_percentual: c.percentual_desconto,
            dias_duracao: c.tempo_duracao_campanha
        }));

        res.json(formatadas);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao listar campanhas' });
    }
});

// CRIAR (POST)
router.post('/', async (req, res) => {
    // Frontend envia: descricao, tipo_regra, gatilho, desconto_percentual, dias_duracao
    const { descricao, tipo_regra, gatilho, desconto_percentual, dias_duracao } = req.body;

    try {
        const fornecedor = await db('tb_fornecedor').where({ id_usuario: req.user.userId }).first();
        const usuario = await db('tb_sistema_usuario').where({ id: req.user.userId }).first();

        // Define onde salvar o gatilho baseado no tipo
        const valorMeta = tipo_regra === 'VALOR' ? parseFloat(gatilho) : 0;
        const qtdMeta = tipo_regra === 'QUANTIDADE' ? parseInt(gatilho) : 0;

        await db('tb_fornecedor_campanha').insert({
            id_fornecedor: fornecedor.id,
            id_usuario: req.user.userId,
            id_conta: usuario.id_conta,
            descricao_campanha: descricao,
            tipo_regra: tipo_regra,             
            valor_meta: valorMeta,
            quantidade_meta: qtdMeta,
            percentual_desconto: parseFloat(desconto_percentual),
            tempo_duracao_campanha: parseInt(dias_duracao),
            dt_inc: new Date(),
            quantidade_atingida: 0,
            valor_atingido: 0
        });

        res.status(201).json({ message: 'Campanha criada com sucesso!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao criar campanha' });
    }
});

// EDITAR (PUT)
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { descricao, tipo_regra, gatilho, desconto_percentual, dias_duracao } = req.body;

    try {
        const fornecedor = await db('tb_fornecedor').where({ id_usuario: req.user.userId }).first();

        const valorMeta = tipo_regra === 'VALOR' ? parseFloat(gatilho) : 0;
        const qtdMeta = tipo_regra === 'QUANTIDADE' ? parseInt(gatilho) : 0;

        const update = await db('tb_fornecedor_campanha')
            .where({ id: id, id_fornecedor: fornecedor.id })
            .update({
                descricao_campanha: descricao,
                tipo_regra: tipo_regra,
                valor_meta: valorMeta,
                quantidade_meta: qtdMeta,
                percentual_desconto: parseFloat(desconto_percentual),
                tempo_duracao_campanha: parseInt(dias_duracao)
            });

        if (update) res.json({ message: 'Campanha atualizada!' });
        else res.status(404).json({ message: 'Campanha não encontrada.' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao atualizar campanha' });
    }
});

// EXCLUIR (DELETE)
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const fornecedor = await db('tb_fornecedor').where({ id_usuario: req.user.userId }).first();
        
        await db('tb_fornecedor_campanha')
            .where({ id: id, id_fornecedor: fornecedor.id })
            .del();

        res.json({ message: 'Campanha removida com sucesso' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao remover campanha' });
    }
});

module.exports = router;