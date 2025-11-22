import React, { useContext, useState, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import GerenciarProdutos from './GerenciadorProdutos';

export default function FornecedorDashboard() {
    const { logout, authState } = useContext(AuthContext); // Pega a função logout e o estado de auth

    const [view, setView] = useState('pedidos');

    const [pedidos, setPedidos] = useState([]); // Estado para guardar os pedidos
    const [loading, setLoading] = useState(false);

    const fetchPedidos = async () => {  // Função para buscar os pedidos
        setLoading(true)
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
            
            {/* --- Barra Lateral --- */}
            <div style={{ width: '250px', backgroundColor: 'var(--cor-sidebar)', color: 'white', padding: '20px', display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '40px' }}>ÁREA FORNECEDOR</h2>
                <div onClick={() => setView('pedidos')} style={{ padding: '10px', cursor: 'pointer', backgroundColor: view === 'pedidos' ? 'rgba(255,255,255,0.1)' : 'transparent', marginBottom: '5px', borderRadius: '4px' }}> 📦 Pedidos Recebidos </div>
                
                <div onClick={() => setView('produtos')} style={{ padding: '10px', cursor: 'pointer', backgroundColor: view === 'produtos' ? 'rgba(255,255,255,0.1)' : 'transparent', marginBottom: '5px', borderRadius: '4px' }}> 🏷️ Meus Produtos </div>

                <div style={{ marginTop: 'auto' }}>
                    <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>{authState.user?.email}</p>
                    <button onClick={logout} style={{ background: 'transparent', border: '1px solid white', color: 'white', padding: '5px 15px', width: '100%', borderRadius: '4px' }}>Sair</button>
                </div>
            </div>

            <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
            
            {/* Tela dos Pedidos */}
            {view === 'pedidos' && (
                <div>
                    <h2 style={{ color: 'var(--cor-sidebar)' }}>Pedidos Recebidos</h2>
                    <hr style={{ border: '1px solid #ddd', marginBottom: '20px' }} />
                    {loading && <p>Carregando...</p>}
                    {!loading && pedidos.map(pedido => (
                        <div key={pedido.id} style={{ backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <strong>Pedido #{pedido.id} - {pedido.loja_nome}</strong>
                                <span>R$ {pedido.vl_total_pedido}</span>
                            </div>
                            <div>Status: <strong>{pedido.status}</strong></div>
                            
                            {/* Botões */}
                            <div style={{ marginTop: '10px' }}>
                                {pedido.status === 'PENDENTE' && <button onClick={() => handleTrocaStatus(pedido.id, 'SEPARADO')} style={{ marginRight: '10px' }}>Separar</button>}
                                {pedido.status === 'SEPARADO' && <button onClick={() => handleTrocaStatus(pedido.id, 'ENVIADO')}>Enviar</button>}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Tela dos Produtos */}
            {view === 'produtos' && <GerenciarProdutos />}

            </div>
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