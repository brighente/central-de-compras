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
            id_conta: fornecedor.id_conta,
            id_usuario: fornecedor.id_usuario,
            id_categoria: id_categoria,
            produto,
            valor_produto,
            dt_inc: new Date()
        });

        res.status(201).json({ message: 'Produto cadastrado com sucesso' });
    } catch(err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao cadastrar produto' });
    }
});

module.exports = router;