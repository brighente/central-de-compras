import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import { FaMoneyBillWave, FaClock, FaBoxOpen } from 'react-icons/fa';

// Card Reutilizável
const CardInfo = ({ titulo, valor, cor, icone }) => (
    <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', borderLeft: `5px solid ${cor}`, boxShadow: '0 2px 5px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
            <div style={{ color: '#888', fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '5px' }}>{titulo}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#333' }}>{valor}</div>
        </div>
        <div style={{ fontSize: '2rem', color: cor, opacity: 0.2 }}>{icone}</div>
    </div>
);

export default function FornecedorHome() {
    const { authState, logout } = useContext(AuthContext); 
    const [pedidos, setPedidos] = useState([]);

    useEffect(() => {
        if (!authState.token) return;

        fetch('http://localhost:3001/api/pedidos/fornecedor', {
            headers: { 'Authorization': `Bearer ${authState.token}` }
        })
        .then(async (res) => {
            if (res.status === 401) {
                alert('Sua sessão expirou. Faça login novamente.')
                logout()
                return null; 
            }
            if (!res.ok) {
                throw new Error('Erro ao buscar pedidos');
            }
            return res.json();
        })
        .then(data => {
            if (Array.isArray(data)) {
                setPedidos(data);
            } else {
                console.warn("API não retornou uma lista:", data);
                setPedidos([]);
            }
        })
        .catch(error => {
            console.error(error);
            setPedidos([]);
        });
    }, [authState.token, logout]);

    const totalVendas = Array.isArray(pedidos) 
        ? pedidos.reduce((acc, p) => acc + parseFloat(p.vl_total_pedido || 0), 0) 
        : 0;

    const qtdPendentes = Array.isArray(pedidos)
        ? pedidos.filter(p => p.status === 'PENDENTE').length
        : 0;

    const qtdTotal = Array.isArray(pedidos) ? pedidos.length : 0;

    return (
        <div>
            <h2 style={{color:'#555', marginTop:0}}>Visão Geral</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                <CardInfo titulo="Vendas Totais" valor={`R$ ${totalVendas.toFixed(2)}`} cor="#009933" icone={<FaMoneyBillWave />} />
                <CardInfo titulo="Pedidos Pendentes" valor={qtdPendentes} cor="#ffc107" icone={<FaClock />} />
                <CardInfo titulo="Total Pedidos" valor={qtdTotal} cor="#17a2b8" icone={<FaBoxOpen />} />
            </div>
        </div>
    );
}