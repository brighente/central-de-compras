import React, { useContext, useState, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import GerenciarProdutos from './GerenciadorProdutos';
import Sidebar from './Sidebar';

export default function FornecedorDashboard() {
    const { logout, authState } = useContext(AuthContext); // Pega o estado de auth

    const [view, setView] = useState('pedidos');

    const [pedidos, setPedidos] = useState([]); // Estado para guardar os pedidos
    const [loading, setLoading] = useState(false);

    const fetchPedidos = async () => {  // Função para buscar os pedidos
        setLoading(true)
        try{
            const response = await fetch('http://localhost:3001/api/pedidos/fornecedor', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authState.token}` // Passa o token('passaporte')
                }
            });

            if(!response.ok){
                throw new Error('Falha ao buscar pedidos. Você será deslogado!');
            }

            const data = await response.json();
            setPedidos(data); // Salva os pedidos no estado
        } catch(err){
            console.error(err);
            logout(); // Desloga o usuário, já que o token ou expirou, ou é inválido
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if(view === 'pedidos' && authState.token){ // Verifica se existe token, caso não, nem tenta nada
            fetchPedidos();
        }
    }, [view, authState.token, logout]); // Lista de gatilhos do 'useEffect()', para rodar novamente caso algum desses valores/funções se alterem

    const handleTrocaStatus = async (pedidoId, novoStatus) => {
        if(!confirm(`Deseja mudar o status para ${novoStatus}?`)){
            return;
        }

        try{
            const response = await fetch(`http://localhost:3001/api/pedidos/${pedidoId}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${authState.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({status: novoStatus})
            });
            
            if(!response.ok){
                alert('Erro ao atualizar status');
            }

            fetchPedidos();

            } catch(err){
                console.error(err);
                alert('Erro na conexão');
            }
        }

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--cor-fundo)', fontFamily: 'sans-serif' }}>
            
            {/* Sidebar */}
            <Sidebar title="ÁREA FORNECEDOR">
                <div onClick={() => setView('pedidos')} style={{ padding: '12px', cursor:'pointer', backgroundColor: view === 'pedidos' ? 'rgba(255,255,255,0.15)' : 'transparent', marginBottom: '8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    📦 Pedidos Recebidos
                </div>

                <div onClick={() => setView('produtos')} style={{ padding: '12px', cursor: 'pointer', backgroundColor: view === 'produtos' ? 'rgba(255,255,255,0.15)' : 'transparent', marginBottom: '8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    🏷️ Meus Produtos
                </div>
            </Sidebar>

            <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
            
            {/* Tela dos Pedidos */}
            {view === 'pedidos' && (
                <div>
                    <h2 style={{ color: 'var(--cor-sidebar)' }}>Pedidos Recebidos</h2>
                    <hr style={{ border: '1px solid #ddd', marginBottom: '20px' }} />
                    
                    {loading && <p>Carregando...</p>}
                    
                    {!loading && pedidos.length === 0 && <p style={{ color: '#666' }}>Nenhum pedido por enquanto.</p>}

                    {!loading && pedidos.map(pedido => {
                        const estiloStatus = getBadgeStyle(pedido.status);

                        return (
                            <div key={pedido.id} style={{ backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: '10px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                                
                                {/* Cabeçalho do Card */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                    <div>
                                        <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#333' }}>Pedido #{pedido.id}</span>
                                        <span style={{ margin: '0 10px', color: '#ccc' }}>|</span>
                                        <span style={{ color: '#555' }}>{pedido.loja_nome}</span>
                                    </div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--cor-primary)' }}>
                                        R$ {parseFloat(pedido.vl_total_pedido).toFixed(2)}
                                    </div>
                                </div>

                                {/* Linha de Status */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f0f0f0', paddingTop: '15px' }}>
                                    
                                    {/* Status */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ fontSize: '0.9rem', color: '#666' }}>Situação:</span>
                                        <span style={{ backgroundColor: estiloStatus.bg, color: estiloStatus.color, border: `1px solid ${estiloStatus.border}`, padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600', letterSpacing: '0.5px'}}>
                                            {pedido.status}
                                        </span>
                                    </div>
                                    
                                    {/* Botões do Card */}
                                    <div>
                                        {pedido.status === 'PENDENTE' && (
                                            <button onClick={() => handleTrocaStatus(pedido.id, 'SEPARADO')} style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600',fontSize: '0.9rem', transition: 'opacity 0.2s' }} onMouseOver={(e) => e.target.style.opacity = '0.9'} onMouseOut={(e) => e.target.style.opacity = '1'}> Separar Pedido </button>
                                        )}

                                        {pedido.status === 'SEPARADO' && (
                                            <button onClick={() => handleTrocaStatus(pedido.id, 'ENVIADO')} style={{ backgroundColor: 'var(--cor-primary)', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', transition: 'opacity 0.2s' }} onMouseOver={(e) => e.target.style.opacity = '0.9'} onMouseOut={(e) => e.target.style.opacity = '1'}> Marcar como Enviado </button>
                                        )}

                                        {pedido.status === 'ENVIADO' && (
                                            <span style={{ color: '#28a745', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <span>✓</span> Finalizado
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Tela dos Produtos */}
            {view === 'produtos' && <GerenciarProdutos />}

            </div>
        </div>
        );
}

    // Função auxiliar para mudar as cores do status
    const getBadgeStyle = (status) => {
        switch(status) {
            case 'PENDENTE': return { bg: '#fff3cd', color: '#856404', border: '#ffeeba' }; // Amarelo
            case 'SEPARADO': return { bg: '#cce5ff', color: '#004085', border: '#b8daff' }; // Azul
            case 'ENVIADO':  return { bg: '#d4edda', color: '#155724', border: '#c3e6cb' }; // Verde
            default: return { bg: '#eee', color: '#333', border: '#ddd' };
        }
    };