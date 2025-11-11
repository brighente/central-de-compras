const express = require('express');
const cors = require('cors'); // O "porteiro" que deixa o React chamar a API
const knexConfig = require('./knexfile').development; // Pega a config do banco
const knex = require('knex')(knexConfig); // Inicializa o Knex


const app = express();


app.use(cors()); // Diz ao Express para usar o "porteiro" CORS
app.use(express.json()); // Diz ao Express para entender JSON


app.get('/api/fornecedores', async (req, res) => {
  console.log("LOG: Recebi uma requisição para /api/fornecedores");
  
  try {
    const fornecedores = await knex('tb_fornecedor').select('id', 'nome_fantasia');
    res.json(fornecedores);

  } catch (err) {
    console.error("Erro ao buscar no banco:", err);
    res.status(500).json({ message: 'Erro no servidor ao buscar fornecedores.' });
  }
});

app.listen(3001, () => {
  console.log(`🚀 Servidor Backend rodando na http://localhost:${3001}`);
});