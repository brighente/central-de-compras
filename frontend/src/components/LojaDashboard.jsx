import React, { useContext, useEffect, useState } from 'react';
import AuthContext from '../context/AuthContext';

export default function LojaDashboard() {
    const { logout, authState } = useContext(AuthContext); // Pega a função logout e o estado de auth
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
    
    const handleComprar = (produto) => {
        alert(`Você clicou em comprar: ${produto.produto}`)
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--cor-fundo)' }}>
            <div style={{ width: '250px', backgroundColor: 'var(--cor-sidebar)', color: 'white',padding: '20px',display: 'flex', flexDirection: 'column'
            }}>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '40px' }}>CENTRAL COMPRAS</h2>
                <div style={{ marginBottom: '10px' }}>📊 Visão Geral</div>
                <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>🛒 Vitrine</div>
                <div style={{ marginBottom: '10px' }}>📦 Meus Pedidos</div>
            
                <div style={{ marginTop: 'auto' }}>
                    <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>{authState.user?.email}</p>
                    <button onClick={logout} style={{ background: 'transparent', border: '1px solid white', color: 'white', padding: '5px 15px',  marginTop: '10px', width: '100%', borderRadius: '4px'}}> 
                        Sair
                    </button>
                </div>
            </div>

            {/* --- CONTEÚDO PRINCIPAL --- */}
            <div style={{ flex: 1, padding: '30px' }}>
                <h1 style={{ color: 'var(--cor-sidebar)', marginBottom: '20px' }}>Vitrine de Produtos</h1>
                <hr style={{ border: '1px solid #ddd', marginBottom: '30px' }} />

                {loading && <p>Carregando produtos...</p>}

                {!loading && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                    {produtos.map(prod => (
                        <div key={prod.id} style={{ backgroundColor: 'var(--cor-branco)', borderRadius: '8px', padding: '20px', width: '280px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid #eee'}}>
                            <div>
                                <span style={{ backgroundColor: '#e8f5e9', color: 'var(--cor-primary)', fontSize: '0.7em', padding: '3px 8px', borderRadius: '10px',fontWeight: 'bold',textTransform: 'uppercase'}}>
                                    {prod.nome_categoria}
                                </span>
                            
                                <h3 style={{ margin: '15px 0 5px 0', fontSize: '1.1em', color: '#333' }}>
                                    {prod.produto}
                                </h3>
                            
                                <div style={{ color: '#888', fontSize: '0.9em', marginBottom: '20px' }}>
                                    Vendido por: <strong>{prod.fornecedor_nome}</strong>
                                </div>
                            </div>
                        
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                                <span style={{ fontSize: '1.4em', fontWeight: 'bold', color: '#333' }}>
                                    R$ {prod.valor_produto}
                                </span>
                                <button onClick={() => handleComprar(prod)} style={{ backgroundColor: 'var(--cor-primary)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', fontWeight: 'bold', fontSize: '0.9em'}}>
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