import React, { useContext } from 'react';
import AuthContext from '../context/AuthContext';

export default function LojaDashboard() {
    const { logout, user } = useContext(AuthContext);
    
    return (
        <div>
            <h1>Painel LOJISTA</h1>
            <p>Bem-vindo, {user?.email}!</p>
            <p>Seu perfil é: {user?.perfil}</p>
            <button onClick={logout}>Sair (logout)</button>
        </div>
    );
}