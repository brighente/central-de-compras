const express = require('express');
const cors = require('cors'); // O "porteiro" que deixa o React chamar a API
const db = require('./db'); // Importa o banco

const authRoutes = require('./routes/authRoutes'); // Importa a rota do login
const produtosRoutes = require('./routes/produtosRoutes'); // Importa a rota de produtos
const pedidosRoutes = require('./routes/pedidosRoutes'); // Importa a rota de pedidos
const vitrineRoutes = require('./routes/vitrineRoutes'); // Importa a rota de vitrines (mostrar produtos)

const app = express();
app.use(cors()); // Diz ao Express para usar o "porteiro" CORS
app.use(express.json()); // Diz ao Express para entender JSON

app.use('/api/auth', authRoutes); // Login -> POST /api/auth/login
app.use('/api/produtos', produtosRoutes); // Produtos -> /api/produtos
app.use('/api/pedidos', pedidosRoutes); // Pedidos -> /api/pedidos
app.use('/api/vitrine', vitrineRoutes); // Vitrine -> /api/vitrine

// Get fornecedores
// Quando acessado essa rota, o SQL do knex será executado, retornando os fornecedores
app.get('/api/fornecedores', async (req, res) => {
  console.log("LOG: Recebi uma requisição para /api/fornecedores");
  
  try {
    const fornecedores = await db('tb_fornecedor').select('id', 'nome_fantasia'); // SELECT id, nome_fantasia FROM tb_fornecedor
    res.json(fornecedores); // Transformando a resposta do SQL em JSON

  } catch (err) {
    console.error("Erro ao buscar no banco:", err);
    res.status(500).json({ message: 'Erro no servidor ao buscar fornecedores.' });
  }
});


app.listen(3001, () => {
  console.log(`🚀 Servidor Backend rodando na http://localhost:${3001}`);
});