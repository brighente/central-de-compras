const express = require('express')
const router = express.Router();
const db = require('../db');  // Importa o banco
const authMiddleware = require('../authMiddleware')  // Importa o autenticador

router.use(authMiddleware);

router.get('/', async (req, res) => {
    try {
        const fornecedor = await db('tb_fornecedor').where({ id_usuario: req.user.userId }).first();
        if(!fornecedor) return res.status(404).json({message: 'Produto não encontrado'});

        const produtos = await db('tb_fornecedor_produto AS prod')
            .join('tb_categoria AS cat', 'prod.id_categoria', 'cat.id')
            .where({ id_fornecedor: fornecedor.id })
            .select('prod.*', 'cat.nome_categoria')
            .orderBy('prod.id', 'desc');

        res.json(produtos);

    } catch(err){
        console.error(err);
        res.status(500).json({message: 'Erro ao buscar produtos.'})
    }
});

router.get('/categorias', async (req, res) => {
    try{
        const categorias = await db('tb_categoria').select('*');
        res.json(categorias);
    } catch(err){
        console.error(err);
        res.status(500).json({message: 'Erro ao buscar categorias.'});
    }
});

router.post('/', async (req, res) => {
    const { produto, valor_produto, id_categoria } = req.body;  // Pega do frontend

    try{
        const fornecedor = await db('tb_fornecedor').where({ id_usuario: req.user.userId }).first();

        const [novoId] = await db('tb_fornecedor_produto').insert({
            id_fornecedor: fornecedor.id,
            // Todos os 3 tão vindo do frontend
            id_categoria,
            produto,
            valor_produto
        }).returning('id');

        res.status(201).json({message: 'Produto criado!', id: novoId.id})
    } catch(err){
        console.error(err);
        res.status(500).json({message: 'Erro ao criar produto'});
    }    
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;  // Pega do header
    const { produto, valor_produto, id_categoria} = req.body;  // Pega do frontend

    try {
        const fornecedor = await db('tb_fornecedor').where({ id_usuario: req.user.userId }).first();

        const produtoExistente = await db('tb_fornecedor_produto').where({ id, id_fornecedor: fornecedor.id }).first();

        if(!produtoExistente) return res.status(403).json({message: 'Produto não encontrado ou sem permissão'});

        await db('tb_fornecedor_produto').where({id}).update({ produto, valor_produto, id_categoria });

        res.json({message: 'Produto atualizado!'});
    } catch(err){
        console.error(err)
        res.status(500).json({message: 'Erro ao atualizar'});
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try{
        const fornecedor = await db('tb_fornecedor').where({ id_usuario: req.user.userId }).first();

        const linhasDeletadas = await db('tb_fornecedor_produto').where({ id, id_fornecedor: fornecedor.id }).del();

        if(linhasDeletadas === 0) return res.status(404).json({message: 'Produto não encontrado.'})

        res.json({message: 'Produto removido!'});
    } catch(err){
        console.error(err)
        if(err.code === '23503'){
            return res.status(400).json({message: 'Não é possível excluir esse produto pois ele já possui vendas registradas'});
        }
        res.status(500).json({message: 'Erro ao deletar'});
    }
});

module.exports = router;