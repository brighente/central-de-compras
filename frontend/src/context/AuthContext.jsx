import React, { createContext, useState, useEffect } from "react";

const AuthContext = createContext(null); // Cria o contexto (cerebro)

export const AuthProvider = ({ children }) => { // Cria o provedor

    const [authToken, setAuthToken] = useState(null); // Cria o estado do token, iniciado como null

    useEffect(() => {   // Verificador do cofre
        const tokenSalvo = localStorage.getItem('authToken'); // Busca o token no localStorage

        if(tokenSalvo){
            setAuthToken(tokenSalvo);
        }
    }, []) // Usar [] garante que o código rode só uma vez

    const login = (token) => {  // Essa função vai ser usado no loginPage
        localStorage.setItem('authToken', token); // salvamos o token no localStorage
        setAuthToken(token); // salvamos o token no Estado
    }

    const logout = (token) => {
        localStorage.removeItem(); // Removemos o token do localStorage
        setAuthToken(null) // Limpamos o componente
    }

    return (
        <AuthContext.Provider value={{authToken, login, logout}}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
