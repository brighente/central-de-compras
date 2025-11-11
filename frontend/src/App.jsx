// 1. Importar os "Ganchos" (Hooks) do React
import React, { useState, useEffect } from 'react';

function App() {

  // 2. Criar um "estado" para guardar a lista
  // 'fornecedores' = A variável que guarda a lista
  // 'setFornecedores' = A função que usamos para ATUALIZAR a lista
  // Começa como um array vazio: []
  const [fornecedores, setFornecedores] = useState([]);

  // 3. Este é o "Gancho de Efeito"
  // O código aqui dentro roda UMA VEZ quando a tela carrega
  useEffect(() => {
    
    // 4. Chamar a nossa API (O "Garçom" Fetch)
    // Ele vai na "cozinha" (backend) pedir os dados
    fetch('http://localhost:3001/api/fornecedores').then(response => response.json()) // Converte a resposta em JSON
    .then(data => {
        // 5. Quando os dados chegam, guardamos eles no "estado"
        setFornecedores(data);
    })
    .catch(error => {
    // Se a API der erro
        console.error("Erro ao buscar dados da API:", error);
    });

  }, []); // O '[]' vazio no final é crucial (significa "rode 1 vez")

  // 6. O HTML (JSX) que será desenhado na tela
  return (
    <div className="App">
      <h1>Painel da Central de Compras</h1>
      <h2>Lista de Fornecedores (vinda do DB):</h2>
      
      <ul>
        {/* 7. Fazemos um "map" (loop) na lista de fornecedores
            e criamos um <li> para cada um */}
        {fornecedores.map(fornecedor => (
          <li key={fornecedor.id}>
            {fornecedor.nome_fantasia}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;