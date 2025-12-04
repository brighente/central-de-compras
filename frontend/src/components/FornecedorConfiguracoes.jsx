import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { FaMapMarkedAlt, FaMoneyCheckAlt, FaTrash, FaPlus, FaSave, FaInfoCircle } from 'react-icons/fa';

export default function FornecedorConfiguracoes() {
    const { authState } = useContext(AuthContext);
    
    // --- ESTADOS ---
    const [regrasEstados, setRegrasEstados] = useState([]);
    const [formasPagamento, setFormasPagamento] = useState([]);

    // Estado para Regras de Estado
    const [formEstado, setFormEstado] = useState({
        estado: 'SC',
        valor_cashback_percentual: '',
        prazo_pagamento_dias: '',
        acrescimo_desconto_unitario_valor: ''
    });


    const OPCOES_PAGAMENTO = [
        "Boleto Bancário (À vista)",
        "Boleto Bancário (15 dias)",
        "Boleto Bancário (28 dias)",
        "Boleto Bancário (30/60 dias)",
        "Pix (À vista)",
        "Transferência Bancária",
        "Cartão de Crédito",
        "OUTRO"
    ];

    const [pagamentoSelecionado, setPagamentoSelecionado] = useState(""); // Guarda o valor do Select
    const [textoPersonalizado, setTextoPersonalizado] = useState("");     // Guarda o texto se for OUTRO

    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authState.token}` };

    // --- CARREGAMENTO ---
    useEffect(() => {
        if(authState.token){
            carregarRegras();
            carregarPagamentos();
        }
    }, [authState.token]);

    const carregarRegras = () => {
        fetch('http://localhost:3001/api/condicoes', { headers })
            .then(res => res.json())
            .then(data => Array.isArray(data) ? setRegrasEstados(data) : setRegrasEstados([]))
            .catch(console.error);
    };

    const carregarPagamentos = () => {
        fetch('http://localhost:3001/api/condicoes/pagamento', { headers })
            .then(res => res.json())
            .then(data => Array.isArray(data) ? setFormasPagamento(data) : setFormasPagamento([]))
            .catch(console.error);
    };

    // --- HANDLERS (Regras mantidas iguais) ---
    const handleSalvarRegra = async (e) => {
        e.preventDefault();
        const payload = {
            ...formEstado,
            valor_cashback_percentual: formEstado.valor_cashback_percentual || 0,
            prazo_pagamento_dias: formEstado.prazo_pagamento_dias || 0,
            acrescimo_desconto_unitario_valor: formEstado.acrescimo_desconto_unitario_valor || 0
        };

        try {
            const res = await fetch('http://localhost:3001/api/condicoes', {
                method: 'POST', headers, body: JSON.stringify(payload)
            });
            if(res.ok){
                setFormEstado({ estado: 'SC', valor_cashback_percentual: '', prazo_pagamento_dias: '', acrescimo_desconto_unitario_valor: '' });
                carregarRegras();
            } else {
                const data = await res.json();
                alert('Erro: ' + data.message);
            }
        } catch(err) { alert('Erro ao conectar.'); }
    };

    const handleExcluirRegra = async (id) => {
        if(!confirm('Remover regra deste estado?')) return;
        await fetch(`http://localhost:3001/api/condicoes/${id}`, { method: 'DELETE', headers });
        carregarRegras();
    };

    // --- NOVO HANDLER DE PAGAMENTO ---
    const handleSalvarPagamento = async (e) => {
        e.preventDefault();
        
        // Lógica: Se for OUTRO, usa o texto personalizado. Se não, usa o valor do select.
        let descricaoFinal = "";

        if (pagamentoSelecionado === "OUTRO") {
            if (!textoPersonalizado.trim()) return alert("Por favor, digite a descrição da forma de pagamento.");
            descricaoFinal = textoPersonalizado;
        } else {
            if (!pagamentoSelecionado) return alert("Selecione uma forma de pagamento.");
            descricaoFinal = pagamentoSelecionado;
        }

        try {
            // Enviamos para o backend como 'descricao', mantendo compatibilidade com o banco
            const res = await fetch('http://localhost:3001/api/condicoes/pagamento', {
                method: 'POST', 
                headers, 
                body: JSON.stringify({ descricao: descricaoFinal })
            });
            
            if(res.ok){
                setPagamentoSelecionado("");
                setTextoPersonalizado("");
                carregarPagamentos();
            } else {
                alert('Erro ao salvar pagamento.');
            }
        } catch(err) { console.error(err); }
    };

    const handleExcluirPagamento = async (id) => {
        if(!confirm('Remover forma de pagamento?')) return;
        await fetch(`http://localhost:3001/api/condicoes/pagamento/${id}`, { method: 'DELETE', headers });
        carregarPagamentos();
    };

    const ufs = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

    // --- ESTILOS ---
    const styles = {
        container: { maxWidth: '1200px', margin: '0 auto' },
        header: { color: '#444', marginBottom: '25px', borderLeft: '5px solid #009933', paddingLeft: '15px' },
        section: { background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', marginBottom: '30px' },
        sectionTitle: { marginTop: 0, color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '2px solid #f4f6f8', paddingBottom: '15px', marginBottom: '20px' },
        formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', alignItems: 'start' },
        inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
        label: { fontSize: '0.9rem', color: '#666', fontWeight: '600' },
        input: { padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1rem', outlineColor: '#009933' },
        helper: { fontSize: '0.75rem', color: '#888', marginTop: '4px' },
        btnAdd: { marginTop: '20px', background: '#009933', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' },
        table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px' },
        th: { textAlign: 'left', padding: '15px', background: '#f8f9fa', color: '#555', borderBottom: '2px solid #ddd', fontSize: '0.9rem' },
        td: { padding: '15px', borderBottom: '1px solid #eee', color: '#333' }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.header}>Configurações de Venda</h2>

            {/* PARTE 1: REGRAS REGIONAIS (Mantido Igual) */}
            <div style={styles.section}>
                <h3 style={styles.sectionTitle}><FaMapMarkedAlt color="#009933"/> Regras Regionais (Logística & Impostos)</h3>
                <form onSubmit={handleSalvarRegra}>
                    <div style={styles.formGrid}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Estado (UF)</label>
                            <select style={styles.input} value={formEstado.estado} onChange={e => setFormEstado({...formEstado, estado: e.target.value})}>
                                {ufs.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                            </select>
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Ajuste de Preço (R$)</label>
                            <input type="number" step="0.01" style={styles.input} value={formEstado.acrescimo_desconto_unitario_valor} onChange={e => setFormEstado({...formEstado, acrescimo_desconto_unitario_valor: e.target.value})} placeholder="0.00" />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Cashback (%)</label>
                            <input type="number" step="0.1" style={styles.input} value={formEstado.valor_cashback_percentual} onChange={e => setFormEstado({...formEstado, valor_cashback_percentual: e.target.value})} placeholder="Ex: 5" />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Prazo Pagamento (Dias)</label>
                            <input type="number" style={styles.input} value={formEstado.prazo_pagamento_dias} onChange={e => setFormEstado({...formEstado, prazo_pagamento_dias: e.target.value})} placeholder="Ex: 30" />
                        </div>
                    </div>
                    <button type="submit" style={styles.btnAdd}><FaPlus /> ADICIONAR REGRA</button>
                </form>
                {/* Tabela de regras omitida para brevidade (já estava pronta no código anterior) */}
                <div style={{marginTop: '30px'}}>
                     {/* ... (código da tabela igual ao anterior) ... */}
                     {regrasEstados.length > 0 && (
                        <table style={styles.table}>
                            <thead>
                                <tr><th style={styles.th}>UF</th><th style={styles.th}>Ajuste</th><th style={styles.th}>Cashback</th><th style={styles.th}>Prazo</th><th style={styles.th}>Ações</th></tr>
                            </thead>
                            <tbody>
                                {regrasEstados.map(r => (
                                    <tr key={r.id}>
                                        <td style={styles.td}>{r.estado}</td>
                                        <td style={styles.td}>R$ {parseFloat(r.acrescimo_desconto_unitario_valor).toFixed(2)}</td>
                                        <td style={styles.td}>{r.valor_cashback_percentual}%</td>
                                        <td style={styles.td}>{r.prazo_pagamento_dias} dias</td>
                                        <td style={styles.td}><button onClick={() => handleExcluirRegra(r.id)} style={{color:'#dc3545', background:'none', border:'none', cursor:'pointer'}}><FaTrash /></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                     )}
                </div>
            </div>

            {/* PARTE 2: FORMAS DE PAGAMENTO (ATUALIZADA) */}
            <div style={styles.section}>
                <h3 style={styles.sectionTitle}><FaMoneyCheckAlt color="#009933"/> Formas de Pagamento</h3>
                
                <div style={{display: 'flex', flexWrap: 'wrap', gap: '30px'}}>
                    {/* Formulário de Pagamento */}
                    <div style={{flex: 1, minWidth: '300px'}}>
                        <form onSubmit={handleSalvarPagamento} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                            
                            {/* SELECT DE OPÇÕES PADRÃO */}
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Tipo de Pagamento</label>
                                <select 
                                    style={styles.input} 
                                    value={pagamentoSelecionado} 
                                    onChange={(e) => setPagamentoSelecionado(e.target.value)}
                                    required
                                >
                                    <option value="">Selecione uma opção...</option>
                                    {OPCOES_PAGAMENTO.map(op => (
                                        <option key={op} value={op}>{op}</option>
                                    ))}
                                </select>
                            </div>

                            {/* INPUT CONDICIONAL: SÓ APARECE SE FOR 'OUTRO' */}
                            {pagamentoSelecionado === 'OUTRO' && (
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Descreva a condição personalizada:</label>
                                    <input 
                                        style={styles.input} 
                                        value={textoPersonalizado} 
                                        onChange={e => setTextoPersonalizado(e.target.value)} 
                                        placeholder="Ex: Boleto 30/60/90 com entrada" 
                                        autoFocus
                                    />
                                </div>
                            )}

                            <button type="submit" style={{...styles.btnAdd, alignSelf: 'start'}}>
                                <FaSave /> SALVAR CONDIÇÃO
                            </button>
                        </form>
                    </div>

                    {/* Lista de Pagamentos Cadastrados */}
                    <div style={{flex: 1, minWidth: '300px'}}>
                        <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
                            {formasPagamento.map(fp => (
                                <li key={fp.id} style={{
                                    background: '#fff', border: '1px solid #eee', padding: '12px 15px', 
                                    marginBottom: '8px', borderRadius: '6px', display: 'flex', 
                                    justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                }}>
                                    <span style={{color: '#333', fontWeight: '500'}}>{fp.descricao}</span>
                                    <button onClick={() => handleExcluirPagamento(fp.id)} style={{color:'#dc3545', background:'none', border:'none', cursor:'pointer'}}>
                                        <FaTrash />
                                    </button>
                                </li>
                            ))}
                            {formasPagamento.length === 0 && <li style={{color:'#999', textAlign:'center'}}>Nenhuma forma cadastrada.</li>}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}