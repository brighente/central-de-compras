import React, { useState, useEffect, useContext } from 'react';
import { FaPlus, FaSave, FaTimes, FaEdit, FaTrash } from 'react-icons/fa';
import AuthContext from '../context/AuthContext';

const GerenciarPagamentos = () => {
    const { authState } = useContext(AuthContext);
    const [formas, setFormas] = useState([]);
    const [descricao, setDescricao] = useState('');
    const [editingId, setEditingId] = useState(null);

    // Helper para garantir o token
    const getToken = () => authState?.token || localStorage.getItem('token');

    useEffect(() => {
        fetchFormas();
    }, []);

    const fetchFormas = async () => {
        try {
            const token = getToken();
            const res = await fetch('http://localhost:3001/api/condicoes/pagamento', {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json' // Importante para pedir JSON explicitamente
                }
            });

            // Verifica se a resposta foi sucesso (200-299)
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Erro na API (${res.status}): ${text.substring(0, 50)}...`); 
            }

            const data = await res.json();
            setFormas(data);
        } catch (error) {
            console.error('Erro ao buscar formas:', error);
            // Opcional: setFormas([]) para evitar erros de map
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        
        const url = editingId 
            ? `/api/condicoes/pagamento/${editingId}` 
            : '/api/condicoes/pagamento';
        const method = editingId ? 'PUT' : 'POST';

        try {
            const token = getToken();
            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ descricao })
            });

            if (res.ok) {
                setDescricao('');
                setEditingId(null);
                fetchFormas();
            } else {
                const errData = await res.json().catch(() => ({}));
                alert(errData.message || 'Erro ao salvar');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro de conexão ao tentar salvar.');
        }
    };

    const handleEdit = (item) => {
        setDescricao(item.descricao);
        setEditingId(item.id);
    };

    const handleCancelEdit = () => {
        setDescricao('');
        setEditingId(null);
    };

    const handleDelete = async (id) => {
        if(!confirm('Tem certeza?')) return;
        try {
            const token = getToken();
            const res = await fetch(`/api/condicoes/pagamento/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (res.ok) {
                fetchFormas();
            } else {
                alert('Erro ao excluir item.');
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="p-4 bg-white shadow rounded">
            <h2 className="text-xl font-bold mb-4">Gerenciar Pagamentos</h2>

            <form onSubmit={handleSave} className="flex gap-2 mb-6 items-end">
                <div className="flex-1">
                    <label className="block text-sm font-medium">Descrição</label>
                    <input 
                        type="text" 
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                        placeholder="Ex: Boleto 30/60 dias"
                        className="border p-2 rounded w-full"
                        required
                    />
                </div>
                
                <button type="submit" className={`px-4 py-2 rounded text-white flex items-center ${editingId ? 'bg-blue-600' : 'bg-green-600'}`}>
                    {editingId ? <FaSave className="mr-2" /> : <FaPlus className="mr-2" />}
                    {editingId ? 'Atualizar' : 'Adicionar'}
                </button>
                
                {editingId && (
                    <button type="button" onClick={handleCancelEdit} className="px-4 py-2 bg-gray-400 rounded text-white flex items-center">
                        <FaTimes className="mr-2" />
                        Cancelar
                    </button>
                )}
            </form>

            <ul className="divide-y">
                {formas && formas.map(item => (
                    <li key={item.id} className="py-3 flex justify-between items-center">
                        <span>{item.descricao}</span>
                        <div className="flex gap-2">
                            <button onClick={() => handleEdit(item)} className="text-blue-500 hover:text-blue-700 font-medium flex items-center">
                                <FaEdit className="mr-1" /> Editar
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 font-medium flex items-center">
                                <FaTrash className="mr-1" /> Excluir
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default GerenciarPagamentos;