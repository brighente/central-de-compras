const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../authMiddleware');

router.use(authMiddleware);

// Função auxiliar para mapear o tipo do frontend para o ENUM do DB
const mapTipoRegraToDB = (tipo) => {
    if (tipo === 'VALOR') return 'VALOR_PEDIDO';
    if (tipo === 'QUANTIDADE') return 'QTD_PRODUTO';
    return 'VALOR_PEDIDO'; // Default
};

// Função auxiliar para mapear o tipo do DB para o frontend
const mapTipoRegraFromDB = (tipoDB) => {
    if (tipoDB === 'VALOR_PEDIDO') return 'VALOR';
    if (tipoDB === 'QTD_PRODUTO') return 'QUANTIDADE';
    return 'VALOR'; // Default
};


// LISTAR (GET)
// A rota no frontend é /api/campanhas/fornecedor, então usei '/fornecedor' aqui
router.get('/fornecedor', async (req, res) => {
    try {
        const fornecedor = await db('tb_fornecedor').where({ id_usuario: req.user.userId }).first();
        
        if (!fornecedor) return res.status(404).json({ message: 'Fornecedor não encontrado' });

        const campanhas = await db('tb_fornecedor_campanha')
            .where({ id_fornecedor: fornecedor.id })
            .orderBy('dt_inc', 'desc');

        // Formata para o frontend entender (gatilho unificado)
        const formatadas = campanhas.map(c => ({
            id: c.id,
            descricao: c.descricao_campanha,
            // 🎯 CORREÇÃO: Mapeia o ENUM do DB para o string do frontend
            tipo_regra: mapTipoRegraFromDB(c.tipo_regra),
            // Adicionado percentual_desconto à lista
            desconto_percentual: c.percentual_desconto, 
            
            // O gatilho deve usar o tipo_regra convertido
            gatilho: mapTipoRegraFromDB(c.tipo_regra) === 'QUANTIDADE' ? c.quantidade_meta : c.valor_meta,
            dias_duracao: c.tempo_duracao_campanha
        }));

        res.json(formatadas);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao listar campanhas' });
    }
});

// CRIAR (POST)
router.post('/', async (req, res) => {
    const { descricao, tipo_regra, gatilho, desconto_percentual, dias_duracao } = req.body;

    try {
        const fornecedor = await db('tb_fornecedor').where({ id_usuario: req.user.userId }).first();
        const usuario = await db('tb_sistema_usuario').where({ id: req.user.userId }).first();

        const dbTipoRegra = mapTipoRegraToDB(tipo_regra);
        
        // Define onde salvar o gatilho baseado no tipo
        const valorMeta = dbTipoRegra === 'VALOR_PEDIDO' ? parseFloat(gatilho) : 0;
        const qtdMeta = dbTipoRegra === 'QTD_PRODUTO' ? parseInt(gatilho) : 0;

        await db('tb_fornecedor_campanha').insert({
            id_fornecedor: fornecedor.id,
            id_usuario: req.user.userId,
            id_conta: usuario.id_conta,
            descricao_campanha: descricao,
            // 🎯 CORREÇÃO: Usa o nome da coluna no DB (que adicionamos) e o ENUM mapeado
            tipo_regra: dbTipoRegra, 
            valor_meta: valorMeta,
            quantidade_meta: qtdMeta,
            // 🎯 CORREÇÃO: Usa o nome da coluna no DB (que adicionamos)
            percentual_desconto: parseFloat(desconto_percentual), 
            tempo_duracao_campanha: parseInt(dias_duracao),
            dt_inc: new Date(),
            quantidade_atingida: 0,
            valor_atingido: 0
        });

        res.status(201).json({ message: 'Campanha criada com sucesso!' });
    } catch (err) {
        console.error(err);
        // Exibe o erro específico para debug no console, mas uma mensagem genérica no frontend
        res.status(500).json({ message: 'Erro ao criar campanha: ' + err.message });
    }
});

// EDITAR (PUT)
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
                // 🎯 CORREÇÃO: Usa o nome da coluna no DB (que adicionamos) e o ENUM mapeado
                tipo_regra: dbTipoRegra,
                valor_meta: valorMeta,
                quantidade_meta: qtdMeta,
                // 🎯 CORREÇÃO: Usa o nome da coluna no DB (que adicionamos)
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

// EXCLUIR (DELETE)
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

module.exports = router;