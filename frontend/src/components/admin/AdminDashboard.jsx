// ... (imports permanecem iguais)
import React, { useState, useContext, useEffect } from 'react';
import AuthContext from '../../context/AuthContext';
import SidebarAdmin from './SidebarAdmin';
import { FaTrash, FaEdit, FaTimes, FaCheckCircle, FaCopy } from 'react-icons/fa';
import { IMaskInput } from 'react-imask'; // Importação do IMaskInput

export default function AdminDashboard(){
    // ... (Estados, initialFormState e useEffects permanecem iguais)
    const { logout, authState } = useContext(AuthContext);
    
    const [aba, setAba] = useState('loja'); 
    const [editandoId, setEditandoId] = useState(null); 
    const [resultado, setResultado] = useState(null);
    
    const [credenciaisGeradas, setCredenciaisGeradas] = useState(null);
    
    const [listaFornecedores, setListaFornecedores] = useState([]);
    const [listaCategorias, setListaCategorias] = useState([]);
    const [dadosTabela, setDadosTabela] = useState([]);

    const initialFormState = {
        nome_fantasia: '', razao_social: '', cnpj: '', email: '', telefone: '', 
        logradouro: '', numero: '', bairro: '', cidade: '', estado: 'SC', cep: '', 
        produto: '', valor_produto: '', id_categoria: '', id_fornecedor: ''
    };

    const [form, setForm] = useState(initialFormState);

    useEffect(() => {
        setCredenciaisGeradas(null);
    }, [aba]);

    useEffect(() => {
        const headers = { 'Authorization': `Bearer ${authState.token}` };

        if(aba === 'produto' || aba === 'lista_produto'){
            fetch('http://localhost:3001/api/admin/lista-fornecedores', { headers }).then(res => res.json()).then(setListaFornecedores);
            fetch('http://localhost:3001/api/admin/lista-categorias', { headers }).then(res => res.json()).then(setListaCategorias);
        }

        if(aba.startsWith('lista_')){
            setEditandoId(null);
            setForm(initialFormState);

            let endpoint = '';
            if(aba === 'lista_loja') endpoint = '/lojas';
            if(aba === 'lista_fornecedor') endpoint = '/fornecedores';
            if(aba === 'lista_produto') endpoint = '/produtos';

            fetch(`http://localhost:3001/api/admin${endpoint}`, { headers })
                .then(res => res.json())
                .then(setDadosTabela)
                .catch(err => console.error("Erro lista", err));
        }
    }, [aba, authState.token]);


    // 🎯 FUNÇÃO CORRIGIDA: Garante que todos os campos sejam preenchidos
    const handleEdit = (item) => {
        setEditandoId(item.id);
        setResultado(null);
        setCredenciaisGeradas(null); 

        // 1. Cria um objeto base que preenche todos os campos definidos em initialFormState
        const baseForm = {
            // Usa o item como base, garantindo que nome_fantasia, razao_social, etc. sejam preenchidos.
            ...item, 
            
            // Tratamento de campos que podem ser nulos no DB ou precisam de conversão:
            
            // Campos mascarados (IMaskInput) devem aceitar o valor puro do DB:
            cnpj: item.cnpj || '',
            telefone: item.telefone || '',
            cep: item.cep || '',
            
            // Campos de texto que podem ser nulos
            nome_fantasia: item.nome_fantasia || '',
            razao_social: item.razao_social || '',
            logradouro: item.logradouro || '',
            numero: item.numero || '',
            bairro: item.bairro || '',
            cidade: item.cidade || '',
            estado: item.estado || 'SC', 

            // Campos específicos de Produto
            produto: item.produto || '',
            
            // Trata valores numéricos para o campo de texto (input type="number")
            valor_produto: item.valor_produto ? String(parseFloat(item.valor_produto).toFixed(2)) : '',

            // Trata chaves estrangeiras (IDs) para preencher o <select> (sempre como string)
            id_categoria: item.id_categoria ? String(item.id_categoria) : '',
            id_fornecedor: item.id_fornecedor ? String(item.id_fornecedor) : ''
        };
        
        setForm(baseForm);

        // Muda para a aba do formulário correspondente
        if(aba === 'lista_loja') setAba('loja');
        if(aba === 'lista_fornecedor') setAba('fornecedor');
        if(aba === 'lista_produto') setAba('produto');
    };

    const cancelarEdicao = () => {
        setEditandoId(null);
        setForm(initialFormState);
        setResultado(null);
    };

    const handleChange = (e) => {
        setForm({...form, [e.target.name]: e.target.value});
    };

    const handleMaskChange = (value, name) => {
        // 'value' aqui é o valor sem a máscara (apenas números)
        setForm(prev => ({ ...prev, [name]: value }));
    };

    // ... (handleDelete e handleSubmit permanecem iguais)
    const handleDelete = async (id) => {
        // ... (lógica de exclusão)
        const confirmacao1 = window.confirm(
            "⚠️ PERIGO: Você tem certeza que deseja excluir este registro?\n\n" +
            "Isso forçará a exclusão de TODOS os dados vinculados.\n\n" +
            "Essa ação NÃO PODE ser desfeita."
        );

        if (!confirmacao1) return;

        const confirmacao2 = window.prompt("Para confirmar a exclusão permanente, digite exatamente: confirmar");

        if (confirmacao2 !== 'confirmar') {
            alert("Ação cancelada. A palavra digitada estava incorreta.");
            return;
        }

        let tipo = aba === 'lista_loja' ? 'loja' : aba === 'lista_fornecedor' ? 'fornecedor' : 'produto';

        try {
            const res = await fetch(`http://localhost:3001/api/admin/${tipo}/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${authState.token}` }
            });
            
            const data = await res.json();

            if(res.ok){
                setDadosTabela(prev => prev.filter(item => item.id !== id));
                alert('Registro e dependências excluídos com sucesso!');
            } else {
                alert('Erro: ' + data.message);
            }
        } catch(err) { 
            console.error(err);
            alert('Erro de conexão.'); 
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCredenciaisGeradas(null); 
        
        let url = 'http://localhost:3001/api/admin';
        let method = 'POST';

        // Prepara os dados: remove a formatação dos campos mascarados
        const formToSend = { ...form };
        // Garante que os campos mascarados só contenham números, caso o DB espere assim.
        if (formToSend.cnpj) formToSend.cnpj = formToSend.cnpj.replace(/\D/g, '');
        if (formToSend.cep) formToSend.cep = formToSend.cep.replace(/\D/g, '');
        if (formToSend.telefone) formToSend.telefone = formToSend.telefone.replace(/\D/g, '');

        if(editandoId) {
            method = 'PUT'; 
            if(aba === 'loja') url += `/loja/${editandoId}`;
            else if(aba === 'fornecedor') url += `/fornecedor/${editandoId}`;
            else if(aba === 'produto') url += `/produto/${editandoId}`;
        } else {
            if(aba === 'loja') url += '/loja';
            else if(aba === 'fornecedor') url += '/fornecedor';
            else if(aba === 'produto') url += '/produtos';
        }

        try {
            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authState.token}` },
                body: JSON.stringify(formToSend)
            });
            const data = await res.json();
            
            if(res.ok){
                setResultado(data);
                
                if(!editandoId) {
                    if(data.credenciais && data.credenciais.senha_temporaria){
                        setCredenciaisGeradas({
                            email: form.email,
                            senha: data.credenciais.senha_temporaria
                        });
                    } else {
                        alert(data.message);
                    }
                    setForm(initialFormState); 
                } else {
                    alert(data.message); 
                }

            } else {
                alert('Erro: ' + data.message);
            }
        } catch(err) {
            alert('Erro ao conectar com servidor');
        }
    };

    const estados = [ 'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO' ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f6f8' }}>
            {/* ... (Sidebar Admin) */}
            <SidebarAdmin aoClicar={(novaAba) => { setAba(novaAba); setEditandoId(null); setForm(initialFormState); }} onLogout={logout} />

            <div style={{ flex: 1, padding: '40px' }}>
                {/* ... (Título e botão Cancelar Edição) */}
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '30px'}}>
                    <h1 style={{ color: '#333', fontSize: '2rem', margin: 0 }}>
                        {editandoId ? `Editando ${aba.toUpperCase()}` : (aba.includes('lista') ? 'Gerenciar Registros' : `Cadastro de ${aba.charAt(0).toUpperCase() + aba.slice(1)}`)}
                    </h1>
                    {editandoId && (
                        <button onClick={cancelarEdicao} style={{background: '#6c757d', color:'white', border:'none', padding:'10px 20px', borderRadius:'5px', cursor:'pointer', display:'flex', alignItems:'center', gap:'10px'}}>
                            <FaTimes /> Cancelar Edição
                        </button>
                    )}
                </div>

                {/* (Componente de credenciais permanece igual) */}
                {credenciaisGeradas && (
                    <div style={{
                        backgroundColor: '#d4edda', 
                        border: '1px solid #c3e6cb', 
                        borderRadius: '8px', 
                        padding: '20px', 
                        marginBottom: '30px', 
                        color: '#155724',
                        position: 'relative'
                    }}>
                        <div style={{display:'flex', alignItems:'center', gap: '10px', marginBottom: '10px'}}>
                            <FaCheckCircle size={24} />
                            <h3 style={{margin:0}}>Cadastro realizado com sucesso!</h3>
                        </div>
                        <p style={{margin: '0 0 10px 0'}}>Entregue estas credenciais ao usuário. A senha temporária não poderá ser visualizada novamente.</p>
                        
                        <div style={{backgroundColor: 'white', padding: '15px', borderRadius: '6px', border: '1px dashed #28a745', display: 'inline-block', minWidth: '300px'}}>
                            <div style={{marginBottom: '5px'}}><strong>Login (Email):</strong> <span style={{fontFamily:'monospace', fontSize:'1.1em'}}>{credenciaisGeradas.email}</span></div>
                            <div><strong>Senha Temporária:</strong> <span style={{fontFamily:'monospace', fontSize:'1.1em', background:'#eee', padding:'2px 5px', borderRadius:'4px'}}>{credenciaisGeradas.senha}</span></div>
                        </div>

                        <button 
                            onClick={() => setCredenciaisGeradas(null)} 
                            style={{position:'absolute', top:'15px', right:'15px', background:'transparent', border:'none', cursor:'pointer', color:'#155724', fontSize:'1.2rem'}}
                        >
                            <FaTimes />
                        </button>
                    </div>
                )}

                {/* (Tabela permanece igual) */}
                {aba.startsWith('lista_') ? (
                    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                                    <th style={thStyle}>ID</th>
                                    <th style={thStyle}>Nome/Produto</th>
                                    {aba === 'lista_produto' && <th style={thStyle}>Fornecedor</th>}
                                    {aba !== 'lista_produto' && <th style={thStyle}>CNPJ/Email</th>}
                                    {aba === 'lista_produto' ? <th style={thStyle}>Preço</th> : <th style={thStyle}>Cidade</th>}
                                    <th style={thStyle}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dadosTabela.map(item => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={tdStyle}>#{item.id}</td>
                                        <td style={tdStyle}>{item.nome_fantasia || item.produto}</td>
                                        
                                        {aba === 'lista_produto' && <td style={tdStyle}>{item.nome_fornecedor}</td>}

                                        {aba !== 'lista_produto' && (
                                            <td style={tdStyle}>
                                                <div>{item.cnpj}</div>
                                                <small style={{color:'#666'}}>{item.email}</small>
                                            </td>
                                        )}
                                        
                                        <td style={tdStyle}>
                                            {aba === 'lista_produto' 
                                                ? `R$ ${parseFloat(item.valor_produto).toFixed(2)}` 
                                                : `${item.cidade || 'N/A'}/${item.estado || 'N/A'}`}
                                        </td>
                                        
                                        <td style={tdStyle}>
                                            <div style={{display:'flex', gap:'10px'}}>
                                                <button onClick={() => handleEdit(item)} style={{...btnActionStyle, background: '#ffc107', color: '#333'}} title="Editar">
                                                    <FaEdit />
                                                </button>
                                                <button onClick={() => handleDelete(item.id)} style={{...btnActionStyle, background: '#dc3545', color: 'white'}} title="Excluir">
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    /* === FORMULÁRIO (COMPARTILHADO CADASTRO/EDIÇÃO) === */
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            
                            {(aba === 'loja' || aba === 'fornecedor') && (
                                <>
                                    <div style={{ gridColumn: '1 / -1', fontWeight: 'bold', color: 'var(--cor-primary)', borderBottom: '1px solid #eee', paddingBottom: '5px', marginBottom: '5px' }}>DADOS GERAIS</div>
                                    
                                    {/* CNPJ - IMaskInput */}
                                    <div>
                                        <label style={labelStyle}>CNPJ</label>
                                        <IMaskInput 
                                            mask="00.000.000/0000-00"
                                            name="cnpj" 
                                            value={form.cnpj} 
                                            onAccept={(value) => handleMaskChange(value, 'cnpj')} 
                                            style={{...inputStyle, background: editandoId ? '#f5f5f5' : 'white', cursor: editandoId ? 'not-allowed' : 'text'}} 
                                            placeholder="00.000.000/0000-00"
                                            readOnly={editandoId} 
                                            required
                                        />
                                    </div>

                                    <div><label style={labelStyle}>Nome Fantasia</label><input name="nome_fantasia" value={form.nome_fantasia} onChange={handleChange} style={inputStyle} required/></div>
                                    <div><label style={labelStyle}>Razão Social</label><input name="razao_social" value={form.razao_social} onChange={handleChange} style={inputStyle} required/></div>
                                    
                                    {/* TELEFONE - IMaskInput (Máscara Dinâmica) */}
                                    <div>
                                        <label style={labelStyle}>Telefone</label>
                                        <IMaskInput
                                            mask={[
                                                { mask: '(00) 0000-0000' }, 
                                                { mask: '(00) 00000-0000' }
                                            ]}
                                            name="telefone" 
                                            value={form.telefone} 
                                            onAccept={(value) => handleMaskChange(value, 'telefone')} 
                                            style={inputStyle}
                                            placeholder="(00) 00000-0000"
                                            required
                                        />
                                    </div>
                                    
                                    {!editandoId && (
                                        <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>E-mail (Será o Login do sistema)</label><input name="email" value={form.email} onChange={handleChange} style={inputStyle} type="email" required/></div>
                                    )}

                                    <div style={{ gridColumn: '1 / -1', fontWeight: 'bold', color: 'var(--cor-primary)', marginTop: '15px', borderBottom: '1px solid #eee', paddingBottom: '5px', marginBottom: '5px' }}>ENDEREÇO</div>
                                    
                                    {/* CEP - IMaskInput */}
                                    <div>
                                        <label style={labelStyle}>CEP</label>
                                        <IMaskInput 
                                            mask="00000-000"
                                            name="cep" 
                                            value={form.cep} 
                                            onAccept={(value) => handleMaskChange(value, 'cep')} 
                                            style={inputStyle}
                                            placeholder="00000-000"
                                            required
                                        />
                                    </div>
                                    
                                    <div><label style={labelStyle}>Logradouro</label><input name="logradouro" value={form.logradouro} onChange={handleChange} style={inputStyle} required/></div>
                                    <div><label style={labelStyle}>Número</label><input name="numero" value={form.numero} onChange={handleChange} style={inputStyle} required/></div>
                                    <div><label style={labelStyle}>Bairro</label><input name="bairro" value={form.bairro} onChange={handleChange} style={inputStyle} required/></div>
                                    <div><label style={labelStyle}>Cidade</label><input name="cidade" value={form.cidade} onChange={handleChange} style={inputStyle} required/></div>
                                    <div>
                                        <label style={labelStyle}>Estado</label>
                                        <select name="estado" value={form.estado} onChange={handleChange} style={inputStyle} required>
                                            <option value="">Selecione...</option>
                                            {estados.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                                        </select>
                                    </div>
                                </>
                            )}

                            {aba === 'produto' && (
                                <>
                                    <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Nome do Produto</label><input name="produto" value={form.produto} onChange={handleChange} required style={inputStyle}/></div>
                                    <div><label style={labelStyle}>Valor (R$)</label><input name="valor_produto" type="number" step="0.01" value={form.valor_produto} onChange={handleChange} required style={inputStyle}/></div>
                                    <div>
                                        <label style={labelStyle}>Categoria</label>
                                        <select name="id_categoria" value={form.id_categoria} onChange={handleChange} required style={inputStyle}>
                                            <option value="">Selecione...</option>
                                            {listaCategorias.map(c => <option key={c.id} value={c.id}>{c.nome_categoria}</option>)}
                                        </select>
                                    </div>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <label style={labelStyle}>Fornecedor</label>
                                        <select name="id_fornecedor" value={form.id_fornecedor} onChange={handleChange} required style={inputStyle}>
                                            <option value="">Selecione...</option>
                                            {listaFornecedores.map(f => <option key={f.id} value={f.id}>{f.nome_fantasia} - {f.cnpj}</option>)}
                                        </select>
                                    </div>
                                </>
                            )}

                            <div style={{ gridColumn: '1 / -1', marginTop: '10px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button type="submit" style={{ background: editandoId ? '#ffc107' : '#28a745', color: editandoId ? '#333' : 'white', border: 'none', padding: '12px 25px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' }}>
                                    {editandoId ? 'SALVAR ALTERAÇÕES' : 'CADASTRAR NOVO'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}

// ... (Estilos permanecem iguais)
const thStyle = { padding: '10px', color: '#555', borderBottom: '2px solid #eee', fontSize: '0.9rem' };
const tdStyle = { padding: '10px', color: '#333', fontSize: '0.9rem' };

const inputStyle = { 
    width: '100%', 
    padding: '8px 10px', 
    borderRadius: '4px', 
    border: '1px solid #ccc',
    fontSize: '0.9rem', 
    outline: 'none',
    boxSizing: 'border-box' 
};

const labelStyle = { display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '0.85rem', color: '#444' };
const btnActionStyle = { border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };