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

        // Dados de pedidos simulados para testes
        const pedidos = [
            { id: 2, id_loja: 10, vl_total_pedido: 100.50, status: 'PENDENTE'},
            { id: 5, id_loja: 12, vl_total_pedido: 1114.25, status: 'PENDENTE'}
        ];

        res.json(pedidos);
    } catch(err){
        console.error("Erro ao buscar pedidos: ", err);
        return res.status(500).json({message: 'Erro interno no servidor'});
    }
});


app.listen(3001, () => {
  console.log(`🚀 Servidor Backend rodando na http://localhost:${3001}`);
});