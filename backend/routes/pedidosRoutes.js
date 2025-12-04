const express = require('express')
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../authMiddleware');

router.use(authMiddleware);

router.post('/', async (req, res) => {
    const { itens } = req.body;
    const idUsuarioLogado = req.user.userId;

    if (!itens || itens.length === 0) {
        return res.status(400).json({ message: 'O pedido não pode estar vazio!' });
    }

    const transaction = await db.transaction();

    try {
        const loja = await transaction('tb_loja')
            .join('tb_loja_endereco', 'tb_loja.id', 'tb_loja_endereco.id_loja')
            .where({ 'tb_loja.id_usuario': idUsuarioLogado })
            .select('tb_loja.id', 'tb_loja.id_conta', 'tb_loja_endereco.estado').first();

        if (!loja) {
            throw new Error('Usuario logado não é uma loja válida.')
        }

        const itensPorFornecedor = {};

        for (const item of itens) {
            const produtoInfo = await transaction('tb_fornecedor_produto').where({ id: item.id_produto }).first();

            if (!produtoInfo) {
                throw new Error(`Produto de ID: ${item.id_produto} não encontrado!`)
            }

            const idFornecedor = produtoInfo.id_fornecedor;

            if (!itensPorFornecedor[idFornecedor]) {
                itensPorFornecedor[idFornecedor] = [];
            }

            itensPorFornecedor[idFornecedor].push({
                id_produto: item.id_produto,
                quantidade: item.quantidade,
                valor_unitario: produtoInfo.valor_produto,
                produto_nome: produtoInfo.produto
            });
        }

        const idsPedidosCriados = [];

        for (const idForn of Object.keys(itensPorFornecedor)) {
            const listaItens = itensPorFornecedor[idForn];

            const regra = await transaction('tb_fornecedor_condicao_estado')
                .where({ id_fornecedor: idForn, estado: loja.estado }).first();

            let ajustePreco = 0;
            let percentualCashback = 0;

            if (regra) {
                ajustePreco = parseFloat(regra.acrescimo_desconto_unitario_valor || 0);
                percentualCashback = parseFloat(regra.valor_cashback_percentual || 0);
            }

            const valorTotalPedido = listaItens.reduce((acumulador, item) => {
                const precoFinal = parseFloat(item.valor_unitario) + ajustePreco;
                return acumulador + (item.quantidade * precoFinal);
            }, 0);

            const [pedidoCriado] = await transaction('tb_pedido').insert({
                id_fornecedor: idForn,
                id_loja: loja.id,
                dt_inc: new Date(),
                status: 'PENDENTE',
                vl_total_pedido: valorTotalPedido
            }).returning('id');

            const idPedidoGerado = pedidoCriado.id || pedidoCriado;

            idsPedidosCriados.push(idPedidoGerado);

            const itensParaInserir = listaItens.map((item) => {
                const precoFinalItem = parseFloat(item.valor_unitario) + ajustePreco;

                return {
                    id_pedido: idPedidoGerado,
                    id_produto: item.id_produto,
                    quantidade: item.quantidade,
                    valor_unitario_praticado: precoFinalItem
                }
            });

            await transaction('tb_pedido_item').insert(itensParaInserir);

            if (percentualCashback > 0) {
                const valorGerado = valorTotalPedido * (percentualCashback / 100);

                await transaction('tb_loja_cashback').insert({
                    id_loja: loja.id,
                    id_fornecedor: idForn,
                    id_pedido: idPedidoGerado,
                    vl_previsto: valorGerado,
                    vl_realizado: 0,
                    pago: 0,
                    dt_inc: new Date()
                });
                console.log(`Cashback de R$ ${valorGerado} gerado para o pedido: #${idPedidoGerado}`);
            }
        } 

        await transaction.commit();
        res.json({ message: 'Pedido realizado!', pedidosIds: idsPedidosCriados })
    } catch (err) {
        await transaction.rollback();
        console.error("Erro ao processar o pedido ", err);
        res.status(500).json({ message: 'Erro ao processar o pedido: ' + err.message })
    }
});

router.get('/fornecedor', async (req, res) => {
    const idUsuarioLogado = req.user.userId;

    console.log(`LOG: Buscando pedidos para o usuário ${idUsuarioLogado}`);

    try{
        const fornecedor = await db('tb_fornecedor').where({id_usuario: idUsuarioLogado}).first(); // Seleciona o fornecedor baseado no idLogado

        if(!fornecedor){
            return res.status(404).json({message: 'Fornecedor não encontrado'})
        }

        // Dados de pedidos vindos do banco
        const pedidos = await db('tb_pedido AS ped')
            .join('tb_loja AS loja', 'ped.id_loja', 'loja.id' )
            .where('ped.id_fornecedor', fornecedor.id)
            .select(
                'ped.id',
                'ped.dt_inc',
                'ped.status',
                'ped.vl_total_pedido',
                'loja.nome_fantasia AS loja_nome'
            )
            .orderBy('ped.id', 'asc');

        if(pedidos.length === 0){
            return res.json([]);
        }

        const pedidoIds = pedidos.map( (p) => {
            return p.id
        });

        // Pega os itens do pedido
        const itens = await db('tb_pedido_item AS pi')
            .join('tb_fornecedor_produto AS prod', 'pi.id_produto', 'prod.id')
            .join('tb_categoria AS cat', 'prod.id_categoria', 'cat.id')
            .leftJoin('tb_loja_cashback AS cb', 'pi.id_pedido', 'cb.id_pedido')
            .whereIn('pi.id_pedido', pedidoIds)
            .select(
                'pi.id_pedido',
                'prod.produto AS nome_produto',
                'cat.nome_categoria AS categoria_produto',
                'pi.quantidade',
                'pi.valor_unitario_praticado',
                'cb.vl_previsto AS cashback_fornecido'
            );

        // Junta os pedidos com seus itens em um array completo
        const pedidosComItens = pedidos.map( (pedido) => {
            return {
                ...pedido,
                itens: itens.filter( item => item.id_pedido === pedido.id)
            }
        });

        res.json(pedidosComItens);

    } catch(err){
        console.error("Erro ao buscar pedidos: ", err);
        return res.status(500).json({message: 'Erro interno no servidor'});
    }
});

router.get('/loja', async (req, res) => {
    const idUsuarioLogado = req.user.userId;

    try {
        const loja = await db('tb_loja').where({ id_usuario: idUsuarioLogado }).first();

        if(!loja){
            return res.status(404).json({ message: 'Loja não encontrada.'});

        }

        const pedidos = await db('tb_pedido AS ped')
            .join('tb_fornecedor AS forn', 'ped.id_fornecedor', 'forn.id')
            .leftJoin('tb_loja_cashback AS cb', 'ped.id', 'cb.id_pedido')
            .where('ped.id_loja', loja.id)
            .select(
                'ped.id',
                'ped.dt_inc',
                'ped.status',
                'ped.vl_total_pedido',
                'forn.nome_fantasia AS fornecedor_nome',
                'cb.vl_previsto as cashback_ganho'
            )
            .orderBy('ped.id', 'desc');

        if(pedidos.length === 0){
            return res.json([]);
        }

        const pedidoIds = pedidos.map(p => p.id);

        const itens = await db('tb_pedido_item AS pi')
            .join('tb_fornecedor_produto AS prod', 'pi.id_produto', 'prod.id')
            .whereIn('pi.id_pedido', pedidoIds)
            .select(
                'pi.id_pedido',
                'prod.produto AS nome_produto',
                'pi.quantidade',
                'pi.valor_unitario_praticado'
            );

        const pedidosComItens = pedidos.map( (pedido) => {
            return {
                ...pedido,
                itens: itens.filter( item => item.id_pedido === pedido.id)
            }
        });

        res.json(pedidosComItens);
    } catch(err){
        console.error(err)
        res.status(500).json({message: 'Erro ao buscar histórico.'});
    }
});

router.patch('/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const statusPermitidos = ['PENDENTE', 'SEPARADO', 'ENVIADO', 'CANCELADO'];
    if(!statusPermitidos.includes(status)){
        res.status(400).json({message: 'Status Inválido'})
    }

    try {
        const fornecedor = await db('tb_fornecedor').where({id_usuario: req.user.userId}).first();

        if(!fornecedor){
            return res.status(404).json({message: 'Fornecedor não encontrado'})
        }

        const pedido = await db('tb_pedido').where({id: id, id_fornecedor: fornecedor.id}).first();

        if(!pedido){
            return res.status(404).json({message: 'Pedido não encontrado ou não pertence a você'})
        }

        await db('tb_pedido').where({id: id}).update({status: status});

        res.json({message: `Pedido #${id} atualizado para ${status} com sucesso!`});
    } catch(err){
        console.error("Erro ao atualizar pedido: ", err);
        res.status(500).json({message: 'Erro interno'});
    }
});

module.exports = router;