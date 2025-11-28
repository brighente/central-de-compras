import React, { useContext } from 'react';  // Ferramenta para poder usar um Context
import { Routes, Route, Navigate } from 'react-router-dom'; // Importa partes importantes para a navegação entre rotas

import LoginPage from './components/LoginPage'; // Importa o novo componente
import AdminDashboard from './components/AdminDashboard';
import FornecedorDashboard from './components/FornecedorDashboard';
import LojaDashboard from './components/LojaDashboard';
import TrocarSenha from './components/TrocarSenha';

import AuthContext from './context/AuthContext'; // Importamos o Context (cerebro)

const RotaPrivada = ({ children, perfilPermitido }) => {
    const { authState, loading } = useContext(AuthContext);

    if(loading){
        return <div>Carregando sistema...</div>;
    }

    if(!authState?.user){
        return <Navigate to="/login" />
    }

    if(perfilPermitido && authState.user?.perfil !== perfilPermitido){
        return <Navigate to="/login" /> 
    }

    return children;
}


function App(){
    console.log("APP INICIOU! AuthState:", useContext(AuthContext).authState)
    const { authState, loading } = useContext(AuthContext); // Pega o Estado do usuário, usando o useContext (Cerebro)

    if(loading){
        return (
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
                Carregando Central de Compras...
            </div>
        )
    }

    // Se não tiver user (deslogado), mostra a tela de login, se tiver user (logado), mostra o dashboard
    return (
        <div className='App'>
            <Routes>
                {/* Rota de login (pública) */}
                <Route path="/login" element={!authState?.user ? <LoginPage /> : <Navigate to="/" />} />

                {/* Rota de troca de senha */}
                <Route path="/trocar-senha" element={<TrocarSenha />} />

                {/* Rotas dos dashboards (privados) */}
                <Route path="/admin" element={
                    <RotaPrivada perfilPermitido="ADMIN">
                        <AdminDashboard />
                    </RotaPrivada>
                } />

                <Route path="/fornecedor" element={
                    <RotaPrivada perfilPermitido="FORNECEDOR">
                        <FornecedorDashboard />
                    </RotaPrivada>
                } />

                <Route path="/loja" element={
                    <RotaPrivada perfilPermitido="LOJA">
                        <LojaDashboard />
                    </RotaPrivada>
                } />

                {/* Rota Raiz */}
                <Route path="/" element={
                    authState?.user ? (
                        // Se tá logado, joga pro dashboard baseado no perfil
                        <Navigate to={`/${authState.user.perfil.toLowerCase()}`} />
                    ) : (
                        // Se não tá logado joga pro login
                        <Navigate to="/login" />
                    )
                } />

                {/* Rota Coringa */}
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </div>
    );
}

export default App;