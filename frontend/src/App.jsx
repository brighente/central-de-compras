import React, { useContext } from 'react';  // Ferramenta para poder usar um Context
import LoginPage from './components/LoginPage'; // 1. Importa o novo componente
import AuthContext from './context/AuthContext'; // Importamos o nosso Context (cerebro)

import AdminDashboard from './components/AdminDashboard';
import FornecedorDashboard from './components/FornecedorDashboard';
import LojaDashboard from './components/LojaDashboard';

const renderDashboard = (user) =>{
    switch(user?.perfil){
        case 'ADMIN':
            return <AdminDashboard />
        case 'FORNECEDOR':
            return <FornecedorDashboard />
        case 'LOJA':
            return <LojaDashboard />
        default:
            return <LoginPage />
    }
};


function App(){
  
    const { user } = useContext(AuthContext); // Pega o Estado do usuário, usando o useContext (Cerebro)

    // Se não tiver user (deslogado), mostra a tela de login, se tiver user (logado), mostra o dashboard
    return (
        <div className="App">
            {!user ? <LoginPage /> : renderDashboard(user)}
        </div>
    );
}

export default App;