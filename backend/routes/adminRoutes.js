const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const authMiddleware = require('../authMiddleware');

router.use(authMiddleware);

const gerarSenhaProvisoria = () => {
    return Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
}

// 🎯 NOVO: Função para remover caracteres não numéricos de campos mascarados
const sanitizeMaskedField = (value) => {
    return value ? value.replace(/\D/g, '') : null;
};

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

// =========================================
// ROTAS DE CADASTRO (POST) - Sanitizado
// =========================================

router.post('/loja', async (req, res) => {
    let {
        cnpj, nome_fantasia, razao_social, email, telefone,
        logradouro, numero, bairro, cidade, estado, cep
    } = req.body;

    // SANITIZAÇÃO DE DADOS MASCARADOS
    cnpj = sanitizeMaskedField(cnpj);
    telefone = sanitizeMaskedField(telefone);
    cep = sanitizeMaskedField(cep);

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
        res.status(500).json({ message: 'Erro ao cadastrar loja: ' + err.message });
    }
});

router.post('/fornecedor', async (req, res) => {
    let {
        cnpj, nome_fantasia, razao_social, email, telefone, logradouro, numero, bairro, cidade, estado, cep
    } = req.body;

    // SANITIZAÇÃO DE DADOS MASCARADOS
    cnpj = sanitizeMaskedField(cnpj);
    telefone = sanitizeMaskedField(telefone);
    cep = sanitizeMaskedField(cep);

    const transaction = await db.transaction();

    try{
        const userExists = await transaction('tb_sistema_usuario').where({ email }).first();
        if(userExists){
            throw new Error('Usuario já cadastrado no sistema.');
        }
        
        // ... (criação de conta e usuário)

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
        
        // ... (retorno de sucesso)

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
    // Sem campos mascarados aqui, apenas o valor do produto que o frontend já sanitiza.
    
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

// ... (Rotas GET permanecem iguais)
router.get('/lojas', async (req, res) => {
    try {
        // Trazendo dados da Loja + Endereço + Email do Usuário
        const lojas = await db('tb_loja')
            .leftJoin('tb_sistema_usuario', 'tb_loja.id_usuario', 'tb_sistema_usuario.id')
            .leftJoin('tb_loja_endereco', 'tb_loja.id', 'tb_loja_endereco.id_loja')
            .select(
                'tb_loja.*', 
                'tb_sistema_usuario.email', 
                'tb_loja_endereco.logradouro',
                'tb_loja_endereco.numero',
                'tb_loja_endereco.bairro',
                'tb_loja_endereco.cidade', 
                'tb_loja_endereco.estado',
                'tb_loja_endereco.cep'
            );
        res.json(lojas);
    } catch (err) {
        res.status(500).json({ message: 'Erro ao listar lojas.' });
    }
});

router.get('/fornecedores', async (req, res) => {
    try {
        const fornecedores = await db('tb_fornecedor')
            .leftJoin('tb_sistema_usuario', 'tb_fornecedor.id_usuario', 'tb_sistema_usuario.id')
            .leftJoin('tb_fornecedor_endereco', 'tb_fornecedor.id', 'tb_fornecedor_endereco.id_fornecedor')
            .select(
                'tb_fornecedor.*', 
                'tb_sistema_usuario.email', 
                'tb_fornecedor_endereco.logradouro',
                'tb_fornecedor_endereco.numero',
                'tb_fornecedor_endereco.bairro',
                'tb_fornecedor_endereco.cidade', 
                'tb_fornecedor_endereco.estado',
                'tb_fornecedor_endereco.cep'
            );

        res.json(fornecedores);
    } catch (err) {
        console.error(err); // Importante para ver o erro real no terminal
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
// ROTAS DE EDIÇÃO (PUT) - Sanitizado
// =========================================

router.put('/loja/:id', async (req, res) => {
    const { id } = req.params;
    let { nome_fantasia, razao_social, telefone, logradouro, numero, bairro, cidade, estado, cep } = req.body;
    
    // SANITIZAÇÃO DE DADOS MASCARADOS
    telefone = sanitizeMaskedField(telefone);
    cep = sanitizeMaskedField(cep);

    const trx = await db.transaction();
    try {
        // Atualiza dados da Loja
        await trx('tb_loja').where({ id }).update({ nome_fantasia, razao_social, telefone });
        
        // Atualiza Endereço
        await trx('tb_loja_endereco').where({ id_loja: id }).update({
            logradouro, numero, bairro, cidade, estado, cep
        });

        await trx.commit();
        res.json({ message: 'Loja atualizada com sucesso!' });
    } catch (err) {
        await trx.rollback();
        console.error("Erro ao atualizar loja:", err);
        res.status(500).json({ message: 'Erro ao atualizar loja.' });
    }
});

router.put('/fornecedor/:id', async (req, res) => {
    const { id } = req.params;
    let { nome_fantasia, razao_social, telefone, logradouro, numero, bairro, cidade, estado, cep } = req.body;

    // SANITIZAÇÃO DE DADOS MASCARADOS
    telefone = sanitizeMaskedField(telefone);
    cep = sanitizeMaskedField(cep);

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
        console.error("Erro ao atualizar fornecedor:", err);
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
        console.error("Erro ao atualizar produto:", err);
        res.status(500).json({ message: 'Erro ao atualizar produto.' });
    }
});

// ... (Rotas DELETE permanecem iguais)

// =========================================
// ROTAS DE EXCLUSÃO (DELETE)
// =========================================

router.delete('/loja/:id', async (req, res) => {
    const { id } = req.params;
    
    await db.transaction(async (trx) => {
        try {
            // 1. Busca a loja e salva o ID do usuário para usar no final
            const loja = await trx('tb_loja').where({ id }).first();
            if(!loja) throw new Error('Loja não encontrada');
            
            const idUsuario = loja.id_usuario; 

            // 2. Limpa dados vinculados à Loja (Pedidos, Itens, Endereço)
            const pedidos = await trx('tb_pedido').where({ id_loja: id }).select('id');
            const idsPedidos = pedidos.map(p => p.id);

            if(idsPedidos.length > 0){
                await trx('tb_pedido_item').whereIn('id_pedido', idsPedidos).del();
                await trx('tb_pedido').whereIn('id', idsPedidos).del();
            }

            await trx('tb_loja_endereco').where({ id_loja: id }).del();
            // await trx('tb_loja_cashback').where({ id_loja: id }).del(); // Descomente se existir

            // 3. Apaga a Loja
            await trx('tb_loja').where({ id }).del();

            // 4. Agora apaga o Usuário e seus Perfis
            if (idUsuario) {
                // PRIMEIRO: Apaga os perfis vinculados a esse usuário
                await trx('tb_sistema_usuario_perfil').where({ id_usuario: idUsuario }).del();
                
                // SEGUNDO: Apaga o usuário
                await trx('tb_sistema_usuario').where({ id: idUsuario }).del();
            }

            res.json({ message: 'Loja e dados vinculados excluídos com sucesso.' });

        } catch (err) {
            console.error("Erro ao excluir loja:", err);
            // O rollback é automático em caso de erro
            res.status(500).json({ message: 'Erro ao excluir loja: ' + err.message });
        }
    });
});

router.delete('/fornecedor/:id', async (req, res) => {
    const { id } = req.params;

    await db.transaction(async (trx) => {
        try {
            // 1. Busca fornecedor e guarda ID do usuário
            const fornecedor = await trx('tb_fornecedor').where({ id }).first();
            if(!fornecedor) throw new Error('Fornecedor não encontrado');

            const idUsuario = fornecedor.id_usuario; 

            // 2. Limpa produtos e vínculos em pedidos
            const produtos = await trx('tb_fornecedor_produto').where({ id_fornecedor: id }).select('id');
            const idsProdutos = produtos.map(p => p.id);

            if(idsProdutos.length > 0){
                await trx('tb_pedido_item').whereIn('id_produto', idsProdutos).del();
                await trx('tb_fornecedor_produto').whereIn('id', idsProdutos).del();
            }

            // 3. Limpa dados do Fornecedor
            await trx('tb_fornecedor_endereco').where({ id_fornecedor: id }).del();
            await trx('tb_fornecedor_campanha').where({ id_fornecedor: id }).del();
            await trx('tb_fornecedor_condicao_estado').where({ id_fornecedor: id }).del();
            await trx('tb_fornecedor_condicao_pagamento').where({ id_fornecedor: id }).del();

            // 4. Apaga o Fornecedor
            await trx('tb_fornecedor').where({ id }).del();

            // 5. Apaga Usuário e Perfil
            if (idUsuario) {
                // PRIMEIRO: Perfis
                await trx('tb_sistema_usuario_perfil').where({ id_usuario: idUsuario }).del();
                
                // SEGUNDO: Usuário
                await trx('tb_sistema_usuario').where({ id: idUsuario }).del();
            }

            res.json({ message: 'Fornecedor excluído com sucesso.' });

        } catch (err) {
            console.error("Erro ao excluir fornecedor:", err);
            res.status(500).json({ message: 'Erro ao excluir fornecedor: ' + err.message });
        }
    });
});

router.delete('/produto/:id', async (req, res) => {
    const { id } = req.params;
    
    await db.transaction(async (trx) => {
        try {
            // 1. Remove este produto de qualquer pedido existente (limpeza forçada)
            await trx('tb_pedido_item').where({ id_produto: id }).del();

            // 2. Remove o produto
            await trx('tb_fornecedor_produto').where({ id }).del();

            res.json({ message: 'Produto excluído com sucesso!' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Erro ao excluir produto.' });
        }
    });
});

module.exports = router;