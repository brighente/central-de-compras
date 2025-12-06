const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../authMiddleware');
const multer = require('multer'); // Importa Multer
const path = require('path');
const fs = require('fs');

// --- Configuração do Upload (Multer) ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/';
        // Cria a pasta se não existir
        if (!fs.existsSync(uploadPath)){
            fs.mkdirSync(uploadPath);
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Nome único: timestamp + extensão original
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limite de 5MB
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

        // Adiciona a URL completa da imagem para facilitar no front
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

// POST com upload.single('imagem')
router.post('/', upload.single('imagem'), async (req, res) => {
    // Nota: Com multer, req.body terá os campos de texto e req.file o arquivo
    const { produto, valor_produto, id_categoria } = req.body;
    const imagem = req.file ? req.file.filename : null;

    try{
        const fornecedor = await db('tb_fornecedor').where({ id_usuario: req.user.userId }).first();

        const [novoId] = await db('tb_fornecedor_produto').insert({
            id_fornecedor: fornecedor.id,
            id_categoria,
            produto,
            valor_produto,
            imagem // Salva o nome do arquivo no banco
        }).returning('id');

        res.status(201).json({message: 'Produto criado!', id: novoId.id})
    } catch(err){
        console.error(err);
        res.status(500).json({message: 'Erro ao criar produto'});
    }    
});

// PUT com upload.single('imagem')
router.put('/:id', upload.single('imagem'), async (req, res) => {
    const { id } = req.params;
    const { produto, valor_produto, id_categoria} = req.body;
    
    // Se enviou nova imagem, usa o novo nome. Se não, undefined (não atualiza no update)
    const novaImagem = req.file ? req.file.filename : undefined;

    try {
        const fornecedor = await db('tb_fornecedor').where({ id_usuario: req.user.userId }).first();

        const produtoExistente = await db('tb_fornecedor_produto').where({ id, id_fornecedor: fornecedor.id }).first();

        if(!produtoExistente) return res.status(403).json({message: 'Produto não encontrado ou sem permissão'});

        // Monta objeto de update dinamicamente
        const updateData = { 
            produto, 
            valor_produto, 
            id_categoria 
        };

        // Só adiciona imagem ao update se houver um novo arquivo
        if(novaImagem) {
            updateData.imagem = novaImagem;
            
            // Opcional: Aqui você poderia deletar a imagem antiga da pasta uploads usando fs.unlink
            // if(produtoExistente.imagem) fs.unlink(...)
        }

        await db('tb_fornecedor_produto').where({id}).update(updateData);

        res.json({message: 'Produto atualizado!'});
    } catch(err){
        console.error(err)
        res.status(500).json({message: 'Erro ao atualizar'});
    }
});

router.delete('/:id', async (req, res) => {
    // ... (o delete permanece igual, a menos que queira deletar o arquivo físico da pasta uploads também)
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