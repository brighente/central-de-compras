import React, { useState, useEffect, useContext } from 'react';
import { FaTrash, FaPlus, FaSave } from 'react-icons/fa';
import { IMaskInput } from 'react-imask'; // <--- MUDANÇA AQUI
import AuthContext from '../../context/AuthContext';

// Lista de estados para o select
const estados = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export default function PerfilLoja() {
    const { authState } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    
    const [loja, setLoja] = useState({
        nome_fantasia: '',
        razao_social: '',
        cnpj: '',
        email_login: '',
        cep: '',
        logradouro: '',
        numero: '',
        bairro: '',
        cidade: '',
        estado: ''
    });

    const [contatos, setContatos] = useState([]);

    useEffect(() => {
        const fetchDados = async () => {
            if (!authState.token) return;

            try {
                const res = await fetch('http://localhost:3001/api/perfil/loja', {
                    headers: { 'Authorization': `Bearer ${authState.token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    const { contatos: contatosData, ...rest } = data;

                    setLoja({
                        nome_fantasia: rest.nome_fantasia || '',
                        razao_social: rest.razao_social || '',
                        cnpj: rest.cnpj || '', 
                        email_login: rest.email_login || '', 
                        cep: rest.cep || '',
                        logradouro: rest.logradouro || '',
                        numero: rest.numero || '',
                        bairro: rest.bairro || '',
                        cidade: rest.cidade || '',
                        estado: rest.estado || ''
                    });

                    setContatos(contatosData || []);
                }
            } catch (error) {
                console.error("Erro ao buscar dados:", error);
            }
        };

        fetchDados();
    }, [authState.token]);

    const handleChangeLoja = (e) => {
        setLoja({ ...loja, [e.target.name]: e.target.value });
    };

    const handleChangeContato = (index, field, value) => {
        const novosContatos = [...contatos];
        novosContatos[index][field] = value;
        setContatos(novosContatos);
    };

    const addContato = () => {
        setContatos([...contatos, { nome: '', cargo: '', email: '', telefone: '' }]);
    };

    const removeContato = (index) => {
        setContatos(contatos.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // LIMPEZA: Remove formatação antes de enviar
            const lojaParaSalvar = {
                ...loja,
                cnpj: loja.cnpj.replace(/\D/g, ''),
                cep: loja.cep.replace(/\D/g, '')
            };

            const contatosParaSalvar = contatos.map(c => ({
                ...c,
                telefone: c.telefone.replace(/\D/g, '')
            }));

            const resLoja = await fetch('http://localhost:3001/api/perfil/loja', {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authState.token}`
                },
                body: JSON.stringify(lojaParaSalvar)
            });

            if(!resLoja.ok) throw new Error('Erro ao salvar dados da loja');

            const resContatos = await fetch('http://localhost:3001/api/perfil/loja/contatos', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authState.token}`
                },
                body: JSON.stringify({ contatos: contatosParaSalvar })
            });

            if(!resContatos.ok) throw new Error('Erro ao salvar contatos');
            
            alert("Dados salvos com sucesso!");

        } catch (error) {
            console.error(error);
            alert("Erro ao salvar.");
        } finally {
            setLoading(false);
        }
    };

    // Estilos
    const inputStyle = {
        width: '100%',
        padding: '10px',
        borderRadius: '6px',
        border: '1px solid #ccc',
        marginBottom: '10px'
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '5px',
        fontWeight: 'bold',
        color: '#555'
    };

    const sectionTitleStyle = {
        gridColumn: '1 / -1',
        fontWeight: 'bold',
        color: 'var(--cor-primary, #007bff)',
        borderBottom: '1px solid #eee',
        paddingBottom: '5px',
        marginBottom: '15px',
        marginTop: '10px'
    };

    return (
        <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ borderBottom: '2px solid #ddd', paddingBottom: '10px', marginBottom: '20px' }}>
                Configurações da Loja
            </h2>

            <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
                <h3 style={{ marginBottom: '15px', color: '#333' }}>Informações da Empresa</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    
                    <div style={sectionTitleStyle}>DADOS GERAIS</div>

                    <div>
                        <label style={labelStyle}>CNPJ</label>
                        {/* MÁSCARA NOVA: Usa '0' para números */}
                        <IMaskInput
                            mask="00.000.000/0000-00"
                            name="cnpj" 
                            value={loja.cnpj} 
                            onChange={handleChangeLoja} 
                            style={{...inputStyle, background: '#f5f5f5', cursor: 'not-allowed'}} 
                            readOnly 
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Razão Social</label>
                        <input name="razao_social" value={loja.razao_social} onChange={handleChangeLoja} style={inputStyle}/>
                    </div>

                    <div>
                        <label style={labelStyle}>E-mail de Login</label>
                        <input 
                            value={loja.email_login} 
                            style={{...inputStyle, background: '#f5f5f5', cursor: 'not-allowed'}} 
                            readOnly 
                        />
                    </div>
                    
                    <div>
                        <label style={labelStyle}>Nome Fantasia</label>
                        <input name="nome_fantasia" value={loja.nome_fantasia} onChange={handleChangeLoja} style={inputStyle} />
                    </div>

                    <div style={sectionTitleStyle}>ENDEREÇO</div>

                    <div>
                        <label style={labelStyle}>CEP</label>
                        {/* MÁSCARA NOVA */}
                        <IMaskInput
                            mask="00000-000"
                            name="cep" 
                            value={loja.cep} 
                            onChange={handleChangeLoja} 
                            style={inputStyle} 
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Logradouro</label>
                        <input name="logradouro" value={loja.logradouro} onChange={handleChangeLoja} style={inputStyle}/>
                    </div>
                    <div>
                        <label style={labelStyle}>Número</label>
                        <input name="numero" value={loja.numero} onChange={handleChangeLoja} style={inputStyle}/>
                    </div>
                    <div>
                        <label style={labelStyle}>Bairro</label>
                        <input name="bairro" value={loja.bairro} onChange={handleChangeLoja} style={inputStyle}/>
                    </div>
                    <div>
                        <label style={labelStyle}>Cidade</label>
                        <input name="cidade" value={loja.cidade} onChange={handleChangeLoja} style={inputStyle}/>
                    </div>
                    <div>
                        <label style={labelStyle}>Estado</label>
                        <select name="estado" value={loja.estado} onChange={handleChangeLoja} style={inputStyle}>
                            <option value="">Selecione...</option>
                            {estados.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                        </select>
                    </div>

                </div>
            </div>

            <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ margin: 0, color: '#333' }}>Contatos Responsáveis</h3>
                    <button 
                        onClick={addContato}
                        style={{ background: '#28a745', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                    >
                        <FaPlus size={12} /> Novo Contato
                    </button>
                </div>

                {contatos.map((contato, index) => (
                    <div key={index} style={{ background: '#f9f9f9', padding: '15px', borderRadius: '6px', border: '1px solid #eee', marginBottom: '15px', position: 'relative' }}>
                        <button 
                            onClick={() => removeContato(index)}
                            style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: '#dc3545', cursor: 'pointer' }}
                        >
                            <FaTrash />
                        </button>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#666' }}>Nome</label>
                                <input style={inputStyle} value={contato.nome} onChange={(e) => handleChangeContato(index, 'nome', e.target.value)} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#666' }}>Cargo</label>
                                <input style={inputStyle} value={contato.cargo} onChange={(e) => handleChangeContato(index, 'cargo', e.target.value)} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#666' }}>Email</label>
                                <input style={inputStyle} value={contato.email} onChange={(e) => handleChangeContato(index, 'email', e.target.value)} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#666' }}>Telefone</label>
                                <IMaskInput 
                                    mask={[
                                        { mask: '(00) 0000-0000' }, 
                                        { mask: '(00) 00000-0000' }
                                    ]}
                                    style={inputStyle} 
                                    value={contato.telefone} 
                                    onAccept={(value) => handleChangeContato(index, 'telefone', value)}
                                    placeholder="(00) 00000-0000"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '30px', textAlign: 'right' }}>
                <button 
                    onClick={handleSave}
                    disabled={loading}
                    style={{ background: '#007bff', color: 'white', border: 'none', padding: '12px 30px', borderRadius: '6px', fontSize: '1rem', cursor: 'pointer', opacity: loading ? 0.7 : 1, display: 'inline-flex', alignItems: 'center', gap: '10px' }}
                >
                    <FaSave /> {loading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
            </div>
        </div>
    );
}