import React, { useContext } from 'react';
import AuthContext from '../../context/AuthContext'; // Garanta que o nome do arquivo é AuthContext

export default function Sidebar({ title, children }) {
    const { logout, authState } = useContext(AuthContext);

    // Se o authState não existir (erro no Context) ou user não existir, não renderiza para evitar crash
    if (!authState || !authState.user) return null;

    return (
        <div style={{
            width: '280px', 
            backgroundColor: 'var(--cor-sidebar)', 
            color: 'white', 
            padding: '25px', 
            display: 'flex', 
            flexDirection: 'column', 
            position: 'sticky', 
            top: 0, 
            height: '100vh', 
            // CORREÇÃO 1: Removi o 'r' intruso daqui
            boxShadow: '4px 0px 10px rgba(0,0,0,0.1)', 
            flexShrink: 0 
        }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '15px'}}> 
                {title} 
            </h2>

            <div style={{ flex: 1, overflowY: 'auto'}}> 
                {children} 
            </div>

            {/* CORREÇÃO 2: '20px' junto */}
            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                <p style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '10px'}}> 
                    👤 {authState.user.email} 
                </p>

                <button 
                    onClick={logout} 
                    style={{
                        background: 'transparent', 
                        border: '1px solid rgba(255,255,255,0.5)', 
                        color: 'white', 
                        padding: '8px 15px', 
                        width: '100%', 
                        borderRadius: '6px', 
                        transition: 'all 0.2s', 
                        cursor: 'pointer'
                    }} 
                    onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'} 
                    onMouseOut={(e) => e.target.style.background = 'transparent'}
                > 
                    Sair do Sistema 
                </button>
            </div>
        </div>
    );
}