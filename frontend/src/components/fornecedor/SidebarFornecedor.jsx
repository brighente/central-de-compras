import React, { useState } from 'react';
import Sidebar from '../shared/Sidebar'; 
import { FaBoxOpen, FaShoppingCart, FaBullhorn, FaCogs, FaChevronDown, FaChevronUp, FaHome } from 'react-icons/fa';

// AJUSTE AQUI: Recebendo 'aoClicar' (como o pai manda) e 'activeView' (para saber qual está ativa)
export default function SidebarFornecedor({ activeView, aoClicar }) {
    
    const [openMenu, setOpenMenu] = useState('');

    const toggleMenu = (menuName) => {
        setOpenMenu(openMenu === menuName ? '' : menuName);
    };

    // Função auxiliar para garantir que não quebre se o pai não mandar 'aoClicar'
    const handleNavigation = (viewName) => {
        if (typeof aoClicar === 'function') {
            aoClicar(viewName);
        } else {
            console.error("A prop 'aoClicar' não foi passada corretamente para SidebarFornecedor");
        }
    };

    const menuItemStyle = (isActive) => ({
        padding: '12px 15px',
        margin: '5px 0',
        borderRadius: '6px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between', 
        gap: '10px',
        color: 'white',
        background: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
        borderLeft: isActive ? '4px solid #00ff55' : '4px solid transparent',
        transition: 'all 0.2s',
        fontWeight: isActive ? 'bold' : 'normal'
    });

    const subItemStyle = (isActive) => ({
        padding: '10px 10px 10px 35px', 
        margin: '2px 0',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        color: 'rgba(255,255,255,0.8)', 
        fontSize: '0.9rem',
        background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
        borderLeft: isActive ? '4px solid #00ff55' : '4px solid transparent',
        transition: 'all 0.2s'
    });

    return (
        <Sidebar title="ÁREA DO FORNECEDOR">
            
            {/* --- VISÃO GERAL --- */}
            <div 
                style={menuItemStyle(activeView === 'dashboard')} 
                onClick={() => handleNavigation('dashboard')}
            >
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <FaHome /> Visão Geral
                </div>
            </div>

            {/* --- GESTÃO COMERCIAL (DROPDOWN) --- */}
            <div>
                <div 
                    style={menuItemStyle(openMenu === 'comercial' || ['produtos', 'campanhas', 'configuracoes'].includes(activeView))} 
                    onClick={() => toggleMenu('comercial')}
                >
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <FaBoxOpen /> Comercial
                    </div>
                    {openMenu === 'comercial' ? <FaChevronUp size={12}/> : <FaChevronDown size={12}/>}
                </div>

                {openMenu === 'comercial' && (
                    <div style={{ marginBottom: '10px' }}>
                        <div 
                            style={subItemStyle(activeView === 'produtos')} 
                            onClick={() => handleNavigation('produtos')}
                        >
                            <FaBoxOpen size={14} /> Meus Produtos
                        </div>

                        <div 
                            style={subItemStyle(activeView === 'campanhas')} 
                            onClick={() => handleNavigation('campanhas')}
                        >
                            <FaBullhorn size={14} /> Campanhas Promo
                        </div>

                        <div 
                            style={subItemStyle(activeView === 'configuracoes')} 
                            onClick={() => handleNavigation('configuracoes')}
                        >
                            <FaCogs size={14} /> Configurações
                        </div>
                    </div>
                )}
            </div>

            {/* --- PEDIDOS --- */}
            <div 
                style={menuItemStyle(activeView === 'pedidos')} 
                onClick={() => handleNavigation('pedidos')}
            >
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <FaShoppingCart /> Pedidos Recebidos
                </div>
            </div>

        </Sidebar>
    );
}