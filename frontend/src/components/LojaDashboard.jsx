import React, { useContext, useEffect, useState } from 'react';
import AuthContext from '../context/AuthContext';
import CartContext from '../context/CartContext';
import Sidebar from './Sidebar';

export default function LojaDashboard() {
    const { authState } = useContext(AuthContext); // Pega o estado de auth
    const { cartItens, addToCart, removerDoCart, limparCart, cartTotal } = useContext(CartContext);

    const [view, setView] = useState('vitrine');
    const [meusPedidos, setMeusPedidos] = useState([])

    const [produtos, setProdutos] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if(!authState.token){
            return;
        }

        const fetchVitrine = async () => {
            try{
                const response = await fetch('http://localhost:3001/api/vitrine', {
                    headers: {
                        'Authorization' : `Bearer ${authState.token}`
                    }
                });

                if(!response.ok){
                    throw new Error('Erro ao carregar vitrine.')
                }

                const data = await response.json();
                setProdutos(data);
        
            } catch(err){
                console.error(err)
                alert('Erro ao carregar produtos');
            } finally {
                setLoading(false)
            }
        };

        fetchVitrine();
    }, [authState.token]);

    const handleCheckout = async () => {
        if(cartItens.length === 0){
            return alert("Seu carrinho está vazio.");
        }

        if(!confirm(`Confirma o pedido no total de R$ ${cartTotal.toFixed(2)}?`)){
            return;
        }

        try{
            const payload = {
                itens: cartItens.map(item => ({
                    id_produto: item.produto.id,
                    quantidade: item.quantidade
                }))
            };

            const response = await fetch('http://localhost:3001/api/pedidos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authState.token}`
                },
                body: JSON.stringify(payload)
            });

            if(!response.ok){
                throw new Error('Erro ao realizar o pedido.')
            }

            alert("Pedido realizado com sucesso!")
            limparCart();
        } catch(err){
            console.error(err);
            alert("Erro ao processar pedido.")
        }
    }

    const fetchMeusPedidos = async () => {
        setLoading(true);
        try{
            const response = await fetch('http://localhost:3001/api/pedidos/loja', {
                headers: {
                    'Authorization': `Bearer ${authState.token}`
                }
            });
            
            const data = await response.json();
            setMeusPedidos(data);
        } catch(err){
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (view === 'pedidos'){
            fetchMeusPedidos();
        }
    }, [view]);


return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--cor-fundo)' }}>
      
        {/* Sidebar com o carrinho de compra */}
        <Sidebar title="CENTRAL DA LOJA">
            
            <div style={{ marginBottom: '20px' }}>
                <div onClick={() => setView('vitrine')} style={{ padding: '10px', cursor: 'pointer', background: view === 'vitrine' ? 'rgba(255,255,255,0.2)' : 'transparent', borderRadius: '5px', marginBottom: '5px' }}> 🛒 Vitrine de Produtos </div>
                <div onClick={() => setView('pedidos')} style={{ padding: '10px', cursor: 'pointer', background: view === 'pedidos' ? 'rgba(255,255,255,0.2)' : 'transparent', borderRadius: '5px' }}> 📦 Meus Pedidos </div>
            </div>

            {/* Resumo do Carrinho */}
            <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '8px'}}>
                <h3 style={{ fontSize: '1rem', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>Meu Carrinho</h3>
            
                {cartItens.length === 0 ? ( <p style={{ fontSize: '0.9rem', color: '#ccc', marginTop: '10px' }}>Carrinho vazio.</p>) : (
                    <div style={{ marginTop: '10px', maxHeight: '300px', overflowY: 'auto' }}>
                        {cartItens.map(item => (
                            <div key={item.produto.id} style={{ marginBottom: '10px', fontSize: '0.9rem', borderBottom: '1px solid #555', paddingBottom: '5px' }}>
                                <div style={{ fontWeight: 'bold' }}>{item.produto.produto}</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>{item.quantidade}x R$ {item.produto.valor_produto}</span>
                                    <div>
                                        <button onClick={() => removerDoCart(item.produto.id)} style={{ background: '#dc3545', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '0.8rem' }}>-</button>
                                        <button onClick={() => addToCart(item.produto)} style={{ background: '#28a745', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '0.8rem', marginLeft: '5px' }}>+</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {cartItens.length > 0 && (
                    <div style={{ marginTop: '20px', borderTop: '1px solid white', paddingTop: '10px' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '10px' }}>
                            Total: R$ {cartTotal.toFixed(2)}
                        </div>
                        <button onClick={handleCheckout} style={{ width: '100%', background: 'var(--cor-primary)', color: 'white', border: 'none', padding: '10px', borderRadius: '5px', fontWeight: 'bold' }}>
                            FINALIZAR PEDIDO
                        </button>
                    </div>
                )}
            </div>
            
        </Sidebar>

        {/* Vitrine de Produtos */}
        <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
            {view === 'vitrine' && (
                    <>
                        <h1 style={{ color: 'var(--cor-sidebar)', marginBottom: '20px' }}>Vitrine de Produtos</h1>
                        <hr style={{ border: '1px solid #ddd', marginBottom: '30px' }} />
                        
                        {!loading && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                                {produtos.map(prod => (
                                    <div key={prod.id} style={{ backgroundColor: 'var(--cor-branco)', borderRadius: '8px', padding: '20px', width: '260px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid #eee' }}>
                                        <div>
                                            <span style={{ backgroundColor: '#e8f5e9', color: 'var(--cor-primary)', fontSize: '0.7em', padding: '3px 8px', borderRadius: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>{prod.nome_categoria}</span>
                                            <h3 style={{ margin: '15px 0 5px 0', fontSize: '1.1em', color: '#333' }}>{prod.produto}</h3>
                                            <div style={{ color: '#888', fontSize: '0.9rem', marginBottom: '20px' }}>Vendido por: <strong>{prod.fornecedor_nome}</strong></div>
                                        </div>
                                        
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                                            <span style={{ fontSize: '1.4em', fontWeight: 'bold', color: '#333' }}>R$ {prod.valor_produto}</span>
                                            <button onClick={() => addToCart(prod)} style={{ backgroundColor: 'var(--cor-primary)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer' }}>
                                                COMPRAR
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
                {view === 'pedidos' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px' }}>
                        <h1 style={{ color: 'var(--cor-sidebar)', marginBottom: '10px' }}>Histórico de Compras</h1>
                        <hr style={{ border: '1px solid #ddd', width: '100%', marginBottom: '20px' }} />
                        
                        {loading && <p>Carregando...</p>}
                        {!loading && meusPedidos.length === 0 && <p>Nenhum pedido realizado.</p>}
                        
                        {!loading && meusPedidos.map(pedido => {
                            // Aplicando sua lógica de cores aqui
                            const estilo = getBadgeStyle(pedido.status);
                            
                            return (
                                <div key={pedido.id} style={{ 
                                    backgroundColor: 'white', 
                                    padding: '25px', 
                                    borderRadius: '12px', 
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.05)', 
                                    border: '1px solid #eee',
                                    width: '100%' 
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #f5f5f5', paddingBottom: '10px' }}>
                                        <div>
                                            <strong style={{ fontSize: '1.1rem', color: '#333' }}>Pedido #{pedido.id}</strong>
                                            <span style={{ margin: '0 10px', color: '#ccc' }}>|</span>
                                            <span style={{ color: '#666', fontSize: '0.9rem' }}>{pedido.fornecedor_nome}</span>
                                        </div>
                                        <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--cor-primary)' }}>
                                            R$ {parseFloat(pedido.vl_total_pedido).toFixed(2)}
                                        </div>
                                    </div>
                                    
                                    {/* --- LINHA DE STATUS E CASHBACK (NOVO) --- */}
                                    <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                                            <span style={{fontSize: '0.9rem', color: '#555'}}>Status:</span>
                                            <BadgeStatus status={pedido.status} />
                                        </div>

                                        {/* Mostra badge de Cashback se houver valor > 0 */}
                                        {parseFloat(pedido.cashback_ganho || 0) > 0 && (
                                            <div style={{ 
                                                backgroundColor: '#e8f5e9', 
                                                color: '#2e7d32', 
                                                padding: '4px 10px', 
                                                borderRadius: '20px', 
                                                fontSize: '0.8rem', 
                                                fontWeight: 'bold',
                                                border: '1px solid #c8e6c9',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '5px'
                                            }}>
                                                💰 Cashback: R$ {parseFloat(pedido.cashback_ganho).toFixed(2)}
                                            </div>
                                        )}
                                    </div>

                                    {/* Lista de Itens */}
                                    <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                            <strong style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#999' }}>Itens do Pedido</strong>
                                            <span style={{ fontSize: '0.7rem', color: '#999', fontStyle: 'italic' }}>*Valores podem incluir impostos/taxas regionais (UF)</span>
                                        </div>
                                        
                                        <ul style={{ margin: 0, paddingLeft: '20px', color: '#444' }}>
                                            {/* ... (loop dos itens igual) ... */}
                                        </ul>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
        </div>
    </div>
  );
}


const getBadgeStyle = (status) => {
    switch(status) {
        case 'PENDENTE': return { bg: '#fff3cd', color: '#856404', border: '#ffeeba' }; // Amarelo
        case 'SEPARADO': return { bg: '#cce5ff', color: '#004085', border: '#b8daff' }; // Azul
        case 'ENVIADO':  return { bg: '#d4edda', color: '#155724', border: '#c3e6cb' }; // Verde
        default: return { bg: '#eee', color: '#333', border: '#ddd' };
    }
};