const express = require('express');
const cors = require('cors'); // O "porteiro" que deixa o React chamar a API
const db = require('./db'); // Importa o banco

const authRoutes = require('./routes/authRoutes'); // Importa a rota do login
const adminRoutes = require('./routes/adminRoutes'); // Importa a rota de Admins
const produtosRoutes = require('./routes/produtosRoutes'); // Importa a rota de produtos
const pedidosRoutes = require('./routes/pedidosRoutes'); // Importa a rota de pedidos
const vitrineRoutes = require('./routes/vitrineRoutes'); // Importa a rota de vitrines (mostrar produtos)
const condicoesRoutes = require('./routes/condicoesRoutes'); // Importa a rota de condições por estado
const campanhasRoutes = require('./routes/campanhasRoutes'); // Importa a rota de campanhas

const app = express();
app.use(cors()); // Diz ao Express para usar o "porteiro" CORS
app.use(express.json()); // Diz ao Express para entender JSON

app.use('/api/auth', authRoutes); // Login -> POST /api/auth/login
app.use('/api/produtos', produtosRoutes); // Produtos -> /api/produtos
app.use('/api/pedidos', pedidosRoutes); // Pedidos -> /api/pedidos
app.use('/api/vitrine', vitrineRoutes); // Vitrine -> /api/vitrine
app.use('/api/condicoes', condicoesRoutes); // Condições -> /api/condicoes
app.use('/api/admin', adminRoutes); // Admin -> /api/admin
app.use('/api/campanhas', campanhasRoutes); // Campanhas -> /api/campanhas


app.listen(3001, () => {
  console.log(`🚀 Servidor Backend rodando na http://localhost:${3001}`);
});