import React, { useContext } from 'react';
import AuthContext from '../context/AuthContext';

export default function LojaDashboard() {
    const { logout, authState } = useContext(AuthContext); // Pega a função logout e o estado de auth
    
    return (
        <div>
            <h1>Painel LOJISTA</h1>
            <p>Bem-vindo, {authState.user?.email}!</p>
            <p>Seu perfil é: {authState.user?.perfil}</p>
            <button onClick={logout}>Sair (logout)</button>
        </div>
    );
}