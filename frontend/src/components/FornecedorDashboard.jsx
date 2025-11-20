import React, { useContext, useState, useEffect } from 'react';
import AuthContext from '../context/AuthContext';

export default function FornecedorDashboard() {
    const { logout, authState } = useContext(AuthContext); // Pega a função logout e o estado de auth

    const [pedidos, setPedidos] = useState([]); // Estado para guardar os pedidos
    const [loading, setLoading] = useState(true);

    const fetchPedidos = async () => {  // Função para buscar os pedidos
            try{
                const response = await fetch('http://localhost:3001/api/meus-pedidos', {
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
        if(!authState.token){ // Verifica se existe token, caso não, nem tenta nada
            return;
        }
    
        fetchPedidos();
    }, [authState.token, logout]); // Lista de gatilhos do 'useEffect()', para rodar novamente caso algum desses valores/funções se alterem

    const handleStatusChange = async (pedidoId, novoStatus) => {
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
        <div style={{ padding: '20px', fontFamily: 'Arial' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
            <h1>Painel do FORNECEDOR</h1>
            <p>Logado como: {authState.user?.email}</p>
            </div>
            <button onClick={logout} style={{ padding: '10px', cursor: 'pointer' }}>Sair</button>
        </div>

        <hr />
        <h2>Pedidos Recebidos</h2>
        
        {loading && <p>Carregando...</p>}

        {!loading && (
            <ul style={{ listStyle: 'none', padding: 0 }}>
            {pedidos.map(pedido => (
                <li key={pedido.id} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '15px', marginBottom: '20px', boxShadow: '2px 2px 5px rgba(0,0,0,0.1)' }}>
                
                {/* Cabeçalho do Card */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '1.2em', fontWeight: 'bold' }}>Pedido #{pedido.id}</span>
                    <span>Loja: <strong>{pedido.loja_nome}</strong></span>
                </div>

                <div style={{ marginBottom: '10px' }}>
                    Status: <span style={{ fontWeight: 'bold', color: getStatusColor(pedido.status) }}>{pedido.status}</span>
                    <span style={{ float: 'right', fontWeight: 'bold' }}>Total: R$ {pedido.vl_total_pedido}</span>
                </div>

                {/* Lista de Itens */}
                <div style={{ background: '#443b2bff', padding: '10px', borderRadius: '5px' }}>
                    <strong>Itens:</strong>
                    <ul style={{ paddingLeft: '20px', margin: '5px 0' }}>
                    {pedido.itens.map(item => (
                        <li key={item.nome_produto}>
                        {parseFloat(item.quantidade)}x {item.nome_produto} 
                        <span style={{ color: '#666', fontSize: '0.9em' }}> ({item.categoria_produto})</span>
                        </li>
                    ))}
                    </ul>
                </div>

                {/* --- BOTOES DE AÇÃO (Lógica de Status) --- */}
                <div style={{ marginTop: '15px', textAlign: 'right' }}>
                    {pedido.status === 'PENDENTE' && (
                    <button 
                        onClick={() => handleStatusChange(pedido.id, 'SEPARADO')}
                        style={{ background: '#FFA500', color: 'white', border: 'none', padding: '8px 15px', cursor: 'pointer', borderRadius: '4px' }}
                    >
                        Marcar como SEPARADO
                    </button>
                    )}
                    
                    {pedido.status === 'SEPARADO' && (
                    <button 
                        onClick={() => handleStatusChange(pedido.id, 'ENVIADO')}
                        style={{ background: '#28a745', color: 'white', border: 'none', padding: '8px 15px', cursor: 'pointer', borderRadius: '4px' }}
                    >
                        Marcar como ENVIADO
                    </button>
                    )}

                    {pedido.status === 'ENVIADO' && (
                    <span style={{ color: 'green' }}>✔ Pedido Finalizado</span>
                    )}
                </div>

                </li>
            ))}
            </ul>
        )}
        </div>
    );
    }

    // Funçãozinha auxiliar para deixar bonitinho
    function getStatusColor(status) {
    if (status === 'PENDENTE') return 'red';
    if (status === 'SEPARADO') return 'orange';
    if (status === 'ENVIADO') return 'green';
    return 'black';
    }