import React, { useContext } from 'react';
// Removemos useNavigate e useLocation pois não vamos usar rotas aqui
import Sidebar from '../shared/Sidebar'; 
import { FaStore, FaBoxOpen, FaUserCog, FaShoppingCart, FaTrash } from 'react-icons/fa';
import CartContext from '../../context/CartContext';

// --- COMPONENTE INTERNO DO CARRINHO (Mantive igualzinho o seu) ---
const InternalCarrinho = ({ onCheckout }) => {
    const { cartItens, removerDoCart, cartTotal } = useContext(CartContext);

    const styles = {
        container: { marginTop: 'auto', background: 'rgba(0,0,0,0.25)', padding: '15px', borderRadius: '8px' },
        header: { margin: '0 0 15px 0', borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: '5px', display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontSize: '1rem' },
        list: { maxHeight: '25vh', overflowY: 'auto', marginBottom: '15px', paddingRight: '5px' },
        item: { display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '5px', color: '#e0e0e0' },
        footer: { borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: '10px' },
        totalRow: { display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '15px', fontSize: '1.1rem', color: 'white' },
        btnCheckout: { 
            width: '100%', padding: '12px', borderRadius: '6px', fontWeight: 'bold', border: 'none', transition: 'all 0.2s',
            background: cartItens.length > 0 ? '#fff' : '#444', 
            color: cartItens.length > 0 ? '#009933' : '#888', 
            cursor: cartItens.length > 0 ? 'pointer' : 'not-allowed',
            boxShadow: cartItens.length > 0 ? '0 4px 6px rgba(0,0,0,0.2)' : 'none'
        }
    };

    return (
        <div style={styles.container}>
            <h4 style={styles.header}>
                <FaShoppingCart /> Meu Carrinho
            </h4>
            
            {cartItens.length === 0 ? (
                <p style={{ fontSize: '0.8rem', opacity: 0.7, color: 'white' }}>Seu carrinho está vazio.</p>
            ) : (
                <div style={styles.list} className="custom-scrollbar">
                    {cartItens.map(item => (
                        <div key={item.produto.id} style={styles.item}>
                            <div style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'130px'}}>
                                <strong>{item.quantidade}x</strong> {item.produto.produto}
                            </div>
                            <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                                <span style={{fontWeight:'bold'}}>R${(item.produto.valor_produto * item.quantidade).toFixed(0)}</span>
                                <FaTrash 
                                    size={12} 
                                    color="#ff6b6b" 
                                    style={{cursor:'pointer'}} 
                                    onClick={() => removerDoCart(item.produto.id)}
                                    title="Remover item"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div style={styles.footer}>
                <div style={styles.totalRow}>
                    <span>Total:</span>
                    <span>R$ {cartTotal.toFixed(2)}</span>
                </div>
                <button 
                    onClick={onCheckout} 
                    disabled={cartItens.length === 0}
                    style={styles.btnCheckout}
                >
                    FECHAR PEDIDO
                </button>
            </div>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL ALTERADO ---
// Agora recebemos 'setView' e 'activeView' do pai
export default function SidebarLoja({ onCheckout, setView, activeView }) {
    
    // Função de estilo baseada na prop activeView
    const menuItemStyle = (viewName) => {
        const isActive = activeView === viewName;
        return {
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
        };
    };

    return (
        <Sidebar title="ÁREA DO LOJISTA">
            {/* MENU DE NAVEGAÇÃO */}
            <div style={{ marginBottom: '30px', flex: 1 }}>
                
                {/* BOTÃO VITRINE */}
                <div 
                    style={menuItemStyle('vitrine')} 
                    onClick={() => setView('vitrine')}
                >
                    <FaStore /> Vitrine de Ofertas
                </div>

                {/* BOTÃO PEDIDOS */}
                <div 
                    style={menuItemStyle('pedidos')} 
                    onClick={() => setView('pedidos')}
                >
                    <FaBoxOpen /> Histórico de Pedidos
                </div>

                {/* BOTÃO PERFIL */}
                <div 
                    style={menuItemStyle('perfil')} 
                    onClick={() => setView('perfil')}
                >
                    <FaUserCog /> Dados da Loja
                </div>
            </div>

            {/* CARRINHO INTEGRADO */}
            <InternalCarrinho onCheckout={onCheckout} />
        </Sidebar>
    );
}