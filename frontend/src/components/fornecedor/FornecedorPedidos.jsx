import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import { FaBox, FaCheck, FaTruck, FaFileInvoiceDollar } from 'react-icons/fa';

export default function FornecedorPedidos() {
    const { authState } = useContext(AuthContext);
    const [meusPedidos, setMeusPedidos] = useState([]);

    useEffect(() => {
        if (!authState.token) return;
        fetchPedidos();
    }, [authState.token]);

    const fetchPedidos = () => {
        fetch('http://localhost:3001/api/pedidos/fornecedor', {
            headers: { 'Authorization': `Bearer ${authState.token}` }
        })
        .then(r => r.json())
        .then(setMeusPedidos)
        .catch(console.error);
    };

    const atualizarStatus = async (id, novoStatus) => {
        try {
            const res = await fetch(`http://localhost:3001/api/pedidos/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authState.token}`
                },
                body: JSON.stringify({ status: novoStatus })
            });
            if(res.ok) {
                fetchPedidos(); // Recarrega para ver a mudança
            } else {
                alert('Erro ao atualizar pedido');
            }
        } catch(err) {
            alert('Erro de conexão');
        }
    };

    return (
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
            <h2 style={{marginTop: 0, color: '#333', fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px'}}>
                <FaFileInvoiceDollar /> Gerenciar Pedidos
            </h2>
            
            {meusPedidos.length === 0 ? <p style={{color: '#999', textAlign: 'center', padding: '20px'}}>Nenhum pedido recebido ainda.</p> : (
                <table style={{width: '100%', borderCollapse: 'collapse'}}>
                    <thead>
                        <tr style={{textAlign: 'left', borderBottom: '2px solid #eee', color: '#888', fontSize: '0.9rem'}}>
                            <th style={{padding: '12px'}}>ID</th>
                            <th style={{padding: '12px'}}>Data</th>
                            <th style={{padding: '12px'}}>Loja</th>
                            <th style={{padding: '12px'}}>Itens do Pedido</th>
                            <th style={{padding: '12px'}}>Total</th>
                            <th style={{padding: '12px'}}>Status</th>
                            <th style={{padding: '12px'}}>Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {meusPedidos.map(p => (
                            <tr key={p.id} style={{borderBottom: '1px solid #f9f9f9'}}>
                                <td style={{padding: '12px', color: '#555'}}>#{p.id}</td>
                                <td style={{padding: '12px', fontSize: '0.9rem'}}>{new Date(p.dt_inc).toLocaleDateString()}</td>
                                <td style={{padding: '12px', fontWeight: 'bold', color: '#333'}}>{p.loja_nome}</td>
                                
                                <td style={{padding: '12px'}}>
                                    <ul style={{margin: 0, paddingLeft: '0', listStyle: 'none', fontSize: '0.85rem', color: '#666'}}>
                                        {p.itens && p.itens.map((item, i) => (
                                            <li key={i} style={{marginBottom: '4px'}}>
                                                <strong>{item.quantidade}x</strong> {item.nome_produto}
                                            </li>
                                        ))}
                                    </ul>
                                </td>
                                
                                <td style={{padding: '12px', fontWeight: 'bold', color: '#009933'}}>
                                    R$ {parseFloat(p.vl_total_pedido).toFixed(2)}
                                </td>
                                
                                <td style={{padding: '12px'}}>
                                    <BadgeStatus status={p.status} />
                                </td>
                                
                                <td style={{padding: '12px'}}>
                                    {p.status === 'PENDENTE' && (
                                        <button 
                                            onClick={() => atualizarStatus(p.id, 'SEPARADO')}
                                            style={btnAcaoStyle('#007bff')}
                                            title="Marcar como Separado"
                                        >
                                            <FaBox style={{marginRight: '5px'}}/> Separar
                                        </button>
                                    )}
                                    {p.status === 'SEPARADO' && (
                                        <button 
                                            onClick={() => atualizarStatus(p.id, 'ENVIADO')}
                                            style={btnAcaoStyle('#28a745')}
                                            title="Marcar como Enviado"
                                        >
                                            <FaTruck style={{marginRight: '5px'}}/> Enviar
                                        </button>
                                    )}
                                    {p.status === 'ENVIADO' && (
                                        <span style={{color: '#28a745', fontSize: '1.2rem'}}><FaCheck /></span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

// Componente visual para o Status
const BadgeStatus = ({ status }) => {
    let cor = '#6c757d'; // Padrão cinza
    let bg = '#e2e3e5';

    if(status === 'PENDENTE') { cor = '#856404'; bg = '#fff3cd'; }
    if(status === 'SEPARADO') { cor = '#004085'; bg = '#cce5ff'; }
    if(status === 'ENVIADO')  { cor = '#155724'; bg = '#d4edda'; }
    if(status === 'CANCELADO'){ cor = '#721c24'; bg = '#f8d7da'; }

    return (
        <span style={{background: bg, color: cor, padding: '4px 10px', borderRadius: '15px', fontSize: '0.75rem', fontWeight: 'bold'}}>
            {status}
        </span>
    );
};

const btnAcaoStyle = (cor) => ({
    background: cor, 
    color: 'white', 
    border: 'none', 
    padding: '6px 12px', 
    borderRadius: '4px', 
    cursor: 'pointer', 
    fontSize: '0.8rem', 
    display: 'flex', 
    alignItems: 'center',
    transition: 'opacity 0.2s',
    ':hover': { opacity: 0.8 }
});