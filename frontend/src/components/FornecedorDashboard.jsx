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
                <ul style={{ listStyle: 'none', padding: 0}}>
                    {/* o .map funciona igual js, mas troquei as {} por () pois o React entende que é um 'retorno implicito', sem precisar digitar return */}
                    {pedidos.map(pedido => (
                        <li key={pedido.id} style={{ border: '1px solid #555', padding: '10px', marginBottom: '15px'}}>
                            <div>
                                <strong>Pedido #{pedido.id}</strong> (Loja: {pedido.loja_nome})

                                <span style={{ float: 'right'}}>Total: R$ {pedido.vl_total_pedido}</span>
                            </div>
                            <div>
                                Status: {pedido.status}
                            </div>
                            <hr style={{ borderColor: '#444'}}/>
                            <strong>Itens do Pedido:</strong>
                            <ul style={{ fontSize: '0.9em'}}>
                                {pedido.itens.map( item => (
                                    <li key={item.nome_produto}>
                                        {parseFloat(item.quantidade)}x {item.nome_produto}
                                        (Categoria: {item.categoria_produto})
                                        - R$ {item.valor_unitario_praticado} cada
                                    </li>
                                ))}
                            </ul>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}