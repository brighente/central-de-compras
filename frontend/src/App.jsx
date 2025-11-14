import React, { useContext } from 'react';  // Ferramenta para poder usar um Context
import LoginPage from './components/LoginPage'; // 1. Importa o novo componente
import AuthContext from './context/AuthContext'; // Importamos o nossos Context (cerebro)

function Dashboard(){

    return (
        <div>
            <h1>Painel Principal (Logado!)</h1>
            <p>Aqui vai a lista de fornecedores, etc</p>
        </div>
    );
}

function App(){
  
    const { authToken } = useContext(AuthContext); // Pega o Estado do authToken, usando o useContext (Cerebro)

    // Se não tiver token (deslogado), mostra a tela de login, se tiver token (logado), mostra o dashboard
    return (
        <div className="App">
            {!authToken && <LoginPage />}
            {authToken && <Dashboard />}
        </div>
    );
}

export default App;