import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';

export default function GerenciarProdutos(){
    const { authState } = useContext(AuthContext);

    const [produtos, setProdutos] = useState([]);
    const [categorias, setCategorias] = useState([]);

    const [formData, setFormData] = useState({
        id: null,
        produto: '',
        valor_produto: '',
        id_categoria: ''
    });

    const [isEditing, setIsEditing] = useState(false);

    const carregarDados = async () => {
        try{
            const resProdutos = await fetch('http://localhost:3001/api/produtos', {
                headers: {'Authorization': `Bearer ${authState.token}`}
            });
            const dataProdutos = await resProdutos.json();
            setProdutos(dataProdutos);

            const resCategorias = await fetch('http://localhost:3001/api/produtos/categorias', {
                headers: {'Authorization': `Bearer ${authState.token}`}
            });
            const dataCategorias = await resCategorias.json();
            setCategorias(dataCategorias);

            if(dataCategorias.length > 0 && !formData.id_categoria){
                setFormData((prev) => ({ ...prev, id_categoria: dataCategorias[0].id }))
            }
        } catch(err){
            console.error('Erro ao carregar os dados: ', err);
        }
    };

    useEffect(() => {
        carregarDados();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const url = isEditing ? `http://localhost:3001/api/produtos/${formData.id}` : 'http://localhost:3001/api/produtos';

        const method = isEditing ? 'PUT' : 'POST';

        try{
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authState.token}`
                },
                body: JSON.stringify(formData)
            });

            if(response.ok){
                alert(isEditing ? 'Produto atualizado' : 'Produto cadastrado');
                limparFormulario();
                carregarDados();
            } else {
                alert('Erro ao salvar');
            }
        } catch(err){
            console.error(err);
        }
    };

    const handleEditar = (prod) => {
        setFormData({
            id: prod.id,
            produto: prod.produto,
            valor_produto: prod.valor_produto,
            id_categoria: prod.id_categoria
        });
        setIsEditing(true);
        window.scrollTo({top: 0, behavior: 'smooth'});
    }

    const handleDeletar = async (id) => {
        if(!confirm('Tem certeza que deseja excluir este produto?')) return;

        try{
            const response = await fetch(`http://localhost:3001/api/produtos/${id}`, {
                method: 'DELETE',
                headers: {'Authorization': `Bearer ${authState.token}`}
            });

            if(response.ok){
                carregarDados();
            } else {
                const data = await response.json();
                alert(data.messaage || 'Erro ao deletar');
            }
        } catch(err){
            console.error(err)
        }
    };

    const limparFormulario = () => {
        setFormData({
            id: null,
            produto: '',
            valor_produto: '',
            id_categoria: categorias.length > 0 ? categorias[0].id : ''
        });
        setIsEditing(false);
    };

    return (
        <div>
            <h2 style={{ color: 'var(--cor-sidebar)', marginBottom: '20px' }}>Gerenciar Meus Produtos</h2>
            
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', marginBottom: '30px', borderLeft: isEditing ? '5px solid orange' : '5px solid var(--cor-primary)' }}>
                <h3 style={{ marginTop: 0, fontSize: '1rem', color: '#666' }}> {isEditing ? '✏️ Editando Produto' : '✨ Adicionar Novo Produto'} </h3>
            
                <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    
                    <div style={{ flex: 2, minWidth: '200px' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '5px' }}>Nome do Produto</label>
                        <input type="text" required value={formData.produto} onChange={e => setFormData({...formData, produto: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                    </div>

                    <div style={{ flex: 1, minWidth: '150px' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '5px' }}>Categoria</label>
                        <select value={formData.id_categoria} onChange={e => setFormData({...formData, id_categoria: e.target.value})} style={{ width: '100%', padding: '9px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: 'white' }}>
                            {categorias.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.nome_categoria}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ flex: 1, minWidth: '100px' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '5px' }}>Preço (R$)</label>
                        <input type="number" step="0.01" required value={formData.valor_produto} onChange={e => setFormData({...formData, valor_produto: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}/>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="submit" style={{ backgroundColor: isEditing ? 'orange' : 'var(--cor-primary)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', fontWeight: 'bold', minWidth: '100px' }}>
                            {isEditing ? 'SALVAR' : 'CADASTRAR'}
                        </button>
                        
                        {isEditing && (
                            <button type="button" onClick={limparFormulario} style={{ backgroundColor: '#ccc', color: '#333', border: 'none', padding: '10px 20px', borderRadius: '4px', fontWeight: 'bold' }}> CANCELAR </button>
                        )}
                    </div>
                </form>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {produtos.map(prod => (
                    <div key={prod.id} style={{ backgroundColor: 'white', borderRadius: '8px', padding: '15px', border: '1px solid #eee', position: 'relative', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    
                        <div style={{ paddingRight: '30px' }}>
                            <strong style={{ fontSize: '1.1rem', display: 'block', marginBottom: '5px' }}>{prod.produto}</strong>
                            <span style={{ backgroundColor: '#f0f0f0', color: '#666', fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px' }}> {prod.nome_categoria} </span>
                        </div>
                        
                        <div style={{ marginTop: '15px', fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--cor-primary)' }}>
                            R$ {prod.valor_produto}
                        </div>

                        <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '5px' }}>
                            <button onClick={() => handleEditar(prod)} title="Editar" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}> ✏️ </button>
                            <button onClick={() => handleDeletar(prod.id)} title="Excluir" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}> 🗑️ </button>
                        </div>

                    </div>
                ))}
            </div>
        </div>
    );
}