import React, { useState } from 'react';
import { FaBoxOpen, FaShoppingCart, FaBullhorn, FaMapMarkedAlt, FaChevronDown, FaChevronUp, FaSignOutAlt, FaHome } from 'react-icons/fa';

export default function SidebarFornecedor({ aoClicar, onLogout }) {
    const [openMenu, setOpenMenu] = useState('');

    const toggleMenu = (menuName) => {
        setOpenMenu(openMenu === menuName ? '' : menuName);
    };

    const btnMenuStyle = {
        width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 15px', background: 'transparent', border: 'none', color: 'white',
        cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', textAlign: 'left', borderBottom: '1px solid #00802b'
    };

    const subItemStyle = {
        display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
        padding: '10px 10px 10px 25px', background: 'rgba(0, 0, 0, 0.1)', border: 'none',
        color: '#e0e0e0', cursor: 'pointer', fontSize: '0.9rem', textAlign: 'left',
        borderBottom: '1px solid #00802b', transition: 'background 0.2s'
    };

    return (
        <aside style={{ width: '260px', backgroundColor: '#009933', color: 'white', minHeight: '100vh', display: 'flex', flexDirection: 'column', boxShadow: '2px 0 5px rgba(0,0,0,0.1)' }}>
        
        <div style={{ padding: '20px', borderBottom: '1px solid #00802b', backgroundColor: '#00802b' }}>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>Área do Fornecedor</h2>
        </div>

        <nav style={{ flex: 1 }}>
            
            {/* DASHBOARD */}
            <button onClick={() => aoClicar('dashboard')} style={btnMenuStyle}>
                <div style={{display:'flex', gap:'10px', alignItems:'center'}}><FaHome /> <span>Visão Geral</span></div>
            </button>

            {/* GESTÃO COMERCIAL */}
            <div>
            <button onClick={() => toggleMenu('comercial')} style={btnMenuStyle}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <FaBoxOpen /> <span>Comercial</span>
                </div>
                {openMenu === 'comercial' ? <FaChevronUp size={10}/> : <FaChevronDown size={10}/>}
            </button>

            {openMenu === 'comercial' && (
                <div style={{ backgroundColor: '#007a29' }}>
                <button onClick={() => aoClicar('produtos')} style={subItemStyle}><FaBoxOpen /> Meus Produtos</button>
                <button onClick={() => aoClicar('condicoes')} style={subItemStyle}><FaMapMarkedAlt /> Regras por Estado</button>
                <button onClick={() => aoClicar('campanhas')} style={subItemStyle}><FaBullhorn /> Campanhas Promo</button>
                </div>
            )}
            </div>

            {/* PEDIDOS */}
            <button onClick={() => aoClicar('pedidos')} style={btnMenuStyle}>
                <div style={{display:'flex', gap:'10px', alignItems:'center'}}><FaShoppingCart /> <span>Pedidos Recebidos</span></div>
            </button>

        </nav>

        <div style={{ padding: '15px', borderTop: '1px solid #00802b' }}>
            <button onClick={onLogout} style={{ 
                display: 'flex', alignItems: 'center', gap: '10px', 
                background: 'rgba(255,255,255,0.1)', border: 'none', 
                color: 'white', cursor: 'pointer', width: '100%', 
                padding: '10px', borderRadius: '4px' 
            }}>
            <FaSignOutAlt /> Sair
            </button>
        </div>
        </aside>
    );
}