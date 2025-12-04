import React, { useContext } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom'; // Adicionei useLocation
import AuthContext from '../../context/AuthContext';
import SidebarFornecedor from './SidebarFornecedor';

export default function FornecedorLayout() {
    const { authState } = useContext(AuthContext); // logout removido daqui, a Sidebar já faz isso
    const navigate = useNavigate();
    const location = useLocation();

    // Lógica para descobrir qual item do menu deve ficar "aceso" baseado na URL
    const getActiveView = () => {
        const path = location.pathname;
        
        // Se for exatamente /fornecedor, é o dashboard
        if (path === '/fornecedor' || path === '/fornecedor/') return 'dashboard';
        
        // Se for /fornecedor/produtos, retorna 'produtos', etc.
        // Remove '/fornecedor/' do caminho para sobrar só o nome da seção
        return path.replace('/fornecedor/', '').split('/')[0];
    };

    const navegarPara = (caminho) => {
        if (caminho === 'dashboard') navigate('/fornecedor');
        else navigate(`/fornecedor/${caminho}`);
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f6f8' }}>
            
            {/* 
                CORREÇÃO: 
                1. Passamos activeView (calculado acima).
                2. Removemos onLogout (a Sidebar interna já gerencia isso).
            */}
            <SidebarFornecedor 
                aoClicar={navegarPara} 
                activeView={getActiveView()} 
            />

            <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
                <header style={{ marginBottom: '30px', borderBottom: '1px solid #ddd', paddingBottom: '15px' }}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <div>
                            <h1 style={{ color: '#333', fontSize: '1.8rem', margin: 0 }}>Painel do Fornecedor</h1>
                            <p style={{ color: '#666', margin: 0, fontSize: '0.9rem' }}>
                                Logado como: <strong>{authState.user?.email}</strong>
                            </p>
                        </div>
                        <span style={{background: '#e8f5e9', color: '#009933', padding: '5px 15px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold'}}>
                            Status: Ativo
                        </span>
                    </div>
                </header>

                <Outlet /> 

            </div>
        </div>
    );
}