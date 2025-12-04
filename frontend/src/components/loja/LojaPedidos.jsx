import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../../context/AuthContext';

export default function LojaPedidos() {
    const { authState } = useContext(AuthContext);
    const [meusPedidos, setMeusPedidos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPedidos = async () => {
            try {
                const res = await fetch('http://localhost:3001/api/pedidos/loja', {
                    headers: { 'Authorization': `Bearer ${authState.token}` }
                });
                if(res.ok) setMeusPedidos(await res.json());
            } catch(err) { console.error(err); } 
            finally { setLoading(false); }
        };
        fetchPedidos();
    }, [authState.token]);

    const getStatusStyle = (status) => {
        const styles = {
            'PENDENTE': { bg: '#fff3cd', color: '#856404', border: '#ffeeba' },
            'SEPARADO': { bg: '#cce5ff', color: '#004085', border: '#b8daff' },
            'ENVIADO': { bg: '#d4edda', color: '#155724', border: '#c3e6cb' },
            'CANCELADO': { bg: '#f8d7da', color: '#721c24', border: '#f5c6cb' }
        };
        return styles[status] || { bg: '#f8f9fa', color: '#333', border: '#ddd' };
    };

    return (
        <div style={{maxWidth: '900px', margin: '0 auto'}}>
            <h2 style={{ fontSize: '1.8rem', color: '#2c3e50', borderLeft: '5px solid #009933', paddingLeft: '15px', marginBottom: '25px' }}>
                Histórico de Pedidos
            </h2>

            {loading ? <p>Carregando...</p> : (
                <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
                    {meusPedidos.length === 0 && <p style={{color:'#777'}}>Nenhum pedido encontrado.</p>}
                    
                    {meusPedidos.map(pedido => {
                        const st = getStatusStyle(pedido.status);
                        return (
                            <div key={pedido.id} style={{
                                background: 'white', padding: '25px', borderRadius: '12px', 
                                border: '1px solid #eee', boxShadow: '0 4px 10px rgba(0,0,0,0.03)',
                                borderLeft: `6px solid ${st.color}`
                            }}>
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px'}}>
                                    <div>
                                        <h3 style={{margin: 0, color: '#333'}}>Pedido #{pedido.id}</h3>
                                        <span style={{fontSize: '0.85rem', color: '#888'}}>
                                            {pedido.data_pedido ? new Date(pedido.data_pedido).toLocaleDateString() : '-'}
                                        </span>
                                    </div>
                                    <div style={{textAlign: 'right'}}>
                                        <div style={{fontSize: '1.4rem', fontWeight: 'bold', color: '#009933'}}>
                                            R$ {parseFloat(pedido.vl_total_pedido).toFixed(2)}
                                        </div>
                                        <span style={{
                                            background: st.bg, color: st.color, border: `1px solid ${st.border}`,
                                            padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold'
                                        }}>
                                            {pedido.status}
                                        </span>
                                    </div>
                                </div>

                                <div style={{background: '#fafafa', borderRadius: '8px', padding: '15px'}}>
                                    {pedido.itens?.map((item, idx) => (
                                        <div key={idx} style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', padding: '5px 0', borderBottom: '1px dashed #eee'}}>
                                            <span style={{color: '#555'}}>
                                                <b>{item.quantidade}x</b> {item.nome_produto}
                                            </span>
                                            <span style={{fontWeight: '600', color: '#444'}}>
                                                R$ {(item.quantidade * item.valor_unitario_praticado).toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {parseFloat(pedido.cashback_ganho) > 0 && (
                                    <div style={{marginTop: '15px', padding: '10px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '6px', fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px'}}>
                                        💰 Cashback ganho: R$ {parseFloat(pedido.cashback_ganho).toFixed(2)}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}