import React, { useState, useContext } from 'react'; // Importando o context
import AuthContext from '../context/AuthContext';

export default function AdminDashboard(){
    const { logout, authState } = useContext(AuthContext);  // Pega a função logout e o estado de auth
    const  [aba, setAba] = useState('loja');

    const [form, setForm] = useState({
        nome_fantasia: '', razao_social: '', cnpj: '', email: '', telefone: '', logradouro: '', numero: '', bairro: '', cidade: '', estado: 'SC', cep: ''
    });

    const [resultado, setResultado] = useState(null);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setResultado(null);

        const url = aba === 'loja'
            ? 'http://localhost:3001/api/admin/loja'
            : 'http://localhost:3001/api/admin/fornecedor';

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
                setResultado({
                    msg: data.message,
                    credenciais: data.credenciais
                });

                setForm({ ...form, nome_fantasia: '', razao_social: '', cnpj: '', email: ''});
            } else {
                alert('Erro ' + data.message);
            }
        } catch(err) {
            console.error(err);
            alert('Erro ao conectar com o servidor')
        }
    }

    const estados = [ 'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 
    'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO' ];

    return (
        <div style={{ padding: '20px', backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1 style={{ color: '#333' }}>Painel Administrativo</h1>
                <button onClick={logout} style={{ background: '#d32f2f', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}>Sair</button>
            </div>

            {/* Abas de navegação */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button 
                    onClick={() => setAba('loja')} 
                    style={{ padding: '10px 20px', borderRadius: '5px', border: 'none', background: aba === 'loja' ? '#007bff' : '#ddd', color: aba === 'loja' ? 'white' : '#333', cursor: 'pointer', fontWeight: 'bold' }}>
                    Cadastrar Loja
                </button>
                <button 
                    onClick={() => setAba('fornecedor')} 
                    style={{ padding: '10px 20px', borderRadius: '5px', border: 'none', background: aba === 'fornecedor' ? '#007bff' : '#ddd', color: aba === 'fornecedor' ? 'white' : '#333', cursor: 'pointer', fontWeight: 'bold' }}>
                    Cadastrar Fornecedor
                </button>
            </div>

            {/* Formulário de Cadastro */}
            <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <h2 style={{ marginTop: 0 }}>{aba === 'loja' ? 'Nova Loja' : 'Novo Fornecedor'}</h2>
                
                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    {/* Dados Gerais */}
                    <input name="cnpj" placeholder="CNPJ" value={form.cnpj} onChange={handleChange} required style={estiloInput} />
                    <input name="nome_fantasia" placeholder="Nome Fantasia" value={form.nome_fantasia} onChange={handleChange} required style={estiloInput} />
                    <input name="razao_social" placeholder="Razão Social" value={form.razao_social} onChange={handleChange} style={estiloInput} />
                    <input name="email" type="email" placeholder="E-mail de Acesso" value={form.email} onChange={handleChange} required style={estiloInput} />
                    <input name="telefone" placeholder="Telefone" value={form.telefone} onChange={handleChange} style={estiloInput} />

                    {/* Endereço (so aparece se for LOJA) */}
                    {aba === 'loja' && (
                        <>
                            <h3 style={{ gridColumn: '1 / -1', marginTop: '10px', marginBottom: '5px', fontSize: '1rem', color: '#666' }}>Endereço</h3>
                            <input name="cep" placeholder="CEP" value={form.cep} onChange={handleChange} style={estiloInput} />
                            <input name="logradouro" placeholder="Logradouro (Rua)" value={form.logradouro} onChange={handleChange} style={estiloInput} />
                            <input name="numero" placeholder="Número" value={form.numero} onChange={handleChange} style={estiloInput} />
                            <input name="bairro" placeholder="Bairro" value={form.bairro} onChange={handleChange} style={estiloInput} />
                            <input name="cidade" placeholder="Cidade" value={form.cidade} onChange={handleChange} style={estiloInput} />
                            <select name="estado" value={form.estado} onChange={handleChange} style={estiloInput}>
                                {estados.map((uf) => (
                                    <option key={uf} value={uf}> {uf} </option>
                                ))}
                            </select>
                        </>
                    )}

                    <button type="submit" style={{ gridColumn: '1 / -1', background: '#28a745', color: 'white', border: 'none', padding: '15px', borderRadius: '5px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
                        CADASTRAR {aba === 'loja' ? 'LOJA' : 'FORNECEDOR'}
                    </button>
                </form>

                {resultado && (
                    <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '5px', color: '#155724' }}>
                        <strong>✅ {resultado.msg}</strong>
                        <div style={{ marginTop: '10px', padding: '10px', background: 'white', border: '1px dashed #ccc' }}>
                            <p style={{ margin: '5px 0' }}>Usuário: <strong>{resultado.credenciais?.usuario}</strong></p>
                            <p style={{ margin: '5px 0' }}>Senha Temporária: <strong style={{ fontSize: '1.2rem', color: '#d63384' }}>{resultado.credenciais?.senha_temporaria}</strong></p>
                            <small style={{ color: '#666' }}>* Copie a senha agora. Ela não será exibida novamente.</small>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const estiloInput = {
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    width: '100%',
    boxSizing: 'border-box'
};