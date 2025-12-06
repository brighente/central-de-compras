const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../authMiddleware');

router.use(authMiddleware);

const mapTipoRegraToDB = (tipo) => {
    if (tipo === 'VALOR') return 'VALOR_PEDIDO';
    if (tipo === 'QUANTIDADE') return 'QTD_PRODUTO';
    return 'VALOR_PEDIDO';
};

const mapTipoRegraFromDB = (tipoDB) => {
    if (tipoDB === 'VALOR_PEDIDO') return 'VALOR';
    if (tipoDB === 'QTD_PRODUTO') return 'QUANTIDADE';
    return 'VALOR';
};


router.get('/fornecedor', async (req, res) => {
    try {
        const fornecedor = await db('tb_fornecedor').where({ id_usuario: req.user.userId }).first();
        
        if (!fornecedor) return res.status(404).json({ message: 'Fornecedor não encontrado' });

        const campanhas = await db('tb_fornecedor_campanha')
            .where({ id_fornecedor: fornecedor.id })
            .orderBy('dt_inc', 'desc');

        const formatadas = campanhas.map(c => ({
            id: c.id,
            descricao: c.descricao_campanha,
            tipo_regra: mapTipoRegraFromDB(c.tipo_regra),
            desconto_percentual: c.percentual_desconto, 
            
            gatilho: mapTipoRegraFromDB(c.tipo_regra) === 'QUANTIDADE' ? c.quantidade_meta : c.valor_meta,
            dias_duracao: c.tempo_duracao_campanha
        }));

        res.json(formatadas);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao listar campanhas' });
    }
});

router.post('/', async (req, res) => {
    const { descricao, tipo_regra, gatilho, desconto_percentual, dias_duracao } = req.body;

    try {
        const fornecedor = await db('tb_fornecedor').where({ id_usuario: req.user.userId }).first();
        const usuario = await db('tb_sistema_usuario').where({ id: req.user.userId }).first();

        const dbTipoRegra = mapTipoRegraToDB(tipo_regra);
        
        const valorMeta = dbTipoRegra === 'VALOR_PEDIDO' ? parseFloat(gatilho) : 0;
        const qtdMeta = dbTipoRegra === 'QTD_PRODUTO' ? parseInt(gatilho) : 0;

        await db('tb_fornecedor_campanha').insert({
            id_fornecedor: fornecedor.id,
            id_usuario: req.user.userId,
            id_conta: usuario.id_conta,
            descricao_campanha: descricao,
            tipo_regra: dbTipoRegra, 
            valor_meta: valorMeta,
            quantidade_meta: qtdMeta,
            percentual_desconto: parseFloat(desconto_percentual), 
            tempo_duracao_campanha: parseInt(dias_duracao),
            dt_inc: new Date(),
            quantidade_atingida: 0,
            valor_atingido: 0
        });

        res.status(201).json({ message: 'Campanha criada com sucesso!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao criar campanha: ' + err.message });
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { descricao, tipo_regra, gatilho, desconto_percentual, dias_duracao } = req.body;

    try {
        const fornecedor = await db('tb_fornecedor').where({ id_usuario: req.user.userId }).first();

        const dbTipoRegra = mapTipoRegraToDB(tipo_regra);

        const valorMeta = dbTipoRegra === 'VALOR_PEDIDO' ? parseFloat(gatilho) : 0;
        const qtdMeta = dbTipoRegra === 'QTD_PRODUTO' ? parseInt(gatilho) : 0;

        const update = await db('tb_fornecedor_campanha')
            .where({ id: id, id_fornecedor: fornecedor.id })
            .update({
                descricao_campanha: descricao,
                tipo_regra: dbTipoRegra,
                valor_meta: valorMeta,
                quantidade_meta: qtdMeta,
                percentual_desconto: parseFloat(desconto_percentual),
                tempo_duracao_campanha: parseInt(dias_duracao)
            });

        if (update) res.json({ message: 'Campanha atualizada!' });
        else res.status(404).json({ message: 'Campanha não encontrada.' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao atualizar campanha' });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const fornecedor = await db('tb_fornecedor').where({ id_usuario: req.user.userId }).first();
        
        await db('tb_fornecedor_campanha')
            .where({ id: id, id_fornecedor: fornecedor.id })
            .del();

        res.json({ message: 'Campanha removida com sucesso' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao remover campanha' });
    }
});

router.get('/ativas', async (req, res) => {
    try {
        const campanhas = await db('tb_fornecedor_campanha')
            .join('tb_fornecedor', 'tb_fornecedor_campanha.id_fornecedor', 'tb_fornecedor.id')
            .select(
                'tb_fornecedor_campanha.*',
                'tb_fornecedor.nome_fantasia as nome_fornecedor'
            )
            .orderBy('tb_fornecedor_campanha.dt_inc', 'desc');

        const agora = new Date();

        const ativas = campanhas.filter(c => {
            const dataInicio = new Date(c.dt_inc);
            const dataFim = new Date(dataInicio);
            dataFim.setDate(dataFim.getDate() + c.tempo_duracao_campanha);
            
            return agora <= dataFim;
        });

        const formatadas = ativas.map(c => ({
            id: c.id,
            id_fornecedor: c.id_fornecedor, 
            fornecedor: c.nome_fornecedor,
            descricao: c.descricao_campanha,
            tipo_regra: mapTipoRegraFromDB(c.tipo_regra),
            gatilho: mapTipoRegraFromDB(c.tipo_regra) === 'QUANTIDADE' ? c.quantidade_meta : c.valor_meta,
            desconto: c.percentual_desconto,
            validade: new Date(new Date(c.dt_inc).setDate(new Date(c.dt_inc).getDate() + c.tempo_duracao_campanha)).toLocaleDateString('pt-BR')
        }));

        res.json(formatadas);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao buscar campanhas ativas' });
    }
});


module.exports = router;