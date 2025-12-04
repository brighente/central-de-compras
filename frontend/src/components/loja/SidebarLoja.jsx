import React from 'react';
import Sidebar from '../shared/Sidebar'; // Importando seu wrapper genérico existente
import CarrinhoSidebar from './CarrinhoSidebar';
import { FaStore, FaBoxOpen } from 'react-icons/fa';

export default function SidebarLoja({ activeView, setView, onCheckout }) {
    
    const menuItemStyle = (isActive) => ({
        padding: '12px 15px', 
        margin: '5px 0', 
        borderRadius: '6px', 
        cursor: 'pointer', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px', 
        color: 'white',
        background: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
        borderLeft: isActive ? '4px solid #00ff55' : '4px solid transparent',
        transition: 'all 0.2s',
        fontWeight: isActive ? 'bold' : 'normal'
    });

    return (
        <Sidebar title="ÁREA DO LOJISTA">
            {/* MENU DE NAVEGAÇÃO */}
            <div style={{ marginBottom: '30px', flex: 1 }}>
                <div 
                    style={menuItemStyle(activeView === 'vitrine')} 
                    onClick={() => setView('vitrine')}
                >
                    <FaStore /> Vitrine de Ofertas
                </div>
                <div 
                    style={menuItemStyle(activeView === 'pedidos')} 
                    onClick={() => setView('pedidos')}
                >
                    <FaBoxOpen /> Histórico de Pedidos
                </div>
            </div>

            {/* CARRINHO ISOLADO */}
            <CarrinhoSidebar onCheckout={onCheckout} />
        </Sidebar>
    );
}