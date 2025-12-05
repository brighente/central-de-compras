const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../authMiddleware');

router.use(authMiddleware);

router.get('/categorias', async (req, res) => {
    try {
        // O DISTINCT garante que não repetimos categorias, e o JOIN garante que
        // só pegamos categorias que estão sendo usadas na tabela de produtos.
        const categorias = await db('tb_categoria')
            .select('id', 'nome_categoria')
            .orderBy('nome_categoria');

        console.log(`[DEBUG] Encontradas ${categorias.length} categorias.`);

        res.json(categorias);
    } catch (err) {
        console.error("Erro ao buscar categorias:", err);
        res.status(500).json({ message: 'Erro ao buscar categorias' });
    }
});

router.get('/', async (req, res) => {
    try {
        const dadosLoja = await db('tb_loja')
            .join('tb_loja_endereco', 'tb_loja.id', 'tb_loja_endereco.id_loja')
            .where('tb_loja.id_usuario', req.user.userId)
            .select('tb_loja_endereco.estado')
            .first();

        const ufComprador = (dadosLoja && dadosLoja.estado) ? dadosLoja.estado.trim().toUpperCase() : null;

        // Query Principal
        const produtos = await db('tb_fornecedor_produto as prod')
            .join('tb_fornecedor as forn', 'prod.id_fornecedor', 'forn.id')
            .join('tb_categoria as cat', 'prod.id_categoria', 'cat.id')
            .leftJoin('tb_fornecedor_condicao_estado as regra', function() {
                this.on('regra.id_fornecedor', '=', 'forn.id')
                    .andOnVal('regra.estado', '=', ufComprador);
            })
            .select(
                'prod.id',
                'prod.produto',
                'prod.valor_produto',
                'prod.id_fornecedor',
                'prod.id_categoria', // <--- IMPORTANTE PARA O FILTRO NO FRONT
                'forn.nome_fantasia as fornecedor_nome',
                'cat.nome_categoria',
                'regra.acrescimo_desconto_unitario_valor'
            )
            .orderBy('forn.nome_fantasia');

        // Cálculo do preço no JS (Mantido igual)
        const produtosCalculados = produtos.map(item => {
            const valorBase = parseFloat(item.valor_produto);
            let valorFinal = valorBase;
            let temRegra = false;
            let valorRegra = 0;

            if (item.acrescimo_desconto_unitario_valor != null) {
                valorRegra = parseFloat(item.acrescimo_desconto_unitario_valor);
                if (valorRegra !== 0) {
                    valorFinal += valorRegra;
                    temRegra = true;
                }
            }

            return {
                id: item.id,
                produto: item.produto,
                fornecedor_nome: item.fornecedor_nome,
                categoria: item.nome_categoria,
                id_categoria: item.id_categoria, // <--- Passando o ID para o front
                valor_original: valorBase,
                valor_final: valorFinal, 
                regra_aplicada: temRegra,
                uf_usuario: ufComprador
            };
        });

        res.json(produtosCalculados);

    } catch (err) {
        console.error('Erro ao buscar vitrine: ', err);
        res.status(500).json({ message: 'Erro ao carregar produtos' });
    }
});

module.exports = router;