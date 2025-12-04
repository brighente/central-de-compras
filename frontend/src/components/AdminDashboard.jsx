import React, { useState, useContext, useEffect } from 'react'; // Importando o context
import AuthContext from '../context/AuthContext';
import SidebarAdmin from './SidebarAdmin';

export default function AdminDashboard(){
    const { logout, authState } = useContext(AuthContext);  // Pega a função logout e o estado de auth
    const [aba, setAba] = useState('loja');
    const [resultado, setResultado] = useState(null);

    const [listaFornecedores, setListaFornecedores] = useState([]);
    const [listaCategorias, setListaCategorias] = useState([]);

    const [form, setForm] = useState({
        nome_fantasia: '', razao_social: '', cnpj: '', email: '', telefone: '', logradouro: '', numero: '', bairro: '', cidade: '', estado: 'SC', cep: '', produto: '', valor_produto: '', id_categoria: '', id_fornecedor: ''
    });

    useEffect(() => {
        if(aba === 'produto'){
            fetch('http://localhost:3001/api/admin/lista-fornecedores', {
                headers: {
                    'Authorization': `Bearer ${authState.token}`
                }
            }).then(res => res.json()).then(setListaFornecedores);

            fetch('http://localhost:3001/api/admin/lista-categorias', {
                headers: {
                    'Authorization': `Bearer ${authState.token}`
                }
            }).then(res => res.json()).then(setListaCategorias);
        }
    }, [aba, authState.token])

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setResultado(null);

        let url = 'http://localhost:3001/api/admin';
        if(aba === 'loja') url += '/loja'
        else if(aba === 'fornecedor') url += '/fornecedor'
        else if(aba === 'produto') url += '/produtos'

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authState.token}`
                },
                body: JSON.stringify(form)
            });

            const data = await res.json();

            if(res.ok){
                setResultado(data);
                setForm(prev => ({
                    ...prev, nome_fantasia: '', produto: '', email: '', valor_produto: ''
                }))
                alert(data.message);
            } else {
                alert('Erro ' + data.message);
            }
        } catch(err) {
            console.error(err);
            alert('Erro ao conectar com o servidor')
        }
    }

    const estados = [ 'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO' ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f6f8' }}>
            
            {/* 1. SIDEBAR */}
            <SidebarAdmin aoClicar={setAba} onLogout={logout} />

            {/* 2. CONTEÚDO PRINCIPAL */}
            <div style={{ flex: 1, padding: '40px' }}>
                
                <h1 style={{ color: '#333', marginBottom: '30px', fontSize: '2rem' }}>
                    Cadastro de {aba.charAt(0).toUpperCase() + aba.slice(1)}
                </h1>

                {/* CARD BRANCO DO FORMULÁRIO */}
                <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        
                        {/* --- FORMULÁRIO LOJA OU FORNECEDOR --- */}
                        {(aba === 'loja' || aba === 'fornecedor') && (
                            <>
                                <div style={{ gridColumn: '1 / -1', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px', color: '#888', fontWeight: 'bold', fontSize: '0.9rem' }}>DADOS {aba.toUpperCase()}</div>
                                
                                <div>
                                    <label style={labelStyle}>CNPJ</label>
                                    <input name="cnpj" value={form.cnpj} onChange={handleChange} required style={inputStyle} placeholder="00.000.000/0001-00"/>
                                </div>
                                
                                <div>
                                    <label style={labelStyle}>Telefone</label>
                                    <input name="telefone" value={form.telefone} onChange={handleChange} style={inputStyle} placeholder="(00) 0000-0000"/>
                                </div>

                                <div>
                                    <label style={labelStyle}>Nome Fantasia</label>
                                    <input name="nome_fantasia" value={form.nome_fantasia} onChange={handleChange} required style={inputStyle} />
                                </div>

                                <div>
                                    <label style={labelStyle}>Razão Social</label>
                                    <input name="razao_social" value={form.razao_social} onChange={handleChange} style={inputStyle} />
                                </div>

                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={labelStyle}>E-mail de Acesso (Login)</label>
                                    <input name="email" type="email" value={form.email} onChange={handleChange} required style={{...inputStyle, backgroundColor: '#f0f8ff'}} />
                                </div>

                                <div style={{ gridColumn: '1 / -1', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px', marginTop: '20px', color: '#888', fontWeight: 'bold', fontSize: '0.9rem' }}>ENDEREÇO</div>

                                <div>
                                    <label style={labelStyle}>CEP</label>
                                    <input name="cep" value={form.cep} onChange={handleChange} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Cidade</label>
                                    <input name="cidade" value={form.cidade} onChange={handleChange} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Logradouro</label>
                                    <input name="logradouro" value={form.logradouro} onChange={handleChange} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Bairro</label>
                                    <input name="bairro" value={form.bairro} onChange={handleChange} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Número</label>
                                    <input name="numero" value={form.numero} onChange={handleChange} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Estado</label>
                                    <select name="estado" value={form.estado} onChange={handleChange} style={inputStyle}>
                                        {estados.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                                    </select>
                                </div>
                            </>
                        )}

                        {/* --- FORMULÁRIO PRODUTO --- */}
                        {aba === 'produto' && (
                            <>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={labelStyle}>Nome do Produto</label>
                                    <input name="produto" value={form.produto} onChange={handleChange} required style={inputStyle} placeholder="Ex: Cimento CP II" />
                                </div>

                                <div>
                                    <label style={labelStyle}>Valor Unitário (R$)</label>
                                    <input name="valor_produto" type="number" step="0.01" value={form.valor_produto} onChange={handleChange} required style={inputStyle} placeholder="0.00" />
                                </div>

                                <div>
                                    <label style={labelStyle}>Categoria</label>
                                    <select name="id_categoria" value={form.id_categoria} onChange={handleChange} required style={inputStyle}>
                                        <option value="">Selecione...</option>
                                        {listaCategorias.map(c => (
                                            <option key={c.id} value={c.id}>{c.nome_categoria}</option>
                                        ))}
                                    </select>
                                </div>

                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={labelStyle}>Fornecedor Responsável</label>
                                    <select name="id_fornecedor" value={form.id_fornecedor} onChange={handleChange} required style={inputStyle}>
                                        <option value="">Selecione o Fornecedor...</option>
                                        {listaFornecedores.map(f => (
                                            <option key={f.id} value={f.id}>{f.nome_fantasia} (CNPJ: {f.cnpj})</option>
                                        ))}
                                    </select>
                                    <small style={{color: '#999'}}>* O produto será vinculado ao estoque deste fornecedor.</small>
                                </div>
                            </>
                        )}

                        <div style={{ gridColumn: '1 / -1', marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                            <button type="submit" style={{ background: '#28a745', color: 'white', border: 'none', padding: '15px 30px', borderRadius: '5px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                                SALVAR CADASTRO
                            </button>
                        </div>

                    </form>

                    {/* RESULTADO (SENHA TEMP) */}
                    {resultado && resultado.credenciais && (
                        <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '8px', color: '#155724' }}>
                            <h3 style={{marginTop: 0}}>✅ Cadastro Realizado com Sucesso!</h3>
                            <div style={{ background: 'white', padding: '15px', borderRadius: '5px', border: '1px dashed #28a745' }}>
                                <p><strong>Usuário:</strong> {resultado.credenciais.usuario}</p>
                                <p><strong>Senha Temporária:</strong> <span style={{fontSize: '1.2rem', color: '#d63384', fontWeight: 'bold'}}>{resultado.credenciais.senha_temporaria}</span></p>
                                <small style={{ color: '#666' }}>* Copie esta senha agora. Ela não será mostrada novamente.</small>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

// Estilos inline para facilitar (pode mover pro CSS depois)
const inputStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box'
};

const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    fontSize: '0.9rem',
    color: '#555'
};