import React, { useState, useContext, useEffect } from 'react';
import AuthContext from '../../context/AuthContext';
import SidebarAdmin from './SidebarAdmin';
import { FaTrash, FaEdit, FaTimes } from 'react-icons/fa';

export default function AdminDashboard(){
    const { logout, authState } = useContext(AuthContext);
    
    const [aba, setAba] = useState('loja'); 
    const [editandoId, setEditandoId] = useState(null); // NULL = Criando novo, ID = Editando
    const [resultado, setResultado] = useState(null);
    
    const [listaFornecedores, setListaFornecedores] = useState([]);
    const [listaCategorias, setListaCategorias] = useState([]);
    const [dadosTabela, setDadosTabela] = useState([]);

    // Estado inicial do form limpo
    const initialFormState = {
        nome_fantasia: '', razao_social: '', cnpj: '', email: '', telefone: '', 
        logradouro: '', numero: '', bairro: '', cidade: '', estado: 'SC', cep: '', 
        produto: '', valor_produto: '', id_categoria: '', id_fornecedor: ''
    };

    const [form, setForm] = useState(initialFormState);

    // EFEITOS (Carregar dados)
    useEffect(() => {
        const headers = { 'Authorization': `Bearer ${authState.token}` };

        if(aba === 'produto' || aba === 'lista_produto'){
            // Precisamos dos selects tanto para cadastrar quanto para editar na lista
            fetch('http://localhost:3001/api/admin/lista-fornecedores', { headers }).then(res => res.json()).then(setListaFornecedores);
            fetch('http://localhost:3001/api/admin/lista-categorias', { headers }).then(res => res.json()).then(setListaCategorias);
        }

        if(aba.startsWith('lista_')){
            // Se mudou para lista, limpa o modo edição
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

    // FUNÇÃO: PREPARAR EDIÇÃO
    const handleEdit = (item) => {
        setEditandoId(item.id);
        setResultado(null);

        // Preenche o formulário com os dados da linha clicada
        // O spread operator (...) joga tudo que veio do banco no form. 
        // Ajustamos campos específicos se o nome no banco for diferente do name do input
        setForm({
            ...item, 
            // Garante que campos numéricos venham como string para o input não reclamar
            valor_produto: item.valor_produto || '',
            id_categoria: item.id_categoria || '',
            id_fornecedor: item.id_fornecedor || ''
        });

        // Troca a aba para o formulário correspondente
        if(aba === 'lista_loja') setAba('loja');
        if(aba === 'lista_fornecedor') setAba('fornecedor');
        if(aba === 'lista_produto') setAba('produto');
    };

    const cancelarEdicao = () => {
        setEditandoId(null);
        setForm(initialFormState);
        setResultado(null);
    };

    const handleDelete = async (id) => {
        if(!window.confirm("Confirmar exclusão?")) return;
        let tipo = aba === 'lista_loja' ? 'loja' : aba === 'lista_fornecedor' ? 'fornecedor' : 'produto';

        try {
            const res = await fetch(`http://localhost:3001/api/admin/${tipo}/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${authState.token}` }
            });
            if(res.ok){
                setDadosTabela(prev => prev.filter(item => item.id !== id));
                alert('Excluído com sucesso!');
            } else {
                alert('Erro ao excluir.');
            }
        } catch(err) { alert('Erro de conexão.'); }
    };

    // SUBMIT (CRIAR OU EDITAR)
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        let url = 'http://localhost:3001/api/admin';
        let method = 'POST';

        // Lógica da URL
        if(editandoId) {
            method = 'PUT'; // Se tem ID, é Edição
            if(aba === 'loja') url += `/loja/${editandoId}`;
            else if(aba === 'fornecedor') url += `/fornecedor/${editandoId}`;
            else if(aba === 'produto') url += `/produto/${editandoId}`;
        } else {
            // Se não tem ID, é Criação
            if(aba === 'loja') url += '/loja';
            else if(aba === 'fornecedor') url += '/fornecedor';
            else if(aba === 'produto') url += '/produtos';
        }

        try {
            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authState.token}` },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            
            if(res.ok){
                setResultado(data);
                if(!editandoId) {
                    // Se criou novo, limpa o form. Se editou, mantém para ver as mudanças.
                    setForm(initialFormState); 
                }
                alert(data.message);
            } else {
                alert('Erro: ' + data.message);
            }
        } catch(err) {
            alert('Erro ao conectar com servidor');
        }
    };

    // ... (Mantenha lista de estados e estilos igual antes)
    const estados = [ 'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO' ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f6f8' }}>
            <SidebarAdmin aoClicar={(novaAba) => { setAba(novaAba); setEditandoId(null); setForm(initialFormState); }} onLogout={logout} />

            <div style={{ flex: 1, padding: '40px' }}>
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

                {/* === TABELA === */}
                {aba.startsWith('lista_') ? (
                    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                                    <th style={thStyle}>ID</th>
                                    <th style={thStyle}>Nome / Produto</th>
                                    {aba === 'lista_produto' && <th style={thStyle}>Fornecedor</th>} {/* NOVA COLUNA */}
                                    {aba !== 'lista_produto' && <th style={thStyle}>CNPJ / Email</th>}
                                    {aba === 'lista_produto' ? <th style={thStyle}>Preço</th> : <th style={thStyle}>Cidade</th>}
                                    <th style={thStyle}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dadosTabela.map(item => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={tdStyle}>#{item.id}</td>
                                        <td style={tdStyle}>{item.nome_fantasia || item.produto}</td>
                                        
                                        {/* EXIBE FORNECEDOR SE FOR PRODUTO */}
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
                                                : `${item.cidade}/${item.estado}`}
                                        </td>
                                        
                                        <td style={tdStyle}>
                                            <div style={{display:'flex', gap:'10px'}}>
                                                {/* BOTÃO EDITAR */}
                                                <button onClick={() => handleEdit(item)} style={{...btnActionStyle, background: '#ffc107', color: '#333'}} title="Editar">
                                                    <FaEdit />
                                                </button>
                                                {/* BOTÃO EXCLUIR */}
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
                    <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            
                            {(aba === 'loja' || aba === 'fornecedor') && (
                                <>
                                    <div style={{ gridColumn: '1 / -1', fontWeight: 'bold', color: '#007bff' }}>DADOS GERAIS</div>
                                    <div><label style={labelStyle}>CNPJ</label><input name="cnpj" value={form.cnpj} onChange={(e) => setForm({...form, cnpj: e.target.value})} disabled={!!editandoId} style={{...inputStyle, background: editandoId ? '#eee' : 'white'}} placeholder="Apenas leitura na edição"/></div>
                                    <div><label style={labelStyle}>Nome Fantasia</label><input name="nome_fantasia" value={form.nome_fantasia} onChange={(e) => setForm({...form, nome_fantasia: e.target.value})} style={inputStyle}/></div>
                                    <div><label style={labelStyle}>Razão Social</label><input name="razao_social" value={form.razao_social} onChange={(e) => setForm({...form, razao_social: e.target.value})} style={inputStyle}/></div>
                                    <div><label style={labelStyle}>Telefone</label><input name="telefone" value={form.telefone} onChange={(e) => setForm({...form, telefone: e.target.value})} style={inputStyle}/></div>
                                    
                                    {!editandoId && (
                                        <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>E-mail (Login)</label><input name="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} style={inputStyle}/></div>
                                    )}

                                    <div style={{ gridColumn: '1 / -1', fontWeight: 'bold', color: '#007bff', marginTop: '10px' }}>ENDEREÇO</div>
                                    <div><label style={labelStyle}>CEP</label><input name="cep" value={form.cep} onChange={(e) => setForm({...form, cep: e.target.value})} style={inputStyle}/></div>
                                    <div><label style={labelStyle}>Logradouro</label><input name="logradouro" value={form.logradouro} onChange={(e) => setForm({...form, logradouro: e.target.value})} style={inputStyle}/></div>
                                    <div><label style={labelStyle}>Número</label><input name="numero" value={form.numero} onChange={(e) => setForm({...form, numero: e.target.value})} style={inputStyle}/></div>
                                    <div><label style={labelStyle}>Bairro</label><input name="bairro" value={form.bairro} onChange={(e) => setForm({...form, bairro: e.target.value})} style={inputStyle}/></div>
                                    <div><label style={labelStyle}>Cidade</label><input name="cidade" value={form.cidade} onChange={(e) => setForm({...form, cidade: e.target.value})} style={inputStyle}/></div>
                                    <div>
                                        <label style={labelStyle}>Estado</label>
                                        <select name="estado" value={form.estado} onChange={(e) => setForm({...form, estado: e.target.value})} style={inputStyle}>
                                            {estados.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                                        </select>
                                    </div>
                                </>
                            )}

                            {aba === 'produto' && (
                                <>
                                    <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Nome do Produto</label><input name="produto" value={form.produto} onChange={(e) => setForm({...form, produto: e.target.value})} required style={inputStyle}/></div>
                                    <div><label style={labelStyle}>Valor (R$)</label><input name="valor_produto" type="number" step="0.01" value={form.valor_produto} onChange={(e) => setForm({...form, valor_produto: e.target.value})} required style={inputStyle}/></div>
                                    <div>
                                        <label style={labelStyle}>Categoria</label>
                                        <select name="id_categoria" value={form.id_categoria} onChange={(e) => setForm({...form, id_categoria: e.target.value})} required style={inputStyle}>
                                            <option value="">Selecione...</option>
                                            {listaCategorias.map(c => <option key={c.id} value={c.id}>{c.nome_categoria}</option>)}
                                        </select>
                                    </div>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <label style={labelStyle}>Fornecedor</label>
                                        <select name="id_fornecedor" value={form.id_fornecedor} onChange={(e) => setForm({...form, id_fornecedor: e.target.value})} required style={inputStyle}>
                                            <option value="">Selecione...</option>
                                            {listaFornecedores.map(f => <option key={f.id} value={f.id}>{f.nome_fantasia} - {f.cnpj}</option>)}
                                        </select>
                                    </div>
                                </>
                            )}

                            <div style={{ gridColumn: '1 / -1', marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button type="submit" style={{ background: editandoId ? '#ffc107' : '#28a745', color: editandoId ? '#333' : 'white', border: 'none', padding: '15px 30px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
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

const thStyle = { padding: '12px', color: '#555', borderBottom: '2px solid #eee' };
const tdStyle = { padding: '12px', color: '#333' };
const inputStyle = { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' };
const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem', color: '#555' };
const btnActionStyle = { border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };