import React, { createContext, useState, useEffect } from "react";
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null); // Cria o contexto (cerebro)

export const AuthProvider = ({ children }) => { // Cria o provedor

    const [user, setUser] = useState(null);

    useEffect(() => {   // Verificador do cofre
        const tokenSalvo = localStorage.getItem('authToken'); // Busca o token no localStorage

        if(tokenSalvo){
            try{
                const decodedUser = jwtDecode(tokenSalvo);
                setUser(decodedUser);
            } catch(err){
                localStorage.removeItem('authToken');
            }
        }
    }, []) // Usar [] garante que o código rode só uma vez

    const login = (token) => {  // Essa função vai ser usado no loginPage
        try {
            const decodedUser = jwtDecode(token);
            localStorage.setItem('authToken', token); // salvamos o token no localStorage
            setUser(decodedUser);
        } catch(err){
            console.error("Erro ao decodificar token no login: ", err);
        }

    }

    const logout = () => {
        localStorage.removeItem('authToken'); // Removemos o token do localStorage
        setUser(null); // Limpamos o componente
    }

    return (
        <AuthContext.Provider value={{user, login, logout}}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
