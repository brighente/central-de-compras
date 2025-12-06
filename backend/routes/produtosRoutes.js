const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/';
        if (!fs.existsSync(uploadPath)){
            fs.mkdirSync(uploadPath);
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Erro: Apenas imagens (jpeg, jpg, png, webp) são permitidas!'));
    }
});

router.use(authMiddleware);

router.get('/', async (req, res) => {
    try {
        const fornecedor = await db('tb_fornecedor').where({ id_usuario: req.user.userId }).first();
        if(!fornecedor) return res.status(404).json({message: 'Fornecedor não encontrado'});

        const produtos = await db('tb_fornecedor_produto AS prod')
            .join('tb_categoria AS cat', 'prod.id_categoria', 'cat.id')
            .where({ id_fornecedor: fornecedor.id })
            .select('prod.*', 'cat.nome_categoria')
            .orderBy('prod.id', 'desc');

        const produtosComUrl = produtos.map(p => ({
            ...p,
            imagemUrl: p.imagem ? `http://localhost:3001/uploads/${p.imagem}` : null
        }));

        res.json(produtosComUrl);

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

router.post('/', upload.single('imagem'), async (req, res) => {
    const { produto, valor_produto, id_categoria } = req.body;
    const imagem = req.file ? req.file.filename : null;

    try{
        const fornecedor = await db('tb_fornecedor').where({ id_usuario: req.user.userId }).first();

        const [novoId] = await db('tb_fornecedor_produto').insert({
            id_fornecedor: fornecedor.id,
            id_categoria,
            produto,
            valor_produto,
            imagem
        }).returning('id');

        res.status(201).json({message: 'Produto criado!', id: novoId.id})
    } catch(err){
        console.error(err);
        res.status(500).json({message: 'Erro ao criar produto'});
    }    
});

router.put('/:id', upload.single('imagem'), async (req, res) => {
    const { id } = req.params;
    const { produto, valor_produto, id_categoria} = req.body;
    
    const novaImagem = req.file ? req.file.filename : undefined;

    try {
        const fornecedor = await db('tb_fornecedor').where({ id_usuario: req.user.userId }).first();

        const produtoExistente = await db('tb_fornecedor_produto').where({ id, id_fornecedor: fornecedor.id }).first();

        if(!produtoExistente) return res.status(403).json({message: 'Produto não encontrado ou sem permissão'});

        const updateData = { 
            produto, 
            valor_produto, 
            id_categoria 
        };

        if(novaImagem) {
            updateData.imagem = novaImagem;
            
        }

        await db('tb_fornecedor_produto').where({id}).update(updateData);

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