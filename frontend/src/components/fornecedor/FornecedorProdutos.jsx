import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import { FaPlus, FaTrash, FaEdit, FaImage } from 'react-icons/fa';

export default function FornecedorProdutos() {
    const { authState, logout } = useContext(AuthContext);
    const [meusProdutos, setMeusProdutos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    
    const [editandoId, setEditandoId] = useState(null); 
    
    // Novo estado para o arquivo de imagem
    const [arquivoImagem, setArquivoImagem] = useState(null);

    const [prodForm, setProdForm] = useState({ 
        produto: '', 
        valor_produto: '', 
        id_categoria: '' 
    });

    // Headers para GET e DELETE (JSON)
    const headers = { 'Authorization': `Bearer ${authState.token}` };

    useEffect(() => {
        if (!authState.token) return;
        carregarDados();
    }, [authState.token]);

    const carregarDados = () => {
        fetch('http://localhost:3001/api/produtos', { headers })
            .then(r => { if(r.status === 401) logout(); return r.json(); })
            .then(data => Array.isArray(data) ? setMeusProdutos(data) : setMeusProdutos([]))
            .catch(console.error);

        fetch('http://localhost:3001/api/produtos/categorias', { headers })
            .then(r => r.json())
            .then(setCategorias)
            .catch(console.error);
    };

    const handleSalvar = async (e) => {
        e.preventDefault();
        try {
            let url = 'http://localhost:3001/api/produtos';
            let method = 'POST';

            if (editandoId) {
                url = `http://localhost:3001/api/produtos/${editandoId}`;
                method = 'PUT'; 
            }

            // MUDANÇA CRUCIAL: Usar FormData para enviar arquivos
            const formData = new FormData();
            formData.append('produto', prodForm.produto);
            formData.append('valor_produto', prodForm.valor_produto);
            formData.append('id_categoria', prodForm.id_categoria);
            
            // Só anexa se o usuário selecionou um arquivo
            if (arquivoImagem) {
                formData.append('imagem', arquivoImagem);
            }

            // Headers especias para FormData: NÃO setar 'Content-Type', o navegador faz isso sozinho com o boundary
            const uploadHeaders = {
                'Authorization': `Bearer ${authState.token}`
            };

            const res = await fetch(url, { 
                method, 
                headers: uploadHeaders, 
                body: formData 
            });

            if (res.ok) {
                alert(editandoId ? 'Produto atualizado!' : 'Produto cadastrado!');
                limparForm();
                carregarDados();
            } else {
                const err = await res.json();
                alert('Erro: ' + (err.message || 'Erro ao salvar'));
            }
        } catch (err) { alert('Erro de conexão'); }
    };

    const handleEditar = (p) => {
        setEditandoId(p.id);
        setProdForm({
            produto: p.produto,
            valor_produto: p.valor_produto,
            id_categoria: p.id_categoria
        });
        setArquivoImagem(null); // Reseta o arquivo selecionado ao entrar em edição
    };

    const handleDeletar = async (id) => {
        if(!confirm('Excluir este produto?')) return;
        try {
            const res = await fetch(`http://localhost:3001/api/produtos/${id}`, { method: 'DELETE', headers });
            if (res.ok) setMeusProdutos(meusProdutos.filter(p => p.id !== id));
            else alert('Erro: Produto pode ter vendas vinculadas.');
        } catch (err) { alert('Erro de conexão'); }
    };

    const limparForm = () => {
        setEditandoId(null);
        setProdForm({ produto: '', valor_produto: '', id_categoria: '' });
        setArquivoImagem(null);
        // Reseta o input file visualmente
        document.getElementById('fileInput').value = ""; 
    }

    const inputStyle = { width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', outline: 'none' };
    const btnStyle = { marginTop: '10px', background: editandoId ? '#ffc107' : '#009933', color: editandoId ? '#333' : 'white', border: 'none', padding: '12px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', width: '100%' };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
            {/* Form */}
            <div style={{ background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', height: 'fit-content' }}>
                <h2 style={{ marginTop: 0, color: '#333', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {editandoId ? <FaEdit /> : <FaPlus />} 
                    {editandoId ? ' Editar Produto' : ' Novo Produto'}
                </h2>
                
                <form onSubmit={handleSalvar} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input style={inputStyle} value={prodForm.produto} onChange={e => setProdForm({...prodForm, produto: e.target.value})} required placeholder="Nome do Produto" />
                    <input type="number" step="0.01" style={inputStyle} value={prodForm.valor_produto} onChange={e => setProdForm({...prodForm, valor_produto: e.target.value})} required placeholder="Preço (R$)" />
                    
                    <select style={inputStyle} value={prodForm.id_categoria} onChange={e => setProdForm({...prodForm, id_categoria: e.target.value})} required>
                        <option value="">Selecione Categoria...</option>
                        {categorias.map(c => <option key={c.id} value={c.id}>{c.nome_categoria}</option>)}
                    </select>

                    {/* Input de Imagem */}
                    <div>
                        <label style={{display:'block', marginBottom:'5px', fontSize:'0.9rem', color:'#666'}}>Imagem do Produto:</label>
                        <input 
                            id="fileInput"
                            type="file" 
                            accept="image/*"
                            onChange={(e) => setArquivoImagem(e.target.files[0])}
                            style={{...inputStyle, padding: '5px'}} 
                        />
                    </div>
                    
                    <button type="submit" style={btnStyle}>
                        {editandoId ? 'ATUALIZAR' : 'CADASTRAR'}
                    </button>

                    {editandoId && (
                        <button type="button" onClick={limparForm} style={{...btnStyle, background: '#6c757d', color: 'white', marginTop: '5px'}}>
                            CANCELAR EDIÇÃO
                        </button>
                    )}
                </form>
            </div>

            {/* Lista */}
            <div style={{ background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                <h2 style={{ marginTop: 0, color: '#333', fontSize: '1.2rem', marginBottom: '20px' }}>Meu Catálogo</h2>
                <table style={{width: '100%', borderCollapse: 'collapse'}}>
                    <thead>
                        <tr style={{textAlign: 'left', color: '#888', borderBottom: '1px solid #eee'}}>
                            <th style={{padding:'10px'}}>Imagem</th>
                            <th style={{padding:'10px'}}>Produto</th>
                            <th style={{padding:'10px'}}>Preço</th>
                            <th style={{textAlign:'center'}}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {meusProdutos.map(p => (
                            <tr key={p.id} style={{borderBottom: '1px solid #f9f9f9'}}>
                                <td style={{padding:'10px'}}>
                                    {p.imagemUrl ? (
                                        <img src={p.imagemUrl} alt={p.produto} style={{width:'50px', height:'50px', objectFit:'cover', borderRadius:'4px'}} />
                                    ) : (
                                        <div style={{width:'50px', height:'50px', background:'#eee', borderRadius:'4px', display:'flex', alignItems:'center', justifyContent:'center', color:'#ccc'}}>
                                            <FaImage />
                                        </div>
                                    )}
                                </td>
                                <td style={{padding:'10px', fontWeight:'bold'}}>{p.produto}</td>
                                <td style={{padding:'10px', color:'#009933'}}>R$ {parseFloat(p.valor_produto).toFixed(2)}</td>
                                <td style={{textAlign:'center', display:'flex', justifyContent:'center', gap:'10px', padding: '10px', height: '50px', alignItems: 'center'}}>
                                    <button onClick={() => handleEditar(p)} title="Editar" style={{background:'transparent', border:'none', color:'#ffc107', cursor:'pointer'}}><FaEdit size={18}/></button>
                                    <button onClick={() => handleDeletar(p.id)} title="Excluir" style={{background:'transparent', border:'none', color:'#dc3545', cursor:'pointer'}}><FaTrash size={16}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}