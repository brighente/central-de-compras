import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import { FaBullhorn, FaTrash, FaPercentage, FaClock, FaEdit } from 'react-icons/fa';

export default function FornecedorCampanhas() {
    const { authState } = useContext(AuthContext);
    const [campanhas, setCampanhas] = useState([]);
    
    const [editando, setEditando] = useState(null);


    const [form, setForm] = useState({ 
        descricao: '', 
        tipo_regra: 'VALOR',
        gatilho: '',         
        desconto_percentual: '',
        dias_duracao: 7 
    });

    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authState.token}` };
    const inputStyle = { width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', marginBottom: '10px' };

    useEffect(() => {
        if(authState.token) fetchCampanhas();
    }, [authState.token]);

    const fetchCampanhas = () => {
        fetch('http://localhost:3001/api/campanhas/fornecedor', { headers })
            .then(r => r.json())
            .then(data => {
                setCampanhas(Array.isArray(data) ? data : []);
            })
            .catch(console.error);
    };

    const handleSalvar = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:3001/api/campanhas', {
                method: 'POST', headers, body: JSON.stringify(form)
            });
            if(res.ok) {
                alert('Campanha criada!');
                setForm({ descricao: '', tipo_regra: 'VALOR', gatilho: '', desconto_percentual: '', dias_duracao: 7 });
                fetchCampanhas();
            } else {
                const errorData = await res.json();
                alert('Erro ao criar campanha: ' + (errorData.message || 'Erro desconhecido'));
            }
        } catch(err) { alert('Erro ao salvar'); }
    };

    const abrirEdicao = (campanha) => {
        setEditando({
            id: campanha.id,
            descricao: campanha.descricao,
            tipo_regra: campanha.tipo_regra,
            gatilho: String(campanha.gatilho || ''), 
            desconto_percentual: String(campanha.desconto_percentual || ''),
            dias_duracao: String(campanha.dias_duracao || 7)
        });
    };

    const salvarEdicao = async () => {
        if (!editando) return;

        const bodyToSend = {
            ...editando,
            gatilho: parseFloat(editando.gatilho),
            desconto_percentual: parseFloat(editando.desconto_percentual),
            dias_duracao: parseInt(editando.dias_duracao)
        };

        try {
            const res = await fetch(`http://localhost:3001/api/campanhas/${editando.id}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(bodyToSend) 
            });

            if (res.ok) {
                alert('Campanha atualizada!');
                setEditando(null); 
                fetchCampanhas();  
            } else {
                const err = await res.json();
                alert('Erro ao atualizar: ' + (err.message || 'Erro desconhecido'));
            }
        } catch (error) {
            console.error(error);
            alert('Erro de conexão ao atualizar.');
        }
    };

    const handleExcluir = async (id) => {
        if(!confirm('Remover campanha?')) return;
        await fetch(`http://localhost:3001/api/campanhas/${id}`, { method: 'DELETE', headers });
        fetchCampanhas();
    };

    const handleEditChange = (e) => {
        setEditando({...editando, [e.target.name]: e.target.value});
    };
    const handleEditGatilhoChange = (e) => {
        setEditando({...editando, gatilho: e.target.value});
    };
    const handleEditDescontoChange = (e) => {
        setEditando({...editando, desconto_percentual: e.target.value});
    };
    
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
            {/* Form Criação */}
            <div style={{ background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', height: 'fit-content' }}>
                <h3 style={{marginTop:0, color:'#009933', display:'flex', alignItems:'center', gap:'10px'}}>
                    <FaBullhorn /> Nova Campanha
                </h3>
                <form onSubmit={handleSalvar}>
                    <label style={{fontSize:'0.9rem', color:'#666'}}>Descrição:</label>
                    <input style={inputStyle} value={form.descricao} onChange={e=>setForm({...form, descricao: e.target.value})} placeholder="Ex: Queima de Estoque" required />

                    <label style={{fontSize:'0.9rem', color:'#666'}}>Duração (Dias):</label>
                    <input type="number" style={inputStyle} value={form.dias_duracao} onChange={e=>setForm({...form, dias_duracao: e.target.value})} placeholder="Ex: 7" required />

                    <label style={{fontSize:'0.9rem', color:'#666'}}>Tipo de Regra:</label>
                    <div style={{display:'flex', gap:'10px', marginBottom:'15px'}}>
                        <label style={{cursor:'pointer', display:'flex', alignItems:'center', gap:'5px'}}>
                            <input type="radio" name="tipo" checked={form.tipo_regra === 'VALOR'} onChange={() => setForm({...form, tipo_regra: 'VALOR'})} />
                            Valor (R$)
                        </label>
                        <label style={{cursor:'pointer', display:'flex', alignItems:'center', gap:'5px'}}>
                            <input type="radio" name="tipo" checked={form.tipo_regra === 'QUANTIDADE'} onChange={() => setForm({...form, tipo_regra: 'QUANTIDADE'})} />
                            Qtd (Un)
                        </label>
                    </div>

                    <label style={{fontSize:'0.9rem', color:'#666'}}>
                        {form.tipo_regra === 'VALOR' ? 'Valor Mínimo (R$):' : 'Quantidade Mínima:'}
                    </label>
                    <input type="number" style={inputStyle} value={form.gatilho} onChange={e=>setForm({...form, gatilho: e.target.value})} required />

                    <label style={{fontSize:'0.9rem', color:'#666'}}>Desconto (%):</label>
                    <input type="number" step="0.1" style={inputStyle} value={form.desconto_percentual} onChange={e=>setForm({...form, desconto_percentual: e.target.value})} required />

                    <button type="submit" style={{width:'100%', padding:'12px', background:'#009933', color:'white', border:'none', borderRadius:'5px', fontWeight:'bold', cursor:'pointer'}}>CRIAR</button>
                </form>
            </div>

            {/* Lista */}
            <div style={{ background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                <h3 style={{marginTop:0, color:'#333'}}>Campanhas Ativas</h3>
                <div style={{display:'grid', gap:'15px'}}>
                    {campanhas.map(c => (
                        <div key={c.id} style={{border:'1px solid #eee', padding:'15px', borderRadius:'8px', display:'flex', justifyContent:'space-between', alignItems:'center', borderLeft: '4px solid #009933'}}>
                            <div>
                                <strong style={{fontSize:'1.1rem', color:'#333'}}>{c.descricao}</strong>
                                <div style={{fontSize:'0.85rem', color:'#666', display:'flex', alignItems:'center', gap:'5px', marginTop:'5px'}}>
                                    <FaClock size={12}/> Válido por {c.dias_duracao} dias
                                </div>
                                <div style={{fontSize:'0.9rem', color:'#555', marginTop:'2px'}}>
                                    Regra: Acima de {c.tipo_regra === 'VALOR' ? `R$ ${c.gatilho}` : `${c.gatilho} un.`}
                                </div>
                            </div>
                            <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                                <span style={{background:'#d4edda', color:'#155724', padding:'5px 10px', borderRadius:'15px', fontWeight:'bold'}}>
                                    <FaPercentage size={10}/> {c.desconto_percentual}%
                                </span>
                                <button onClick={() => abrirEdicao(c)} style={{background:'transparent', border:'none', color:'#007bff', cursor:'pointer'}} title="Editar">
                                    <FaEdit size={18} />
                                </button>
                                <button onClick={() => handleExcluir(c.id)} style={{background:'transparent', border:'none', color:'#dc3545', cursor:'pointer'}} title="Excluir">
                                    <FaTrash size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {editando && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '10px', width: '400px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)' }}>
                        <h3 style={{marginTop:0, marginBottom:'20px', color:'#333'}}>Editar Campanha</h3>
                        
                        <label style={{fontSize:'0.9rem', color:'#666'}}>Descrição:</label>
                        <input name="descricao" style={inputStyle} value={editando.descricao} onChange={handleEditChange} />

                        <label style={{fontSize:'0.9rem', color:'#666'}}>Duração (Dias):</label>
                        <input name="dias_duracao" type="number" style={inputStyle} value={editando.dias_duracao} onChange={handleEditChange} />

                        <label style={{fontSize:'0.9rem', color:'#666'}}>Tipo de Regra:</label>
                        <div style={{display:'flex', gap:'10px', marginBottom:'15px'}}>
                            <label style={{cursor:'pointer'}}><input type="radio" checked={editando.tipo_regra === 'VALOR'} onChange={() => setEditando({...editando, tipo_regra: 'VALOR'})} /> Valor</label>
                            <label style={{cursor:'pointer'}}><input type="radio" checked={editando.tipo_regra === 'QUANTIDADE'} onChange={() => setEditando({...editando, tipo_regra: 'QUANTIDADE'})} /> Quantidade</label>
                        </div>

                        <label style={{fontSize:'0.9rem', color:'#666'}}>Gatilho (Valor ou Qtd):</label>
                        <input name="gatilho" type="number" style={inputStyle} value={editando.gatilho} onChange={handleEditGatilhoChange} />

                        <label style={{fontSize:'0.9rem', color:'#666'}}>Desconto (%):</label>
                        <input name="desconto_percentual" type="number" step="0.1" style={inputStyle} value={editando.desconto_percentual} onChange={handleEditDescontoChange} />

                        <div style={{display:'flex', gap:'10px', marginTop:'15px'}}>
                            <button onClick={salvarEdicao} style={{flex:1, padding:'10px', background:'#28a745', color:'white', border:'none', borderRadius:'5px', cursor:'pointer', fontWeight:'bold'}}>SALVAR</button>
                            <button onClick={() => setEditando(null)} style={{flex:1, padding:'10px', background:'#6c757d', color:'white', border:'none', borderRadius:'5px', cursor:'pointer', fontWeight:'bold'}}>CANCELAR</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}