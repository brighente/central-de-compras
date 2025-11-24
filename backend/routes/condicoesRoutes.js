const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../authMiddleware')

router.use(authMiddleware);

router.get('/', async (req, res) => {
    try{
        const fornecedor = await db('tb_fornecedor').where({id_usuario: req.user.userId}).first();
        if(!fornecedor) return res.status(404).json({message: 'Fornecedor não encontrado'});

        const condicoes = await db('tb_fornecedor_condicao_estado').where({id_fornecedor: fornecedor.id});

        res.json(condicoes);
    } catch(err){
        console.error(err);
        res.status(500).json({message: 'Erro ao buscar condições do fornecedor.'})
    }
});

router.post('/', async (req, res) =>{
    const { estado, valor_cashback_percentual, prazo_pagamento_dias, acrescimo_desconto_unitario_valor } = req.body;

    try{
        const fornecedor = await db('tb_fornecedor').where({id_usuario: req.user.userId}).first();
        if(!fornecedor) return res.status(404).json({message: 'Fornecedor não encontrado'});

        const existe = await db('tb_fornecedor_condicao_estado').where({ id_fornecedor: fornecedor.id, estado }).first();

        if(existe){
            await db('tb_fornecedor_condicao_estado').where({id: existe.id})
                .update({
                    valor_cashback_percentual,
                    prazo_pagamento_dias,
                    acrescimo_desconto_unitario_valor
                });

            return res.json({message: `Regra para ${estado} atualizada`})
        } else {
            await db('tb_fornecedor_condicao_estado').insert({
                id_fornecedor: fornecedor.id,
                estado,
                valor_cashback_percentual,
                prazo_pagamento_dias,
                acrescimo_desconto_unitario_valor
            });
            return res.status(201).json({message: `Regra para ${estado} criada`})
        }
    } catch(err){
        console.error(err);
        res.status(500).json({message: 'Erro ao salvar condição.'})
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params
    try{
        const fornecedor = await db('tb_fornecedor').where({id_usuario: res.user.userId}).first();

        await db('tb_fornecedor_condicao_estado').where({ id, id_fornecedor: fornecedor.id }).del();

        res.json({message: 'Regra removida'})
    } catch(err){
        console.error(err);
        res.status(500).json({message: 'Erro ao remover'})
    }
});

module.exports = router;