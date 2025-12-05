import React, { useContext, useState } from 'react';
import { Outlet } from 'react-router-dom'; // <--- IMPORTANTE: Substitui a renderização condicional
import AuthContext from '../../context/AuthContext';
import CartContext from '../../context/CartContext';
import { FaCheckCircle } from 'react-icons/fa';

// Importando a Sidebar atualizada
import SidebarLoja from './SidebarLoja';

export default function LojaDashboard() {
    const { authState } = useContext(AuthContext);
    const { cartItens, limparCart, cartTotal } = useContext(CartContext);

    // NÃO PRECISAMOS MAIS DO STATE 'view'. Quem controla isso agora é a URL.

    // Estado do Modal de Checkout
    const [showCheckout, setShowCheckout] = useState(false);
    const [formaPagamento, setFormaPagamento] = useState('');

    // --- HANDLERS ---
    const handleOpenCheckout = () => {
        if(cartItens.length === 0) return alert("Seu carrinho está vazio.");
        setShowCheckout(true);
    };

    const handleConfirmarPedido = async () => {
        if(!formaPagamento) return alert("Selecione uma forma de pagamento.");

        try {
            const payload = {
                itens: cartItens.map(item => ({
                    id_produto: item.produto.id,
                    quantidade: item.quantidade
                })),
                forma_pagamento: formaPagamento
            };

            const res = await fetch('http://localhost:3001/api/pedidos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authState.token}` },
                body: JSON.stringify(payload)
            });

            if(!res.ok) throw new Error('Erro ao processar');

            alert("Pedido realizado com sucesso!");
            limparCart();
            setShowCheckout(false);
            setFormaPagamento('');
            // Opcional: Redirecionar para pedidos via navigate('/loja/meus-pedidos') se quiser
        } catch(err) {
            alert("Erro ao realizar pedido.");
            console.error(err);
        }
    };

    // Estilos
    const styles = {
        mainContainer: { flex: 1, backgroundColor: '#f4f6f8', minHeight: '100vh', display: 'flex' },
        contentArea: { flex: 1, padding: '30px', overflowY: 'auto', height: '100vh' },
        modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
        modalContent: { background: 'white', padding: '30px', borderRadius: '12px', width: '400px', maxWidth: '90%', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }
    };

    return (
        <div style={styles.mainContainer}>
            
            {/* SIDEBAR: Não passamos mais 'activeView' nem 'setView' */}
            <SidebarLoja 
                onCheckout={handleOpenCheckout} 
            />

            {/* ÁREA DE CONTEÚDO */}
            <div style={styles.contentArea}>
                {/* O Outlet renderiza o componente filho da rota definida no App.jsx (Vitrine, Pedidos ou Perfil) */}
                <Outlet />
            </div>

            {/* MODAL DE CHECKOUT */}
            {showCheckout && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <h3 style={{marginTop:0, color: '#333', borderBottom: '1px solid #eee', paddingBottom: '10px'}}>Finalizar Compra</h3>
                        
                        <div style={{marginBottom: '20px'}}>
                            <p style={{fontSize: '1.1rem'}}>Total: <strong style={{color: '#009933'}}>R$ {cartTotal.toFixed(2)}</strong></p>
                            <label style={{fontSize: '0.9rem', color: '#666', display: 'block', marginBottom: '8px'}}>Forma de Pagamento:</label>
                            
                            <select 
                                style={{width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem', backgroundColor: '#fff'}}
                                value={formaPagamento}
                                onChange={(e) => setFormaPagamento(e.target.value)}
                            >
                                <option value="">Selecione...</option>
                                <option value="Boleto Bancário (À vista)">Boleto Bancário (À vista)</option>
                                <option value="Boleto 28 Dias">Boleto 28 Dias</option>
                                <option value="Pix">Pix (Instantâneo)</option>
                                <option value="Cartão de Crédito">Cartão de Crédito</option>
                            </select>
                        </div>

                        <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end'}}>
                            <button onClick={() => setShowCheckout(false)} style={{background: '#f1f1f1', border: '1px solid #ddd', padding: '12px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', color: '#555'}}>
                                Cancelar
                            </button>
                            <button onClick={handleConfirmarPedido} style={{background: '#009933', border: 'none', padding: '12px 25px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center', gap: '8px'}}>
                                <FaCheckCircle /> Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}