import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './components/LoginPage';
import AdminDashboard from './components/admin/AdminDashboard';
import LojaDashboard from './components/loja/LojaDashboard';
import TrocarSenha from './components/TrocarSenha';

// Componentes Fornecedor
import FornecedorLayout from './components/fornecedor/FornecedorLayout';
import FornecedorHome from './components/fornecedor/FornecedorHome';
import FornecedorProdutos from './components/fornecedor/FornecedorProdutos';
import FornecedorConfiguracoes from './components/fornecedor/FornecedorConfiguracoes';
import FornecedorPedidos from './components/fornecedor/FornecedorPedidos';
import FornecedorCampanhas from './components/fornecedor/FornecedorCampanhas';

import LojaVitrine from './components/loja/LojaVitrine';
import LojaPedidos from './components/loja/LojaPedidos';
import PerfilLoja from './components/loja/LojaPerfil';

import AuthContext from './context/AuthContext';
import { CartProvider } from './context/CartContext';

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
    const { authState, loading } = useContext(AuthContext);

    if(loading){
        return (
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
                Carregando Central de Compras...
            </div>
        )
    }

    return (
        <div className='App'>
            <CartProvider>
                <Routes>
                    <Route path="/login" element={!authState?.user ? <LoginPage /> : <Navigate to="/" />} />

                    <Route path="/trocar-senha" element={<TrocarSenha />} />

                    <Route path="/admin" element={
                        <RotaPrivada perfilPermitido="ADMIN">
                            <AdminDashboard />
                        </RotaPrivada>
                    } />

                    <Route path="/fornecedor" element={
                        <RotaPrivada perfilPermitido="FORNECEDOR">
                            <FornecedorLayout />
                        </RotaPrivada>
                    }>
                        <Route index element={<FornecedorHome />} />
                        <Route path="produtos" element={<FornecedorProdutos />} />
                        <Route path="pedidos" element={<FornecedorPedidos />} />
                        <Route path="campanhas" element={<FornecedorCampanhas />} />
                        <Route path="configuracoes" element={<FornecedorConfiguracoes />} />
                    </Route>

                    <Route path="/loja" element={
                        <RotaPrivada perfilPermitido="LOJA">
                            <LojaDashboard />
                        </RotaPrivada>
                    } > 
                        <Route index element={<LojaVitrine />} />
                        <Route path="vitrine" element={<LojaVitrine />} />
                        <Route path="meus-pedidos" element={<LojaPedidos />} />
                        <Route path="perfil" element={<PerfilLoja />} />
                    
                    
                    </Route>

                    <Route path="/" element={
                        authState?.user ? (
                            <Navigate to={`/${authState.user.perfil.toLowerCase()}`} />
                        ) : (
                            <Navigate to="/login" />
                        )
                    } />

                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </CartProvider>
        </div>
    );
}

export default App;