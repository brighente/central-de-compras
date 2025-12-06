import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import { FaBox, FaCheck, FaTruck, FaFileInvoiceDollar, FaEdit, FaTimes } from 'react-icons/fa';

export default function FornecedorPedidos() {
    const { authState } = useContext(AuthContext);
    const [meusPedidos, setMeusPedidos] = useState([]);
    
    const [editandoId, setEditandoId] = useState(null);
    const [novoStatus, setNovoStatus] = useState('');

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

    const atualizarStatus = async (id, statusParaEnviar) => {
        try {
            const res = await fetch(`http://localhost:3001/api/pedidos/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authState.token}`
                },
                body: JSON.stringify({ status: statusParaEnviar })
            });
            if(res.ok) {
                fetchPedidos();
                setEditandoId(null); 
            } else {
                alert('Erro ao atualizar pedido');
            }
        } catch(err) {
            alert('Erro de conexão');
        }
    };

    const iniciarEdicao = (pedido) => {
        setEditandoId(pedido.id);
        setNovoStatus(pedido.status);
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
                                    {editandoId !== p.id && (
                                        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                            {p.status === 'PENDENTE' && (
                                                <button onClick={() => atualizarStatus(p.id, 'SEPARADO')} style={btnAcaoStyle('#007bff')} title="Marcar como Separado">
                                                    <FaBox style={{marginRight: '5px'}}/> Separar
                                                </button>
                                            )}
                                            {p.status === 'SEPARADO' && (
                                                <button onClick={() => atualizarStatus(p.id, 'ENVIADO')} style={btnAcaoStyle('#28a745')} title="Marcar como Enviado">
                                                    <FaTruck style={{marginRight: '5px'}}/> Enviar
                                                </button>
                                            )}
                                            
                                            <button 
                                                onClick={() => iniciarEdicao(p)}
                                                style={{background: 'transparent', border: '1px solid #ccc', borderRadius: '4px', padding: '6px', cursor: 'pointer', color: '#666'}}
                                                title="Editar status manualmente"
                                            >
                                                <FaEdit />
                                            </button>
                                        </div>
                                    )}

                                    {editandoId === p.id && (
                                        <div style={{display: 'flex', alignItems: 'center', gap: '5px', background: '#f8f9fa', padding: '5px', borderRadius: '5px', border: '1px solid #ddd'}}>
                                            <select 
                                                value={novoStatus} 
                                                onChange={(e) => setNovoStatus(e.target.value)}
                                                style={{padding: '5px', borderRadius: '4px', border: '1px solid #ccc'}}
                                            >
                                                <option value="PENDENTE">PENDENTE</option>
                                                <option value="SEPARADO">SEPARADO</option>
                                                <option value="ENVIADO">ENVIADO</option>
                                                <option value="CANCELADO">CANCELADO</option>
                                            </select>
                                            
                                            <button 
                                                onClick={() => atualizarStatus(p.id, novoStatus)}
                                                style={{background: '#28a745', color: 'white', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer'}}
                                                title="Salvar"
                                            >
                                                <FaCheck />
                                            </button>
                                            
                                            <button 
                                                onClick={() => setEditandoId(null)}
                                                style={{background: '#dc3545', color: 'white', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer'}}
                                                title="Cancelar"
                                            >
                                                <FaTimes />
                                            </button>
                                        </div>
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

const BadgeStatus = ({ status }) => {
    let cor = '#6c757d'; 
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