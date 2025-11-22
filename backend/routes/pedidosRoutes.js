const express = require('express')
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../authMiddleware');

router.use(authMiddleware);

router.post('/', async (req, res) => {
    const {itens} = req.body;
    const idUsuarioLogado = req.user.userId;

    if(!itens || itens.length === 0) {
        return res.status(400).json({message: 'O pedido não pode estar vazio!'});
    }

    const transaction = await db.transaction();

    try {
        const loja = await transaction('tb_loja').where({ id_usuario: idUsuarioLogado }).first();

        if(!loja){
            throw new Error('Usuario logado não é uma loja válida.')
        }

        const itensPorFornecedor = {};

        for(const item of itens){
            const produtoInfo = await transaction('tb_fornecedor_produto').where({id: item.id_produto}).first();

            if(!produtoInfo){
                throw new Error(`Produto de ID: ${item.id_produto} não encontrado!`)
            }

            const idFornecedor = produtoInfo.id_fornecedor;

            if(!itensPorFornecedor[idFornecedor]){
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

        for(const idForn of Object.keys(itensPorFornecedor)){
            const listaItens = itensPorFornecedor[idForn];

            const valorTotalPedido = listaItens.reduce((acumulador, item) => {
                return acumulador + (item.quantidade * item.valor_unitario);  // Calcula o valor total com base no valor da tabela (segurança)
            }, 0);

            const [pedidoCriado] = await transaction('tb_pedido').insert({
                id_fornecedor: idForn,
                id_loja: loja.id,
                dt_inc: new Date(),
                status: 'PENDENTE',
                vl_total_pedido: valorTotalPedido
            }).returning('id');

            idsPedidosCriados.push(pedidoCriado.id);

            const itensParaInserir = listaItens.map((item) => {
                return {
                    id_pedido: pedidoCriado.id,
                    id_produto: item.id_produto,
                    quantidade: item.quantidade,
                    valor_unitario_praticado: item.valor_unitario
                }
            });

            await transaction('tb_pedido_item').insert(itensParaInserir);
        }

        await transaction.commit(); // Confirma a transação 
        console.log(`LOG: Pedidos criados :${idsPedidosCriados.join(', ')}`);
        res.json({message: 'Pedido realizado!', pedidosIds: idsPedidosCriados})
    } catch(err){
        await transaction.rollback(); // Cancela todas as transaçõe caso de erro em alguma no meio
        console.error("Erro ao processar o pedido ", err);
        res.status(500).json({message: 'Erro ao processar o pedido: ' + err.message})
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
            .whereIn('pi.id_pedido', pedidoIds)
            .select(
                'pi.id_pedido',
                'prod.produto AS nome_produto',
                'cat.nome_categoria AS categoria_produto',
                'pi.quantidade',
                'pi.valor_unitario_praticado' 
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
            .where('ped.id_loja', loja.id)
            .select(
                'ped.id', 'ped.dt_inc', 'ped.status', 'ped.vl_total_pedido', 'forn.nome_fantasia AS fornecedor_nome'
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