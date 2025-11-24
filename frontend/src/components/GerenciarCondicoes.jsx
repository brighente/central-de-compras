import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';

export default function GerenciarCondicoes() {
    const { authState } = useContext(AuthContext);
    const [regras, setRegras] = useState([]);

    const [form, setForm] = useState({
        estado: 'SC',
        valor_cashback_percentual: 0,
        prazo_pagamento_dias: 30,
        acrescimo_desconto_unitario_valor: 0
    });

    const estadosBrasil = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

    const fetchRegras = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/condicoes', {
                headers: {
                    'Authorization': `Bearer ${authState.token}`
                }
            });

            if(!res.ok){
                console.error(err);
                return;
            }

            const data = await res.json();
            if (Array.isArray(data)) {
                setRegras(data);
            } else {
                setRegras([]);
            }
        } catch(err){
            console.error(err)
        }
    }

    useEffect(() => {
        fetchRegras();
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            const res = await fetch('http://localhost:3001/api/condicoes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authState.token}`
                },
                body: JSON.stringify(form)
            });

            if(res.ok){
                alert('Regra salva!');
                fetchRegras();
            } else {
                alert('Erro ao salvar');
            }
        } catch(err){
            console.error(err)
        }
    }

    return (
    <div>
        <h2 style={{ color: 'var(--cor-sidebar)', marginBottom: '20px' }}>Condições por Estado (UF)</h2>

        {/* FORMULÁRIO */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', marginBottom: '30px', borderLeft: '5px solid #00aaff' }}>
            <h3 style={{ marginTop: 0, fontSize: '1rem', color: '#666' }}>Configurar Regra Regional</h3>
        
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', alignItems: 'end' }}>
                
                <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '5px' }}>Estado (UF)</label>
                    <select 
                        value={form.estado} 
                        onChange={e => setForm({...form, estado: e.target.value})}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', background: 'white' }}>
                        {estadosBrasil.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                    </select>
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '5px' }}>Cashback (%)</label>
                    <input type="number" step="0.1" value={form.valor_cashback_percentual} onChange={e => setForm({...form, valor_cashback_percentual: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '5px' }}>Prazo (Dias)</label>
                    <input type="number" value={form.prazo_pagamento_dias} onChange={e => setForm({...form, prazo_pagamento_dias: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '5px' }}>Acréscimo/Desc. (R$)</label>
                    <input type="number" step="0.01" value={form.acrescimo_desconto_unitario_valor} onChange={e => setForm({...form, acrescimo_desconto_unitario_valor: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>

                <button type="submit" style={{ backgroundColor: '#00aaff', color: 'white', border: 'none', padding: '10px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}> SALVAR REGRA </button>
            </form>
            <p style={{fontSize: '0.8rem', color: '#999', marginTop: '10px'}}>* O sistema usará a regra do estado da Loja no momento do pedido.</p>
        </div>

        {/* LISTA */}
        <div style={{ display: 'grid', gap: '15px' }}>
            {regras.map(regra => (
                <div key={regra.id} style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px', border: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ backgroundColor: '#eee', padding: '10px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.2rem', width: '50px', textAlign: 'center' }}>
                        {regra.estado}
                        </div>
                        
                        <div>
                            <div style={{color: 'green', fontWeight: '600'}}>Cashback: {regra.valor_cashback_percentual}%</div>
                            <div style={{fontSize: '0.9rem'}}>Prazo: {regra.prazo_pagamento_dias} dias</div>
                            <div style={{fontSize: '0.9rem', color: regra.acrescimo_desconto_unitario_valor > 0 ? 'red' : 'blue'}}>
                                Ajuste: R$ {regra.acrescimo_desconto_unitario_valor}
                        </div>
                        </div>
                    </div>

                    <button onClick={() => handleDelete(regra.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}> 🗑️ </button>
                </div>
            ))}
        </div>
    </div>
    )
}