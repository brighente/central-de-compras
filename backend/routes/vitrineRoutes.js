const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../authMiddleware');

router.use(authMiddleware);

// --- ROTA DE CATEGORIAS ---
router.get('/categorias', async (req, res) => {
    try {
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

// --- ROTA PRINCIPAL DA VITRINE ---
router.get('/', async (req, res) => {
    try {
        // 1. Pega UF da loja (comprador)
        const dadosLoja = await db('tb_loja')
            .join('tb_loja_endereco', 'tb_loja.id', 'tb_loja_endereco.id_loja')
            .where('tb_loja.id_usuario', req.user.userId)
            .select('tb_loja_endereco.estado')
            .first();

        const ufComprador = (dadosLoja && dadosLoja.estado) ? dadosLoja.estado.trim().toUpperCase() : null;

        // 2. Query Principal
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
                'prod.id_categoria',
                'prod.imagem as imagem_bruta', // Renomeei para evitar confusão na lógica abaixo
                'forn.nome_fantasia as fornecedor_nome',
                'cat.nome_categoria',
                'regra.acrescimo_desconto_unitario_valor'
            )
            .orderBy('forn.nome_fantasia');

        // 3. Processamento dos dados (Cálculo de Preço + Tratamento de Imagem)
        const produtosCalculados = produtos.map(item => {
            
            // --- CÁLCULO DE PREÇO ---
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

            // --- LÓGICA DE TRATAMENTO DE IMAGEM ---
            let imgFinal = null;
            if (item.imagem_bruta) {
                // Se for URL completa (ex: link externo), usa ela
                if (item.imagem_bruta.startsWith('http')) {
                    imgFinal = item.imagem_bruta;
                } else {
                    // Se for caminho local salvo pelo Multer
                    // 1. Corrige as barras invertidas do Windows
                    let pathCorrigido = item.imagem_bruta.replace(/\\/g, '/');
                    
                    // 2. Remove barra inicial se tiver (ex: /uploads/foto.jpg -> uploads/foto.jpg)
                    if (pathCorrigido.startsWith('/')) {
                        pathCorrigido = pathCorrigido.substring(1);
                    }

                    // 3. SE O BANCO SÓ SALVOU O NOME DO ARQUIVO (ex: "foto.jpg")
                    // e não "uploads/foto.jpg", adiciona a pasta manualmente:
                    if (!pathCorrigido.includes('uploads/')) {
                         pathCorrigido = `uploads/${pathCorrigido}`;
                    }

                    // Monta a URL final usando o protocolo e host do request atual
                    imgFinal = `${req.protocol}://${req.get('host')}/${pathCorrigido}`;
                }
            }

            // --- RETORNO DO OBJETO ---
            return {
                id: item.id,
                id_fornecedor: item.id_fornecedor,
                produto: item.produto,
                fornecedor_nome: item.fornecedor_nome,
                categoria: item.nome_categoria,
                id_categoria: item.id_categoria,
                valor_original: valorBase,
                valor_final: valorFinal,
                regra_aplicada: temRegra,
                uf_usuario: ufComprador,
                imagemUrl: imgFinal // Campo que o Frontend espera
            };
        });

        res.json(produtosCalculados);

    } catch (err) {
        console.error('Erro ao buscar vitrine: ', err);
        res.status(500).json({ message: 'Erro ao carregar produtos' });
    }
});

module.exports = router;