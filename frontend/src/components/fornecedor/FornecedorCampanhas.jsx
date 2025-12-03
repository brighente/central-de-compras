import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import { FaBullhorn, FaPlus, FaCalendarAlt, FaMoneyBillWave } from 'react-icons/fa';

export default function FornecedorCampanhas() {
    const { authState } = useContext(AuthContext);
    
    const [minhasCampanhas, setMinhasCampanhas] = useState([]);
    const [campanhaForm, setCampanhaForm] = useState({ descricao: '', valor_meta: '', duracao_dias: '' });
    const [loading, setLoading] = useState(false);

    // --- BUSCAR CAMPANHAS ---
    useEffect(() => {
        if (!authState.token) return;
        fetchCampanhas();
    }, [authState.token]);

    const fetchCampanhas = () => {
        fetch('http://localhost:3001/api/campanhas', {
            headers: { 'Authorization': `Bearer ${authState.token}` }
        })
        .then(r => r.json())
        .then(setMinhasCampanhas)
        .catch(console.error);
    };

    // --- SALVAR NOVA CAMPANHA ---
    const handleSalvar = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('http://localhost:3001/api/campanhas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authState.token}`
                },
                body: JSON.stringify(campanhaForm)
            });

            if (res.ok) {
                alert('Campanha lançada com sucesso!');
                setCampanhaForm({ descricao: '', valor_meta: '', duracao_dias: '' });
                fetchCampanhas(); // Atualiza a lista
            } else {
                alert('Erro ao criar campanha');
            }
        } catch (err) {
            alert('Erro de conexão');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            
            {/* --- COLUNA 1: FORMULÁRIO --- */}
            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', height: 'fit-content' }}>
                <h2 style={{marginTop: 0, color: '#009933', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <FaPlus size={16}/> Nova Campanha
                </h2>
                <p style={{fontSize: '0.85rem', color: '#666', marginBottom: '20px'}}>Crie metas de venda para incentivar as lojas.</p>
                
                <form onSubmit={handleSalvar} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                        <label style={labelStyle}>Descrição da Campanha</label>
                        <input 
                            style={inputStyle} 
                            placeholder="Ex: Meta de Verão - R$ 5.000"
                            value={campanhaForm.descricao}
                            onChange={e => setCampanhaForm({...campanhaForm, descricao: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Meta de Venda (R$)</label>
                        <input 
                            type="number" style={inputStyle} placeholder="0.00"
                            value={campanhaForm.valor_meta}
                            onChange={e => setCampanhaForm({...campanhaForm, valor_meta: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Duração (Dias)</label>
                        <input 
                            type="number" style={inputStyle} placeholder="30"
                            value={campanhaForm.duracao_dias}
                            onChange={e => setCampanhaForm({...campanhaForm, duracao_dias: e.target.value})}
                            required
                        />
                    </div>
                    <button type="submit" disabled={loading} style={btnStyle}>
                        {loading ? 'LANÇANDO...' : 'LANÇAR CAMPANHA'}
                    </button>
                </form>
            </div>

            {/* --- COLUNA 2: LISTA ATIVA --- */}
            <div>
                <h2 style={{marginTop: 0, color: '#333', fontSize: '1.2rem', marginBottom: '15px'}}>Campanhas Ativas</h2>
                {minhasCampanhas.length === 0 ? <p style={{color: '#999'}}>Nenhuma campanha ativa no momento.</p> : (
                    <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                        {minhasCampanhas.map(c => (
                            <div key={c.id} style={{background: 'white', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #17a2b8', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'}}>
                                <div style={{fontWeight: 'bold', fontSize: '1.1rem', color: '#333', display: 'flex', alignItems: 'center', gap: '8px'}}>
                                    <FaBullhorn color="#17a2b8"/> {c.descricao_campanha}
                                </div>
                                
                                <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '15px', fontSize: '0.9rem', color: '#555'}}>
                                    <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
                                        <FaMoneyBillWave color="#009933"/> Meta: <strong>R$ {parseFloat(c.valor_meta).toFixed(2)}</strong>
                                    </div>
                                    <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
                                        <FaCalendarAlt color="#666"/> Duração: <strong>{c.tempo_duracao_campanha} dias</strong>
                                    </div>
                                </div>

                                {/* Barra de Progresso Visual */}
                                <div style={{width: '100%', height: '6px', background: '#eee', borderRadius: '3px', marginTop: '15px'}}>
                                    <div style={{width: '0%', height: '100%', background: '#17a2b8', borderRadius: '3px'}}></div>
                                </div>
                                <div style={{fontSize: '0.75rem', color: '#999', marginTop: '5px', textAlign: 'right'}}>0% atingido</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// Estilos Inline (Reutilizados)
const inputStyle = { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box', outline: 'none', fontSize: '0.95rem' };
const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.85rem', color: '#555' };
const btnStyle = { marginTop: '10px', background: '#009933', color: 'white', border: 'none', padding: '14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', width: '100%', fontSize: '0.9rem', boxShadow: '0 2px 4px rgba(0,153,51,0.2)' };