import React, { useState } from 'react';
import Sidebar from '../shared/Sidebar'; 
import { FaUserPlus, FaList, FaChevronDown, FaChevronUp, FaStore, FaTruck, FaBoxOpen } from 'react-icons/fa';

export default function SidebarAdmin({ aoClicar, activeView }) {
    
    const [openMenu, setOpenMenu] = useState('');

    const toggleMenu = (menuName) => {
        setOpenMenu(openMenu === menuName ? '' : menuName);
    };

    const viewsCadastrar = ['loja', 'fornecedor', 'produto'];
    const viewsListas    = ['lista_loja', 'lista_fornecedor', 'lista_produto'];

    const handleMouseEnter = (e, isActive) => {
        if (!isActive) {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
        }
    };

    const handleMouseLeave = (e, isActive) => {
        if (!isActive) {
            e.currentTarget.style.background = 'transparent';
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
        fontWeight: isActive ? 'bold' : 'normal',
        userSelect: 'none'
    });

    const subItemStyle = (isActive) => ({
        padding: '10px 10px 10px 35px', 
        margin: '2px 0',
        borderRadius: '6px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        color: 'rgba(255,255,255,0.8)', 
        fontSize: '0.9rem',
        background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
        borderLeft: isActive ? '4px solid #00ff55' : '4px solid transparent',
        fontWeight: isActive ? 'bold' : 'normal',
        transition: 'all 0.2s'
    });

    const isCadastrarActive = openMenu === 'cadastrar' || viewsCadastrar.includes(activeView);
    const isListasActive = openMenu === 'listas' || viewsListas.includes(activeView);

    return (
        <Sidebar title="PAINEL ADM">
            <div style={{ flex: 1 }}>
                
                <div>
                    <div 
                        style={menuItemStyle(isCadastrarActive)} 
                        onClick={() => toggleMenu('cadastrar')}
                        onMouseEnter={(e) => handleMouseEnter(e, isCadastrarActive)}
                        onMouseLeave={(e) => handleMouseLeave(e, isCadastrarActive)}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FaUserPlus /> <span>Cadastrar</span>
                        </div>
                        {openMenu === 'cadastrar' ? <FaChevronUp size={12}/> : <FaChevronDown size={12}/>}
                    </div>

                    {openMenu === 'cadastrar' && (
                        <div style={{ marginBottom: '10px' }}>
                            <div 
                                style={subItemStyle(activeView === 'loja')} 
                                onClick={() => aoClicar('loja')}
                                onMouseEnter={(e) => handleMouseEnter(e, activeView === 'loja')}
                                onMouseLeave={(e) => handleMouseLeave(e, activeView === 'loja')}
                            >
                                <FaStore /> Loja
                            </div>
                            
                            <div 
                                style={subItemStyle(activeView === 'fornecedor')} 
                                onClick={() => aoClicar('fornecedor')}
                                onMouseEnter={(e) => handleMouseEnter(e, activeView === 'fornecedor')}
                                onMouseLeave={(e) => handleMouseLeave(e, activeView === 'fornecedor')}
                            >
                                <FaTruck /> Fornecedor
                            </div>

                            <div 
                                style={subItemStyle(activeView === 'produto')} 
                                onClick={() => aoClicar('produto')}
                                onMouseEnter={(e) => handleMouseEnter(e, activeView === 'produto')}
                                onMouseLeave={(e) => handleMouseLeave(e, activeView === 'produto')}
                            >
                                <FaBoxOpen /> Produto
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ marginTop: '10px' }}>
                    <div 
                        style={menuItemStyle(isListasActive)} 
                        onClick={() => toggleMenu('listas')}
                        onMouseEnter={(e) => handleMouseEnter(e, isListasActive)}
                        onMouseLeave={(e) => handleMouseLeave(e, isListasActive)}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FaList /> <span>Gerenciar</span>
                        </div>
                        {openMenu === 'listas' ? <FaChevronUp size={12}/> : <FaChevronDown size={12}/>}
                    </div>

                    {openMenu === 'listas' && (
                        <div style={{ marginBottom: '10px' }}>
                            <div 
                                style={subItemStyle(activeView === 'lista_loja')} 
                                onClick={() => aoClicar('lista_loja')}
                                onMouseEnter={(e) => handleMouseEnter(e, activeView === 'lista_loja')}
                                onMouseLeave={(e) => handleMouseLeave(e, activeView === 'lista_loja')}
                            >
                                <FaStore /> Listar Lojas
                            </div>
                            <div 
                                style={subItemStyle(activeView === 'lista_fornecedor')} 
                                onClick={() => aoClicar('lista_fornecedor')}
                                onMouseEnter={(e) => handleMouseEnter(e, activeView === 'lista_fornecedor')}
                                onMouseLeave={(e) => handleMouseLeave(e, activeView === 'lista_fornecedor')}
                            >
                                <FaTruck /> Listar Fornecedores
                            </div>
                            <div 
                                style={subItemStyle(activeView === 'lista_produto')} 
                                onClick={() => aoClicar('lista_produto')}
                                onMouseEnter={(e) => handleMouseEnter(e, activeView === 'lista_produto')}
                                onMouseLeave={(e) => handleMouseLeave(e, activeView === 'lista_produto')}
                            >
                                <FaBoxOpen /> Listar Produtos
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </Sidebar>
    );
}