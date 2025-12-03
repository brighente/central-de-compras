import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../../context/AuthContext'; // Ajuste o caminho se necessário
import { FaPlus, FaTrash, FaBoxOpen } from 'react-icons/fa';

export default function FornecedorProdutos() {
    const { authState } = useContext(AuthContext);
    
    const [meusProdutos, setMeusProdutos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    
    const [prodForm, setProdForm] = useState({ produto: '', valor_produto: '', id_categoria: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!authState.token) return;

        const headers = { 'Authorization': `Bearer ${authState.token}` };

        fetch('http://localhost:3001/api/produtos', { headers })
            .then(r => r.json())
            .then(setMeusProdutos)
            .catch(console.error);
        

        fetch('http://localhost:3001/api/admin/lista-categorias', { headers })
            .then(r => r.json())
            .then(setCategorias)
            .catch(console.error);

    }, [authState.token]);

    const handleSalvar = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('http://localhost:3001/api/produtos', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${authState.token}` 
                },
                body: JSON.stringify(prodForm)
            });

            if (res.ok) {
                alert('Produto cadastrado com sucesso!');
                setProdForm({ produto: '', valor_produto: '', id_categoria: '' });
                
                const listaAtualizada = await fetch('http://localhost:3001/api/produtos', { 
                    headers: { 'Authorization': `Bearer ${authState.token}` } 
                }).then(r => r.json());
                
                setMeusProdutos(listaAtualizada);
            } else {
                const erro = await res.json();
                alert('Erro ao cadastrar: ' + erro.message);
            }
        } catch (err) {
            alert('Erro de conexão ao salvar.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeletar = async (id) => {
        if(!confirm('Tem certeza que deseja excluir este produto do seu catálogo?')) return;

        try {
            const res = await fetch(`http://localhost:3001/api/produtos/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${authState.token}` }
            });

            if (res.ok) {
                setMeusProdutos(meusProdutos.filter(p => p.id !== id));
            } else {
                alert('Não é possível excluir produtos que já possuem histórico de vendas.');
            }
        } catch (err) {
            alert('Erro ao tentar excluir.');
        }
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
            
            {/* FORMULÁRIO DE CADASTRO */}
            <div style={{ background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', height: 'fit-content' }}>
                <h2 style={{ marginTop: 0, color: '#009933', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaPlus size={16} /> Novo Produto
                </h2>
                <p style={{fontSize: '0.85rem', color: '#666', marginBottom: '20px'}}>Adicione itens ao seu catálogo de vendas.</p>

                <form onSubmit={handleSalvar} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                        <label style={labelStyle}>Nome do Produto</label>
                        <input 
                            style={inputStyle} 
                            value={prodForm.produto} 
                            onChange={e => setProdForm({...prodForm, produto: e.target.value})} 
                            required 
                            placeholder="Ex: Cimento CP II 50kg" 
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>Preço Unitário (R$)</label>
                        <input 
                            type="number" 
                            step="0.01" 
                            style={inputStyle} 
                            value={prodForm.valor_produto} 
                            onChange={e => setProdForm({...prodForm, valor_produto: e.target.value})} 
                            required 
                            placeholder="0.00" 
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>Categoria</label>
                        <select 
                            style={{...inputStyle, backgroundColor: 'white'}} 
                            value={prodForm.id_categoria} 
                            onChange={e => setProdForm({...prodForm, id_categoria: e.target.value})} 
                            required
                        >
                            <option value="">Selecione...</option>
                            {categorias.map(c => (
                                <option key={c.id} value={c.id}>{c.nome_categoria}</option>
                            ))}
                        </select>
                    </div>

                    <button type="submit" disabled={loading} style={btnStyle}>
                        {loading ? 'SALVANDO...' : 'CADASTRAR PRODUTO'}
                    </button>
                </form>
            </div>

            {/* LISTA DE PRODUTOS */}
            <div style={{ background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '20px'}}>
                    <h2 style={{ margin: 0, color: '#333', fontSize: '1.2rem' }}>Meu Catálogo</h2>
                    <span style={{background: '#e9ecef', padding: '5px 10px', borderRadius: '15px', fontSize: '0.8rem', fontWeight: 'bold', color: '#666'}}>
                        {meusProdutos.length} Itens
                    </span>
                </div>
                
                {meusProdutos.length === 0 ? (
                    <div style={{textAlign: 'center', padding: '40px', color: '#999'}}>
                        <FaBoxOpen size={40} style={{marginBottom: '10px', opacity: 0.3}}/>
                        <p>Nenhum produto cadastrado ainda.</p>
                    </div>
                ) : (
                    <table style={{width: '100%', borderCollapse: 'collapse'}}>
                        <thead>
                            <tr style={{textAlign: 'left', color: '#888', borderBottom: '2px solid #eee', fontSize: '0.9rem'}}>
                                <th style={{padding: '10px'}}>Produto</th>
                                <th style={{padding: '10px'}}>Categoria</th>
                                <th style={{padding: '10px'}}>Preço</th>
                                <th style={{padding: '10px', textAlign: 'center'}}>Ação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {meusProdutos.map(p => (
                                <tr key={p.id} style={{borderBottom: '1px solid #f9f9f9'}}>
                                    <td style={{padding: '12px', fontWeight: '600', color: '#444'}}>
                                        {p.produto}
                                    </td>
                                    <td style={{padding: '12px'}}>
                                        <span style={{background: '#f0f2f5', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', color: '#666'}}>
                                            {p.nome_categoria || 'Geral'}
                                        </span>
                                    </td>
                                    <td style={{padding: '12px', color: '#009933', fontWeight: 'bold'}}>
                                        R$ {parseFloat(p.valor_produto).toFixed(2)}
                                    </td>
                                    <td style={{padding: '12px', textAlign: 'center'}}>
                                        <button 
                                            onClick={() => handleDeletar(p.id)} 
                                            title="Excluir Produto"
                                            style={{background: '#ffebee', border: 'none', color: '#c62828', cursor: 'pointer', padding: '8px', borderRadius: '4px', transition: '0.2s'}}
                                            onMouseOver={(e) => e.currentTarget.style.background = '#ffcdd2'}
                                            onMouseOut={(e) => e.currentTarget.style.background = '#ffebee'}
                                        >
                                            <FaTrash size={14}/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

const inputStyle = { 
    width: '100%', 
    padding: '12px', 
    borderRadius: '6px', 
    border: '1px solid #ddd', 
    boxSizing: 'border-box', 
    outline: 'none',
    fontSize: '0.95rem'
};

const labelStyle = { 
    display: 'block', 
    marginBottom: '6px', 
    fontWeight: '600', 
    fontSize: '0.85rem', 
    color: '#555' 
};

const btnStyle = { 
    marginTop: '10px', 
    background: '#009933', 
    color: 'white', 
    border: 'none', 
    padding: '14px', 
    borderRadius: '6px', 
    fontWeight: 'bold', 
    cursor: 'pointer', 
    width: '100%',
    fontSize: '0.9rem',
    boxShadow: '0 2px 4px rgba(0,153,51,0.2)'
};