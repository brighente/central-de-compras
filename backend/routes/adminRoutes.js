const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const authMiddleware = require('../authMiddleware');

router.use(authMiddleware);

const gerarSenhaProvisoria = () => {
    return Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
}

router.get('/lista-fornecedores', async (req, res) => {
    try {
        const fornecedores = await db('tb_fornecedor').select('id', 'nome_fantasia', 'cnpj');
        res.json(fornecedores);
    } catch(err) {
        res.status(500).json({ message: 'Erro ao listar fornecedores' });
    }
});

router.get('/lista-categorias', async (req, res) => {
    try{
        const categorias = await db('tb_categoria').select('*');
        res.json(categorias);
    } catch(err) {
        res.status(500).json({ message: 'Erro ao listar categorias' });
    }
});

router.post('/loja', async (req, res) => {
    const {
        cnpj, nome_fantasia, razao_social, email, telefone,
        logradouro, numero, bairro, cidade, estado, cep
    } = req.body;

    const transaction = await db.transaction();

    try{
        const userExists = await transaction('tb_sistema_usuario').where({ email }).first();
        if(userExists){
            throw new Error('Email já cadastrado no sistema.');
        }

        const [conta] = await transaction('tb_sistema_conta').insert({
            nm_conta: nome_fantasia,
            ativo: 1,
            dh_inc: new Date()
        }).returning('id');

        const senhaProvisoria = gerarSenhaProvisoria();
        const senhaHash = await bcrypt.hash(senhaProvisoria, 10);

        const [usuario] = await transaction('tb_sistema_usuario').insert({
            id_conta: conta.id,
            nome: nome_fantasia,
            email: email,
            senha: senhaHash,
            ativo: 1,
            deve_trocar_senha: true
        }).returning('id');

        await transaction('tb_sistema_usuario_perfil').insert({
            id_usuario: usuario.id,
            perfil: 'LOJA'
        });

        const [loja] = await transaction('tb_loja').insert({
            id_conta: conta.id,
            id_usuario: usuario.id,
            cnpj,
            nome_fantasia,
            razao_social,
            dh_inc: new Date(),
            ativo: 1
        }).returning('id');
        
        await transaction('tb_loja_endereco').insert({
            id_loja: loja.id,
            logradouro,
            numero,
            bairro,
            cidade,
            estado,
            cep
        });

        await transaction.commit();

        res.status(201).json({
            message: 'Loja cadastrada com sucesso',
            credenciais: {
                usuario: email,
                senha_temporaria: senhaProvisoria
            }
        });
        
    } catch(err) {
        await transaction.rollback();
        console.error("Erro ao cadastrar loja: ", err);
        res.status(500).json({ message: 'Erro ao cadastrar loja' + err.message });
    }
});

router.post('/fornecedor', async (req, res) => {
    const {
        cnpj, nome_fantasia, razao_social, email, telefone, logradouro, numero, bairro, cidade, estado, cep
    } = req.body;

    const transaction = await db.transaction();

    try{
        const userExists = await transaction('tb_sistema_usuario').where({ email }).first();
        if(userExists){
            throw new Error('Usuario já cadastrado no sistema.');
        }

        const [conta] = await transaction('tb_sistema_conta').insert({
            nm_conta: nome_fantasia,
            ativo: 1,
            dh_inc: new Date()
        }).returning('id');

        const senhaProvisoria = gerarSenhaProvisoria();
        const senhaHash = await bcrypt.hash(senhaProvisoria, 10);

        const [usuario] = await transaction('tb_sistema_usuario').insert({
            id_conta: conta.id,
            nome: nome_fantasia,
            email: email,
            senha: senhaHash,
            ativo: 1,
            deve_trocar_senha: true
        }).returning('id');
        
        await transaction('tb_sistema_usuario_perfil').insert({
            id_usuario: usuario.id,
            perfil: 'FORNECEDOR'
        });

        const [fornecedor] = await transaction('tb_fornecedor').insert({
            id_conta: conta.id,
            id_usuario: usuario.id,
            cnpj,
            nome_fantasia,
            razao_social,
            telefone,
            email_fornecedor: email, 
            dh_inc: new Date(),
            ativo: 1
        }).returning('id');

        await transaction('tb_fornecedor_endereco').insert({
            id_fornecedor: fornecedor.id,
            logradouro,
            numero,
            bairro,
            cidade,
            estado,
            cep,
            dt_inc: new Date()
        });

        await transaction.commit();

        res.status(201).json({
            message: 'Fornecedor cadastrado com sucesso',
            credenciais: {
                usuario: email,
                senha_temporaria: senhaProvisoria
            }
        });

    } catch(err) {
        await transaction.rollback();
        console.error("Erro ao cadastrar novo fornecedor: ", err);
        res.status(500).json({ message: 'Erro ao cadastrar fornecedor: ' + err.message });
    }
});

router.post('/produtos', async (req, res) => {
    const { produto, valor_produto, id_categoria, id_fornecedor } = req.body;

    try{
        const fornecedor = await db('tb_fornecedor').where({ id: id_fornecedor }).first();

        if(!fornecedor){
            return res.status(404).json({ message: 'Fornecedor não encontrado' });
        }

        await db('tb_fornecedor_produto').insert({
            id_fornecedor,
            id_categoria: id_categoria,
            produto,
            valor_produto
        });

        res.status(201).json({ message: 'Produto cadastrado com sucesso' });
    } catch(err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao cadastrar produto' });
    }
});


// =========================================
// ROTAS DE LISTAGEM (Para as Tabelas)
// =========================================

router.get('/lojas', async (req, res) => {
    try {
        // Trazendo dados da Loja + Endereço + Email do Usuário
        const lojas = await db('tb_loja')
            .join('tb_sistema_usuario', 'tb_loja.id_usuario', 'tb_sistema_usuario.id')
            .join('tb_loja_endereco', 'tb_loja.id', 'tb_loja_endereco.id_loja')
            .select(
                'tb_loja.*', 
                'tb_sistema_usuario.email', 
                'tb_loja_endereco.cidade', 
                'tb_loja_endereco.estado'
            );
        res.json(lojas);
    } catch (err) {
        res.status(500).json({ message: 'Erro ao listar lojas.' });
    }
});

router.get('/fornecedores', async (req, res) => {
    try {
        const fornecedores = await db('tb_fornecedor')
            .join('tb_sistema_usuario', 'tb_fornecedor.id_usuario', 'tb_sistema_usuario.id')
            .join('tb_fornecedor_endereco', 'tb_fornecedor.id', 'tb_fornecedor_endereco.id_fornecedor')
            .select(
                'tb_fornecedor.*', 
                'tb_sistema_usuario.email', 
                'tb_fornecedor_endereco.cidade', 
                'tb_fornecedor_endereco.estado'
            );
        res.json(fornecedores);
    } catch (err) {
        res.status(500).json({ message: 'Erro ao listar fornecedores.' });
    }
});

router.get('/produtos', async (req, res) => {
    try {
        const produtos = await db('tb_fornecedor_produto')
            .join('tb_fornecedor', 'tb_fornecedor_produto.id_fornecedor', 'tb_fornecedor.id')
            .join('tb_categoria', 'tb_fornecedor_produto.id_categoria', 'tb_categoria.id')
            .select(
                'tb_fornecedor_produto.*', 
                'tb_fornecedor.nome_fantasia as nome_fornecedor',
                'tb_categoria.nome_categoria'
            );
        res.json(produtos);
    } catch (err) {
        res.status(500).json({ message: 'Erro ao listar produtos.' });
    }
});


// =========================================
// ROTAS DE EDIÇÃO (PUT)
// =========================================

router.put('/loja/:id', async (req, res) => {
    const { id } = req.params;
    const { nome_fantasia, razao_social, telefone, logradouro, numero, bairro, cidade, estado, cep } = req.body;
    
    const trx = await db.transaction();
    try {
        // Atualiza dados da Loja
        await trx('tb_loja').where({ id }).update({ nome_fantasia, razao_social });
        
        // Atualiza Endereço
        await trx('tb_loja_endereco').where({ id_loja: id }).update({
            logradouro, numero, bairro, cidade, estado, cep
        });

        // Nota: Atualizar email/senha é mais complexo (envolve tb_sistema_usuario), 
        // por segurança mantive apenas dados cadastrais aqui.

        await trx.commit();
        res.json({ message: 'Loja atualizada com sucesso!' });
    } catch (err) {
        await trx.rollback();
        res.status(500).json({ message: 'Erro ao atualizar loja.' });
    }
});

router.put('/fornecedor/:id', async (req, res) => {
    const { id } = req.params;
    const { nome_fantasia, razao_social, telefone, logradouro, numero, bairro, cidade, estado, cep } = req.body;

    const trx = await db.transaction();
    try {
        await trx('tb_fornecedor').where({ id }).update({ nome_fantasia, razao_social, telefone });
        
        await trx('tb_fornecedor_endereco').where({ id_fornecedor: id }).update({
            logradouro, numero, bairro, cidade, estado, cep
        });

        await trx.commit();
        res.json({ message: 'Fornecedor atualizado com sucesso!' });
    } catch (err) {
        await trx.rollback();
        res.status(500).json({ message: 'Erro ao atualizar fornecedor.' });
    }
});

router.put('/produto/:id', async (req, res) => {
    const { id } = req.params;
    const { produto, valor_produto, id_categoria, id_fornecedor } = req.body;

    try {
        await db('tb_fornecedor_produto').where({ id }).update({
            produto,
            valor_produto,
            id_categoria,
            id_fornecedor
        });
        res.json({ message: 'Produto atualizado com sucesso!' });
    } catch (err) {
        res.status(500).json({ message: 'Erro ao atualizar produto.' });
    }
});

module.exports = router;

// =========================================
// ROTAS DE EXCLUSÃO (DELETE)
// =========================================

router.delete('/loja/:id', async (req, res) => {
    const { id } = req.params;
    const trx = await db.transaction(); // Transação para apagar tudo (Endereço, User, Loja)
    try {
        const loja = await trx('tb_loja').where({ id }).first();
        if(!loja) throw new Error('Loja não encontrada');

        await trx('tb_loja_endereco').where({ id_loja: id }).del();
        await trx('tb_loja').where({ id }).del();
        await trx('tb_sistema_usuario').where({ id: loja.id_usuario }).del(); // Opcional: Apagar o usuário de login também
        
        await trx.commit();
        res.json({ message: 'Loja excluída com sucesso!' });
    } catch (err) {
        await trx.rollback();
        res.status(500).json({ message: 'Erro ao excluir loja: ' + err.message });
    }
});

router.delete('/fornecedor/:id', async (req, res) => {
    const { id } = req.params;
    const trx = await db.transaction();
    try {
        const fornecedor = await trx('tb_fornecedor').where({ id }).first();
        if(!fornecedor) throw new Error('Fornecedor não encontrado');

        await trx('tb_fornecedor_endereco').where({ id_fornecedor: id }).del();
        // Nota: Produtos e Regras tem FK. Idealmente deletar eles antes ou usar CASCADE no banco.
        // Aqui vou tentar deletar o fornecedor, se tiver produto vai dar erro de FK (proteção do banco).
        await trx('tb_fornecedor').where({ id }).del();
        await trx('tb_sistema_usuario').where({ id: fornecedor.id_usuario }).del();

        await trx.commit();
        res.json({ message: 'Fornecedor excluído com sucesso!' });
    } catch (err) {
        await trx.rollback();
        res.status(400).json({ message: 'Erro! Talvez este fornecedor tenha produtos/pedidos vinculados.' });
    }
});

router.delete('/produto/:id', async (req, res) => {
    try {
        await db('tb_fornecedor_produto').where({ id: req.params.id }).del();
        res.json({ message: 'Produto excluído!' });
    } catch (err) {
        res.status(400).json({ message: 'Erro ao excluir (possui vendas vinculadas?)' });
    }
});

module.exports = router;

module.exports = router;