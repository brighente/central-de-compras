const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../authMiddleware');

router.use(authMiddleware);

router.get('/loja', async (req, res) => {
    try {
        const dadosLoja = await db('tb_loja')
            .join('tb_sistema_usuario', 'tb_loja.id_usuario', 'tb_sistema_usuario.id')
            .select(
                'tb_loja.*', 
                'tb_sistema_usuario.email as email_login'
            )
            .where({ 'tb_loja.id_usuario': req.user.userId })
            .first();

        if (!dadosLoja) {
            return res.status(404).json({ message: 'Loja não encontrada.' });
        }

        const endereco = await db('tb_loja_endereco')
            .where({ id_loja: dadosLoja.id })
            .first();

        const contatos = await db('tb_loja_contato')
            .where({ id_loja: dadosLoja.id })
            .orderBy('id', 'asc');

        res.json({
            ...dadosLoja,
            ...(endereco || { cep: '', logradouro: '', numero: '', bairro: '', cidade: '', estado: '' }),
            contatos: contatos
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao buscar perfil da loja.' });
    }
});

router.put('/loja', async (req, res) => {
    const { 
        razao_social, nome_fantasia, cnpj, 
        cep, logradouro, numero, bairro, cidade, estado 
    } = req.body;

    const trx = await db.transaction();

    try {
        const loja = await trx('tb_loja').where({ id_usuario: req.user.userId }).first();

        if (!loja) {
            await trx.rollback();
            return res.status(404).json({ message: 'Loja não encontrada.' });
        }

        await trx('tb_loja')
            .where({ id: loja.id })
            .update({
                razao_social,
                nome_fantasia,
                cnpj
            });

        const temEndereco = await trx('tb_loja_endereco').where({ id_loja: loja.id }).first();

        const dadosEndereco = {
            cep, logradouro, numero, bairro, cidade, estado
        };

        if (temEndereco) {
            await trx('tb_loja_endereco')
                .where({ id_loja: loja.id })
                .update(dadosEndereco);
        } else {
            await trx('tb_loja_endereco').insert({
                id_loja: loja.id,
                ...dadosEndereco
            });
        }

        await trx.commit();
        res.json({ message: 'Dados atualizados com sucesso!' });

    } catch (err) {
        await trx.rollback();
        console.error(err);
        res.status(500).json({ message: 'Erro ao atualizar dados.' });
    }
});

router.post('/loja/contatos', async (req, res) => {
    const { contatos } = req.body;
    const trx = await db.transaction();

    try {
        const loja = await trx('tb_loja').where({ id_usuario: req.user.userId }).first();

        if (!loja) {
            await trx.rollback();
            return res.status(404).json({ message: 'Loja não encontrada.' });
        }

        await trx('tb_loja_contato').where({ id_loja: loja.id }).del();

        if (contatos && contatos.length > 0) {
            const novosContatos = contatos
                .filter(c => c.nome && c.nome.trim() !== '')
                .map(c => ({
                    id_loja: loja.id,
                    nome: c.nome,
                    cargo: c.cargo,
                    email: c.email,
                    telefone: c.telefone
                }));
            
            if (novosContatos.length > 0) {
                await trx('tb_loja_contato').insert(novosContatos);
            }
        }

        await trx.commit();
        res.json({ message: 'Contatos atualizados com sucesso!' });

    } catch (err) {
        await trx.rollback();
        console.error(err);
        res.status(500).json({ message: 'Erro ao salvar contatos.' });
    }
});

module.exports = router;