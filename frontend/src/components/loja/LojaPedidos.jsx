import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import { FaClock, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa'; // Instale: npm install react-icons

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
                if (res.ok) setMeusPedidos(await res.json());
            } catch (err) { console.error(err); }
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

    // --- NOVO: Componente para calcular e exibir o prazo ---
    const PrazoBadge = ({ dataPedido, diasPrazo, status }) => {
        // Se não tem regra de dias ou o pedido já foi cancelado/finalizado, não mostra nada
        if (!diasPrazo || status === 'CANCELADO') return null;

        const dataInicio = new Date(dataPedido);
        const dataLimite = new Date(dataInicio);
        dataLimite.setDate(dataLimite.getDate() + parseInt(diasPrazo));
        
        const hoje = new Date();
        // Diferença em milissegundos convertida para dias
        const diffTempo = dataLimite - hoje;
        const diasRestantes = Math.ceil(diffTempo / (1000 * 60 * 60 * 24));

        let estilo = {};
        let texto = '';
        let icone = null;

        if (diasRestantes < 0) {
            estilo = { bg: '#ffebee', color: '#c62828', border: '#ef9a9a' };
            texto = `Prazo expirou em ${dataLimite.toLocaleDateString()}`;
            icone = <FaExclamationTriangle />;
        } else if (diasRestantes <= 3) {
            estilo = { bg: '#fff8e1', color: '#ff8f00', border: '#ffe082' }; // Amarelo/Laranja alerta
            texto = `Vence em ${diasRestantes} dia(s) (${dataLimite.toLocaleDateString()})`;
            icone = <FaClock />;
        } else {
            estilo = { bg: '#e8f5e9', color: '#2e7d32', border: '#a5d6a7' }; // Verde tranquilo
            texto = `Vencimento: ${dataLimite.toLocaleDateString()}`;
            icone = <FaCheckCircle />;
        }

        return (
            <div style={{
                marginTop: '10px',
                padding: '8px 12px',
                background: estilo.bg,
                color: estilo.color,
                border: `1px solid ${estilo.border}`,
                borderRadius: '6px',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: '600'
            }}>
                {icone} {texto}
                <span style={{marginLeft: 'auto', fontSize: '0.75rem', opacity: 0.8}}>Condição: {diasPrazo} dias</span>
            </div>
        );
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.8rem', color: '#2c3e50', borderLeft: '5px solid #009933', paddingLeft: '15px', marginBottom: '25px' }}>
                Histórico de Pedidos
            </h2>

            {loading ? <p>Carregando...</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {meusPedidos.length === 0 && <p style={{ color: '#777' }}>Nenhum pedido encontrado.</p>}

                    {meusPedidos.map(pedido => {
                        const st = getStatusStyle(pedido.status);
                        return (
                            <div key={pedido.id} style={{
                                background: 'white', padding: '25px', borderRadius: '12px',
                                border: '1px solid #eee', boxShadow: '0 4px 10px rgba(0,0,0,0.03)',
                                borderLeft: `6px solid ${st.color}`
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
                                    <div>
                                        <h3 style={{ margin: 0, color: '#333' }}>Pedido #{pedido.id}</h3>
                                        <span style={{ fontSize: '0.85rem', color: '#888' }}>
                                            {pedido.dt_inc ? new Date(pedido.dt_inc).toLocaleDateString() : '-'}
                                        </span>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#009933' }}>
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
                                
                                {/* AVISO DE PRAZO DE PAGAMENTO - VISÍVEL APENAS SE PENDENTE */}
                                {pedido.status === 'PENDENTE' && (
                                    <PrazoBadge 
                                        dataPedido={pedido.dt_inc} 
                                        diasPrazo={pedido.prazo_pagamento_dias} 
                                        status={pedido.status} 
                                    />
                                )}

                                <div style={{ background: '#fafafa', borderRadius: '8px', padding: '15px', marginTop: '15px' }}>
                                    {pedido.itens?.map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', padding: '5px 0', borderBottom: '1px dashed #eee' }}>
                                            <span style={{ color: '#555' }}>
                                                <b>{item.quantidade}x</b> {item.nome_produto}
                                            </span>
                                            <span style={{ fontWeight: '600', color: '#444' }}>
                                                R$ {(item.quantidade * item.valor_unitario_praticado).toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {parseFloat(pedido.cashback_ganho) > 0 && (
                                    <div style={{ marginTop: '15px', padding: '10px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '6px', fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        💰 Cashback previsto: R$ {parseFloat(pedido.cashback_ganho).toFixed(2)}
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