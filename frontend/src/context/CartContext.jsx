import React, { createContext, useState } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({children}) => {
    const [cartItens, setCartItens] = useState([]);

    const addToCart = (produto) => {
        setCartItens((prevItems) => {
            const itemExistente = prevItems.find(item => item.produto.id === produto.id);

            if(itemExistente){
                return prevItems.map((item) => {
                    return item.produto.id === produto.id ? {...item, quantidade: item.quantidade + 1} : item
                });
            }

            return [...prevItems, {produto, quantidade: 1}];
        });
    }

    const removerDoCart = (produtoId) => {
        setCartItens((prevItems) => {
            return prevItems.reduce((acumulador, item) => {
                if(item.produto.id === produtoId){
                    if(item.quantidade > 1){
                        acumulador.push({...item, quantidade: item.quantidade - 1})
                    }
                } else {
                    acumulador.push(item);
                }
                return acumulador;
            }, []);
        });
    }

    const cartTotal = cartItens.reduce((total, item) => {
        return total + (item.produto.valor_produto * item.quantidade);
    }, 0);

    const limparCart = () => {
        setCartItens([]);
    }

    return (
        <CartContext.Provider value={{cartItens, addToCart, removerDoCart, limparCart, cartTotal}}>
            {children}
        </CartContext.Provider>
    );
}

export default CartContext;