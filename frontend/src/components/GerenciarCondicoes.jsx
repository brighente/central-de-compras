import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { FaTrash, FaEdit } from 'react-icons/fa';

const GerenciarCondicoes = () => {
    const { authState } = useContext(AuthContext);
    const [regras, setRegras] = useState([]);
    
    // Inputs
    const [estado, setEstado] = useState('');
    const [cashback, setCashback] = useState('');
    const [prazo, setPrazo] = useState('');
    const [acrescimo, setAcrescimo] = useState('');

    const [editingId, setEditingId] = useState(null);

    // Helper para token
    const getToken = () => authState?.token || localStorage.getItem('token');

    useEffect(() => {
        fetchRegras();
    }, []);

    const fetchRegras = async () => {
        try {
            const token = getToken();
            const res = await fetch('http://localhost:3001/api/condicoes', {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            // Verifica resposta antes de converter para JSON
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Erro API (${res.status}): Conteúdo não é JSON válido.`);
            }

            const data = await res.json();
            setRegras(data);
        } catch (error) {
            console.error('Erro ao buscar regras:', error);
        }
    };

    const handleEdit = (item) => {
        setEditingId(item.id);
        setEstado(item.estado); 
        setCashback(item.valor_cashback_percentual);
        setPrazo(item.prazo_pagamento_dias);
        setAcrescimo(item.acrescimo_desconto_unitario_valor);
    };

    const handleCancel = () => {
        setEditingId(null);
        setEstado('');
        setCashback('');
        setPrazo('');
        setAcrescimo('');
    };

    const handleSave = async (e) => {
        e.preventDefault();
        
        const payload = {
            estado, 
            valor_cashback_percentual: parseFloat(cashback), 
            prazo_pagamento_dias: parseInt(prazo), 
            acrescimo_desconto_unitario_valor: parseFloat(acrescimo)
        };

        const url = editingId ? `http://localhost:3001/api/condicoes/${editingId}` : 'http://localhost:3001/api/condicoes';
        const method = editingId ? 'PUT' : 'POST';

        try {
            const token = getToken();
            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                handleCancel();
                fetchRegras();
            } else {
                // Tenta pegar erro JSON, se falhar, usa mensagem genérica
                const err = await res.json().catch(() => ({}));
                alert(err.message || 'Erro ao salvar dados');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro de conexão.');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Deseja remover esta regra?')) return;
        try {
            const token = getToken();
            const res = await fetch(`/api/condicoes/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchRegras();
            } else {
                alert('Erro ao deletar.');
            }
        } catch (error) { 
            console.error(error); 
        }
    };

    const estadosBrasil = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

    return (
        <div className="p-4 bg-white shadow rounded">
            <h2 className="text-xl font-bold mb-4">Gerenciar Condições por Estado</h2>
            
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end mb-6 bg-gray-50 p-4 rounded border">
                <div>
                    <label className="block text-xs font-bold mb-1">Estado</label>
                    <select 
                        value={estado} 
                        onChange={e => setEstado(e.target.value)} 
                        className="border p-2 rounded w-full"
                        disabled={!!editingId}
                        required
                    >
                        <option value="">Selecione</option>
                        {estadosBrasil.map(uf => <option value={uf} key={uf}> {uf} </option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold mb-1">Cashback (%)</label>
                    <input type="number" step="0.01" value={cashback} onChange={e => setCashback(e.target.value)} className="border p-2 rounded w-full"/>
                </div>

                <div>
                    <label className="block text-xs font-bold mb-1">Prazo (Dias)</label>
                    <input type="number" value={prazo} onChange={e => setPrazo(e.target.value)} className="border p-2 rounded w-full"/>
                </div>

                <div>
                    <label className="block text-xs font-bold mb-1">Acrés/Desc (R$)</label>
                    <input type="number" step="0.01" value={acrescimo} onChange={e => setAcrescimo(e.target.value)} className="border p-2 rounded w-full"/>
                </div>

                <div className="flex gap-2">
                    <button type="submit" className={`w-full py-2 rounded text-white font-semibold ${editingId ? 'bg-blue-600' : 'bg-green-600'}`}>
                        {editingId ? 'Salvar' : 'Adicionar'}
                    </button>
                    {editingId && (
                        <button type="button" onClick={handleCancel} className="px-3 bg-red-400 rounded text-white font-bold">✕</button>
                    )}
                </div>
            </form>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b bg-gray-100">
                            <th className="p-2">UF</th>
                            <th className="p-2">Cashback</th>
                            <th className="p-2">Prazo</th>
                            <th className="p-2">Acréscimo</th>
                            <th className="p-2 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {regras && regras.map(r => (
                            <tr key={r.id} className="border-b hover:bg-gray-50">
                                <td className="p-2 font-bold">{r.estado}</td>
                                <td className="p-2">{r.valor_cashback_percentual ? `${r.valor_cashback_percentual}%` : '-'}</td>
                                <td className="p-2">{r.prazo_pagamento_dias ? `${r.prazo_pagamento_dias} dias` : '-'}</td>
                                <td className="p-2">{r.acrescimo_desconto_unitario_valor ? `R$ ${r.acrescimo_desconto_unitario_valor}` : '-'}</td>
                                <td className="p-2 text-right">
                                    <button onClick={() => handleEdit(r)} className="text-blue-600 mr-3 font-medium"> <FaEdit className="mr-1" /> </button>
                                    <button onClick={() => handleDelete(r.id)} className="text-red-600 font-medium"> <FaTrash /> </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default GerenciarCondicoes;