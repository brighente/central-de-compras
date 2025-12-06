const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../authMiddleware');

router.use(authMiddleware); 


router.get('/fornecedor/:id/pagamentos', async (req, res) => {
    const { id } = req.params;
    try {
        const pagamentos = await db('tb_fornecedor_condicao_pagamento')
            .where({ id_fornecedor: id })
            .select('id', 'descricao');

        res.json(pagamentos);
    } catch (error) {
        console.error('Erro ao buscar pagamentos para a loja:', error);
        res.status(500).json({ message: 'Erro ao buscar opções de pagamento.' });
    }
});

router.get('/', async (req, res) => {
    try {
        const fornecedor = await db('tb_fornecedor').where({id_usuario: req.user.userId}).first();
        if(!fornecedor) return res.status(404).json({message: 'Fornecedor não encontrado ou você é uma Loja.'});

        const condicoes = await db('tb_fornecedor_condicao_estado').where({id_fornecedor: fornecedor.id});
        res.json(condicoes);
    } catch(err){
        console.error(err);
        res.status(500).json({message: 'Erro ao buscar regras.'});
    }
});

router.post('/', async (req, res) =>{
    const { estado, valor_cashback_percentual, prazo_pagamento_dias, acrescimo_desconto_unitario_valor } = req.body;

    try{
        const fornecedor = await db('tb_fornecedor').where({id_usuario: req.user.userId}).first();
        if(!fornecedor) return res.status(403).json({message: 'Apenas fornecedores podem criar regras.'});
        
        const existe = await db('tb_fornecedor_condicao_estado')
            .where({ id_fornecedor: fornecedor.id, estado }).first();

        if(existe){
            return res.status(400).json({message: `Já existe uma regra para o estado ${estado}. Use a edição.`});
        }

        await db('tb_fornecedor_condicao_estado').insert({
            id_fornecedor: fornecedor.id,
            estado,
            valor_cashback_percentual,
            prazo_pagamento_dias,
            acrescimo_desconto_unitario_valor
        });
        return res.status(201).json({message: `Regra para ${estado} criada`});
    } catch(err){
        console.error(err);
        res.status(500).json({message: 'Erro ao salvar regra.'});
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { valor_cashback_percentual, prazo_pagamento_dias, acrescimo_desconto_unitario_valor } = req.body;

    try {
        const fornecedor = await db('tb_fornecedor').where({id_usuario: req.user.userId}).first();
        if(!fornecedor) return res.status(403).json({message: 'Acesso negado.'});

        const atualizado = await db('tb_fornecedor_condicao_estado')
            .where({ id, id_fornecedor: fornecedor.id })
            .update({
                valor_cashback_percentual,
                prazo_pagamento_dias,
                acrescimo_desconto_unitario_valor
            });

        if (atualizado) {
            res.json({ message: 'Regra atualizada com sucesso!' });
        } else {
            res.status(404).json({ message: 'Regra não encontrada.' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao atualizar regra.' });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try{
        const fornecedor = await db('tb_fornecedor').where({id_usuario: req.user.userId}).first();
        if(!fornecedor) return res.status(403).json({message: 'Acesso negado.'});

        await db('tb_fornecedor_condicao_estado').where({ id, id_fornecedor: fornecedor.id }).del();
        res.json({message: 'Regra removida'});
    } catch(err){
        console.error(err);
        res.status(500).json({message: 'Erro ao remover'});
    }
});


router.get('/pagamento', async (req, res) => {
    try {
        const fornecedor = await db('tb_fornecedor').where({id_usuario: req.user.userId}).first();
        if(!fornecedor) return res.status(403).json({message: 'Acesso negado.'});

        const formas = await db('tb_fornecedor_condicao_pagamento').where({ id_fornecedor: fornecedor.id });
        res.json(formas);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Erro ao buscar formas de pagamento'});
    }
});

router.post('/pagamento', async (req, res) => {
    const { descricao } = req.body;
    try {
        const fornecedor = await db('tb_fornecedor').where({id_usuario: req.user.userId}).first();
        if(!fornecedor) return res.status(403).json({message: 'Acesso negado.'});

        await db('tb_fornecedor_condicao_pagamento').insert({
            id_fornecedor: fornecedor.id,
            descricao: descricao,
            dt_inc: new Date()
        });
        res.status(201).json({ message: 'Forma de pagamento adicionada' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao adicionar forma de pagamento' });
    }
});

router.put('/pagamento/:id', async (req, res) => {
    const { id } = req.params;
    const { descricao } = req.body;

    try {
        const fornecedor = await db('tb_fornecedor').where({id_usuario: req.user.userId}).first();
        if(!fornecedor) return res.status(403).json({message: 'Acesso negado.'});

        const atualizado = await db('tb_fornecedor_condicao_pagamento')
            .where({ id, id_fornecedor: fornecedor.id })
            .update({ descricao });

        if (atualizado) {
            res.json({ message: 'Forma de pagamento atualizada!' });
        } else {
            res.status(404).json({ message: 'Item não encontrado.' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao atualizar item.' });
    }
});

router.delete('/pagamento/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const fornecedor = await db('tb_fornecedor').where({id_usuario: req.user.userId}).first();
        if(!fornecedor) return res.status(403).json({message: 'Acesso negado.'});

        await db('tb_fornecedor_condicao_pagamento').where({ id: id, id_fornecedor: fornecedor.id }).del();
        res.json({ message: 'Forma de pagamento removida' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao remover' });
    }
});

module.exports = router;