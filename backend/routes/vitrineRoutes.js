const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../authMiddleware');

router.use(authMiddleware);

router.get('/', async (req, res) => {
    try {
        // 1. Buscar dados do usuário (Comprador)
        const dadosLoja = await db('tb_loja')
            .join('tb_loja_endereco', 'tb_loja.id', 'tb_loja_endereco.id_loja')
            .where('tb_loja.id_usuario', req.user.userId)
            .select('tb_loja_endereco.estado')
            .first();

        // Tratamento de segurança para garantir formato correto (ex: "SP")
        const ufComprador = (dadosLoja && dadosLoja.estado) 
            ? dadosLoja.estado.trim().toUpperCase() 
            : null;

        console.log(`[VITRINE] Comprador ID: ${req.user.userId} | Estado Base: ${ufComprador}`);

        // 2. Query Principal
        const produtos = await db('tb_fornecedor_produto as prod')
            .join('tb_fornecedor as forn', 'prod.id_fornecedor', 'forn.id')
            .join('tb_categoria as cat', 'prod.id_categoria', 'cat.id')
            // JOIN DA REGRA: Busca regra ONDE o fornecedor é o dono do produto E o estado bate com o do comprador
            .leftJoin('tb_fornecedor_condicao_estado as regra', function() {
                this.on('regra.id_fornecedor', '=', 'forn.id')
                    .andOnVal('regra.estado', '=', ufComprador); // .onVal é mais seguro que db.raw para valores simples
            })
            .select(
                'prod.id',
                'prod.produto',
                'prod.valor_produto',
                'prod.id_fornecedor', // Útil para debug
                'forn.nome_fantasia as fornecedor_nome',
                'cat.nome_categoria',
                // Trazemos as colunas da regra
                'regra.acrescimo_desconto_unitario_valor'
            )
            .orderBy('forn.nome_fantasia');

        // 3. Cálculo do preço final no JavaScript
        const produtosCalculados = produtos.map(item => {
            const valorBase = parseFloat(item.valor_produto);
            let valorFinal = valorBase;
            let temRegra = false;
            let valorRegra = 0;

            // Verificação robusta: se não for null nem undefined
            if (item.acrescimo_desconto_unitario_valor != null) {
                valorRegra = parseFloat(item.acrescimo_desconto_unitario_valor);
                
                // Só aplica se o valor for diferente de zero (opcional, mas bom pra evitar logs desnecessários)
                if (valorRegra !== 0) {
                    valorFinal += valorRegra;
                    temRegra = true;
                }
            }

            // LOG DE DEBUG (Apague depois que funcionar)
            // Se tiver regra aplicada, mostra no terminal para confirmar
            if (temRegra) {
                console.log(`[REGRA APLICADA] Produto: ${item.produto} (Forn ID: ${item.id_fornecedor}) | Base: ${valorBase} + Ajuste: ${valorRegra} = Final: ${valorFinal}`);
            }

            return {
                id: item.id,
                produto: item.produto,
                fornecedor_nome: item.fornecedor_nome,
                categoria: item.nome_categoria,
                valor_original: valorBase,
                valor_final: valorFinal, 
                regra_aplicada: temRegra,
                uf_usuario: ufComprador // Passamos isso pro front poder mostrar "Regra de SP aplicada"
            };
        });

        res.json(produtosCalculados);

    } catch (err) {
        console.error('Erro ao buscar vitrine: ', err);
        res.status(500).json({ message: 'Erro ao carregar produtos' });
    }
});

module.exports = router;