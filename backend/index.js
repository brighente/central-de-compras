const express = require('express');
const cors = require('cors'); // O "porteiro" que deixa o React chamar a API
const knexConfig = require('./knexfile').development; // Pega a config do banco
const knex = require('knex')(knexConfig); // Inicializa o Knex
const bcrypt = require('bcryptjs') // Inicializa o bcrypt
const jwt = require('jsonwebtoken') // Inicializa o JsonWebToken
const authMiddleware = require('./authMiddleware'); // Importa o authMiddleware

const JWT_SECRET = 'projeto-central-compras-abacate'

const app = express();

app.use(cors()); // Diz ao Express para usar o "porteiro" CORS
app.use(express.json()); // Diz ao Express para entender JSON

// Get fornecedores
// Quando acessado essa rota, o SQL do knex será executado, retornando os fornecedores
app.get('/api/fornecedores', async (req, res) => {
  console.log("LOG: Recebi uma requisição para /api/fornecedores");
  
  try {
    const fornecedores = await knex('tb_fornecedor').select('id', 'nome_fantasia'); // SELECT id, nome_fantasia FROM tb_fornecedor
    res.json(fornecedores); // Transformando a resposta do SQL em JSON

  } catch (err) {
    console.error("Erro ao buscar no banco:", err);
    res.status(500).json({ message: 'Erro no servidor ao buscar fornecedores.' });
  }
});


// Post para realização de Login do usuário

app.post('/api/login', async (req, res) => {
    console.log("LOG: Recebi uma tentativa de login");

    const {email, senha} = req.body;

    if(!email || !senha){
        return res.status(400).json({message: 'Email e senha são obrigatórios.'});
    }

    try {
        const usuario = await knex('tb_sistema_usuario AS user')
        .join('tb_sistema_usuario_perfil as profile', 'user.id', 'profile.id_usuario')
        .where({ email: email})
        .select('user.id', 'user.email', 'user.senha', 'profile.perfil').first()
        if(!usuario){
            return res.status(401).json({message: 'Email ou senha inválidos!'})
        }

        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
        if(!senhaCorreta){
            return res.status(401).json({message: 'Email ou senha inválidos!'})
        }

        const token = jwt.sign(
            {
                userId: usuario.id,
                email: usuario.email,
                perfil: usuario.perfil
            },
            JWT_SECRET,
            {
                expiresIn: '1h'    
            }
        );

        console.log("LOG: Login bem sucedido para:", email);
        res.json({
            message: 'Login bem sucedido!',
            token
        });

    } catch (err){
        console.error("Erro no login: ", err);
        res.status(500).json({message: 'Erro interno no servidor!'});
    }
});


app.get('/api/meus-pedidos/', authMiddleware, async (req, res) => {
    const idUsuarioLogado = req.user.userId;

    console.log(`LOG: Buscando pedidos para o usuário ${idUsuarioLogado}`);

    try{
        const fornecedor = await knex('tb_fornecedor').where({id_usuario: idUsuarioLogado}).first(); // Seleciona o fornecedor baseado no idLogado

        if(!fornecedor){
            return res.status(404).json({message: 'Fornecedor não encontrado'})
        }

        // Dados de pedidos vindos do banco
        const pedidos = await knex('tb_pedido AS ped')
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
        const itens = await knex('tb_pedido_item AS pi')
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

app.patch('/api/pedidos/:id/status', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const statusPermitidos = ['PENDENTE', 'SEPARADO', 'ENVIADO', 'CANCELADO'];
    if(!statusPermitidos.includes(status)){
        res.status(400).json({message: 'Status Inválido'})
    }

    try {
        const fornecedor = await knex('tb_fornecedor').where({id_usuario: req.user.userId}).first();

        if(!fornecedor){
            return res.status(404).json({message: 'Fornecedor não encontrado'})
        }

        const pedido = await knex('tb_pedido').where({id: id, id_fornecedor: fornecedor.id}).first();

        if(!pedido){
            return res.status(404).json({message: 'Pedido não encontrado ou não pertence a você'})
        }

        await knex('tb_pedido').where({id: id}).update({status: status});

        res.json({message: `Pedido #${id} atualizado para ${status} com sucesso!`});
    } catch(err){
        console.error("Erro ao atualizar pedido: ", err);
        res.status(500).json({message: 'Erro interno'});
    }
});


app.get('/api/vitrine', authMiddleware, async (req, res) => {
    try{
        // SQL para buscar os produtos e organizar eles por fornecedor
        const produtos = await knex('tb_fornecedor_produto AS prod')  
            .join('tb_fornecedor As forn', 'prod.id_fornecedor', 'forn.id')
            .join('tb_categoria AS cat', 'prod.id_categoria', 'cat.id')
            .select(
                'prod.id',
                'prod.produto',
                'prod.valor_produto',
                'forn.nome_fantasia AS fornecedor_nome',
                'cat.nome_categoria'
            )
            .orderBy('forn.nome_fantasia'); 

        res.json(produtos);
    } catch(err){
        console.error('Erro ao buscar vitrine: ', err);
        res.status(500).json({message: 'Erro ao carregar produtos'});
    }
});


app.listen(3001, () => {
  console.log(`🚀 Servidor Backend rodando na http://localhost:${3001}`);
});