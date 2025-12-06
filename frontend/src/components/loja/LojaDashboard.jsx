import React, { useContext, useState } from 'react';
import AuthContext from '../../context/AuthContext';
import CartContext from '../../context/CartContext';
import { FaCheckCircle } from 'react-icons/fa';

import SidebarLoja from './SidebarLoja';
import LojaVitrine from './LojaVitrine';
import LojaPedidos from './LojaPedidos';
import LojaPerfil from './LojaPerfil'

export default function LojaDashboard() {
    const { authState } = useContext(AuthContext);
    const { cartItens, limparCart, cartTotal } = useContext(CartContext);

    const [view, setView] = useState('vitrine');

    const [showCheckout, setShowCheckout] = useState(false);
    
    const [opcoesPagamento, setOpcoesPagamento] = useState([]); 
    const [formaPagamento, setFormaPagamento] = useState('');
    const [loadingPagamentos, setLoadingPagamentos] = useState(false);

    const handleOpenCheckout = async () => {
        if(cartItens.length === 0) return alert("Seu carrinho está vazio.");

        const primeiroFornecedor = cartItens[0].produto.id_fornecedor;
        const isMisto = cartItens.some(item => item.produto.id_fornecedor !== primeiroFornecedor);

        if (isMisto) {
            alert("Atenção: Seu carrinho contém produtos de fornecedores diferentes.\n\nPor favor, feche a compra de um fornecedor por vez.");
            return;
        }

        setShowCheckout(true);
        setLoadingPagamentos(true);

        try {
            const response = await fetch(`http://localhost:3001/api/condicoes/fornecedor/${primeiroFornecedor}/pagamentos`, {
                headers: { 'Authorization': `Bearer ${authState.token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setOpcoesPagamento(data);
            } else {
                console.error("Erro ao buscar pagamentos");
                setOpcoesPagamento([]);
            }
        } catch (error) {
            console.error(error);
            alert("Erro de conexão ao buscar formas de pagamento.");
        } finally {
            setLoadingPagamentos(false);
        }
    };

    const handleConfirmarPedido = async () => {
        if(!formaPagamento) return alert("Selecione uma forma de pagamento.");

        try {
            const idFornecedor = cartItens[0].produto.id_fornecedor;
            const payload = {
                id_fornecedor: idFornecedor,
                itens: cartItens.map(item => ({
                    id_produto: item.produto.id,
                    quantidade: item.quantidade,
                    valor_unitario: item.produto.valor_produto
                })),
                forma_pagamento: formaPagamento,
                vl_total: cartTotal
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
            setOpcoesPagamento([]);
            setView('pedidos'); 
        } catch(err) {
            alert("Erro ao realizar pedido.");
            console.error(err);
        }
    };

    const renderContent = () => {
        switch (view) {
            case 'vitrine':
                return <LojaVitrine />;
            case 'pedidos':
                return <LojaPedidos />;
            case 'perfil':
                return <LojaPerfil />
            default:
                return <LojaVitrine />;
        }
    };

    const styles = {
        mainContainer: { flex: 1, backgroundColor: '#f4f6f8', minHeight: '100vh', display: 'flex' },
        contentArea: { flex: 1, padding: '30px', overflowY: 'auto', height: '100vh' },
        modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
        modalContent: { background: 'white', padding: '30px', borderRadius: '12px', width: '400px', maxWidth: '90%', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }
    };

    return (
        <div style={styles.mainContainer}>
            
            <SidebarLoja 
                activeView={view} 
                setView={setView} 
                onCheckout={handleOpenCheckout}
            />

            <div style={styles.contentArea}>
                {renderContent()}
            </div>

            {showCheckout && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <h3 style={{marginTop:0, color: '#333', borderBottom: '1px solid #eee', paddingBottom: '10px'}}>Finalizar Compra</h3>
                        
                        <div style={{marginBottom: '20px'}}>
                            <p style={{fontSize: '1.1rem'}}>Total: <strong style={{color: '#009933'}}>R$ {cartTotal.toFixed(2)}</strong></p>
                            
                            <label style={{fontSize: '0.9rem', color: '#666', display: 'block', marginBottom: '8px'}}>
                                Forma de Pagamento Aceita pelo Fornecedor:
                            </label>
                            
                            {loadingPagamentos ? (
                                <p style={{fontSize:'0.8rem', color:'#666'}}>Carregando opções...</p>
                            ) : (
                                <select 
                                    style={{width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem', backgroundColor: '#fff'}}
                                    value={formaPagamento}
                                    onChange={(e) => setFormaPagamento(e.target.value)}
                                >
                                    <option value="">Selecione...</option>
                                    {opcoesPagamento.length > 0 ? (
                                        opcoesPagamento.map(opcao => (
                                            <option key={opcao.id} value={opcao.descricao}>
                                                {opcao.descricao}
                                            </option>
                                        ))
                                    ) : (
                                        <option disabled>Nenhuma forma cadastrada pelo fornecedor</option>
                                    )}
                                </select>
                            )}
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