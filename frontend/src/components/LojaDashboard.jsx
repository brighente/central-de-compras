import React, { useContext, useEffect, useState } from 'react';
import AuthContext from '../context/AuthContext';
import CartContext from '../context/CartContext';

export default function LojaDashboard() {
    const { logout, authState } = useContext(AuthContext); // Pega a função logout e o estado de auth
    const { cartItens, addToCart, removerDoCart, limparCart, cartTotal } = useContext(CartContext);

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


return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--cor-fundo)' }}>
      
        {/* Sidebar com o carrinho de compra */}
        <div style={{ width: '300px', backgroundColor: 'var(--cor-sidebar)', color: 'white', padding: '20px', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>CENTRAL COMPRAS</h2>
            
            {/* Resumo do Carrinho */}
            <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '8px', marginBottom: '20px', flex: 1 }}>
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
            
            <div>
                <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>{authState.user?.email}</p>
                <button onClick={logout} style={{ background: 'transparent', border: '1px solid white', color: 'white', padding: '5px 15px', width: '100%', borderRadius: '4px' }}>Sair</button>
            </div>
        </div>

        {/* Vitrine de Produtos */}
        <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
            <h1 style={{ color: 'var(--cor-sidebar)', marginBottom: '20px' }}>Vitrine de Produtos</h1>
            <hr style={{ border: '1px solid #ddd', marginBottom: '30px' }} />

            {!loading && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                {produtos.map(prod => (
                <div key={prod.id} style={{ backgroundColor: 'var(--cor-branco)', borderRadius: '8px', padding: '20px', width: '280px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid #eee' }}>
                    <div>
                        <span style={{ backgroundColor: '#e8f5e9', color: 'var(--cor-primary)', fontSize: '0.7em', padding: '3px 8px', borderRadius: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>{prod.nome_categoria}</span>
                        <h3 style={{ margin: '15px 0 5px 0', fontSize: '1.1em', color: '#333' }}>{prod.produto}</h3>
                        <div style={{ color: '#888', fontSize: '0.9em', marginBottom: '20px' }}>Vendido por: <strong>{prod.fornecedor_nome}</strong></div>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                        <span style={{ fontSize: '1.4em', fontWeight: 'bold', color: '#333' }}>R$ {prod.valor_produto}</span>
                        <button onClick={() => addToCart(prod)} style={{ backgroundColor: 'var(--cor-primary)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', fontWeight: 'bold', fontSize: '0.9em' }}>
                            COMPRAR
                        </button>
                    </div>
                </div>
                ))}
            </div>
            )}
        </div>
    </div>
  );
}