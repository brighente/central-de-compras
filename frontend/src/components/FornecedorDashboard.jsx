import React, { useContext, useState, useEffect } from 'react';
import AuthContext from '../context/AuthContext';

export default function FornecedorDashboard() {
    const { logout, authState } = useContext(AuthContext); // Pega a função logout e o estado de auth

    const [pedidos, setPedidos] = useState([]); // Estado para guardar os pedidos
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(!authState.token){ // Verifica se existe token, caso não, nem tenta nada
            return;
        }

        const fetchPedidos = async () => {
            try{
                const response = await fetch('http://localhost:3001/api/meus-pedidos', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${authState.token}` // Passa o token('passaporte')
                    }
                });

                if(!response.ok){
                    throw new Error('Falha ao buscar pedidos. Você será deslogado!');
                }

                const data = await response.json();
                setPedidos(data); // Salva os pedidos no estado
            } catch(err){
                console.error(err);
                logout(); // Desloga o usuário, já que o token ou expirou, ou é inválido
            } finally {
                setLoading(false);
            }
        };

        fetchPedidos();
    }, [authState.token, logout]); // Lista de gatilhos do 'useEffect()', para rodar novamente caso algum desses valores/funções se alterem

    return (
        <div>
            <h1>Painel FORNECEDOR</h1>
            <p>Bem-vindo, {authState.user?.email}!</p>
            <button onClick={logout}>Sair (logout)</button>
            <hr />

            <h2>Pedidos Recebidos</h2>
            {loading && <p>Carregando pedidos...</p>}

            {!loading && (
                <ul>
                    {/* o .map funciona igual js, mas troquei as {} por () pois o React entende que é um 'retorno implicito', sem precisar digitar return */}
                    {pedidos.map(pedido => (
                        <li key={pedido.id}>
                            Pedido #{pedido.id} - Valor: R$ {pedido.vl_total_pedido} - Status: {pedido.status}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}