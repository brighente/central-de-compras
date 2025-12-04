import React, { useState } from 'react';
import { FaUserPlus, FaList, FaChevronDown, FaChevronUp, FaSignOutAlt, FaStore, FaTruck, FaBoxOpen } from 'react-icons/fa';

export default function SidebarAdmin({ aoClicar, onLogout }) {
    const [openMenu, setOpenMenu] = useState('');

    const toggleMenu = (menuName) => {
        setOpenMenu(openMenu === menuName ? '' : menuName);
    };

    const linkBase = "flex items-center gap-3 w-full p-3 pl-8 text-sm font-medium transition-colors border-b border-[#00802b] hover:bg-[#006622] text-left";
  const btnMenu = "flex items-center justify-between w-full p-4 font-bold text-white hover:bg-[#00802b] transition-colors";

  return (
    <aside className="w-64 bg-[#009933] text-white flex flex-col min-h-screen shadow-lg">
    
        {/* Cabeçalho */}
        <div className="p-6 border-b border-[#00802b]">
            <h2 className="text-xl font-bold uppercase tracking-wider">Painel ADM</h2>
        </div>

        {/* Menu Principal */}
        <nav className="flex-1 py-2">
            
            {/* --- MENU CADASTRAR --- */}
            <div>
            <button onClick={() => toggleMenu('cadastrar')} className={btnMenu}>
                <div className="flex items-center gap-3">
                <FaUserPlus /> <span>Cadastrar</span>
                </div>
                {openMenu === 'cadastrar' ? <FaChevronUp size={12}/> : <FaChevronDown size={12}/>}
            </button>

            {/* Sub-menu Cascata */}
            <div className={`overflow-hidden transition-all duration-300 ${openMenu === 'cadastrar' ? 'max-h-96 bg-[#007a29]' : 'max-h-0'}`}>
                <button onClick={() => aoClicar('loja')} className={linkBase}>
                <FaStore /> Loja
                </button>
                <button onClick={() => aoClicar('fornecedor')} className={linkBase}>
                <FaTruck /> Fornecedor
                </button>
                <button onClick={() => aoClicar('produto')} className={linkBase}>
                <FaBoxOpen /> Produto
                </button>
            </div>
            </div>

            {/* --- MENU LISTAS --- */}
            <div>
                    <button onClick={() => toggleMenu('listas')} className={btnMenu}>
                        <div className="flex items-center gap-3"><FaList /> <span>Gerenciar</span></div>
                        {openMenu === 'listas' ? <FaChevronUp size={12}/> : <FaChevronDown size={12}/>}
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ${openMenu === 'listas' ? 'max-h-96 bg-[#007a29]' : 'max-h-0'}`}>
                        <button onClick={() => aoClicar('lista_loja')} className={linkBase}><FaStore /> Listar Lojas</button>
                        <button onClick={() => aoClicar('lista_fornecedor')} className={linkBase}><FaTruck /> Listar Fornecedores</button>
                        <button onClick={() => aoClicar('lista_produto')} className={linkBase}><FaBoxOpen /> Listar Produtos</button>
                    </div>
            </div>

        </nav>

        {/* Rodapé */}
        <div className="p-4 border-t border-[#00802b]">
            <button 
            onClick={onLogout} 
            className="flex items-center justify-center gap-2 w-full p-2 rounded hover:bg-white/10 transition-colors font-medium"
            >
            <FaSignOutAlt /> Sair
            </button>
        </div>
    </aside>
  );
}